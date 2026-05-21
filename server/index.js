'use strict';

require('dotenv').config();

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');
const {check, validationResult} = require('express-validator'); // validation middleware

const passport= require("passport");
const LocalStrategy= require("passport-local");

const session= require("express-session"); // Create the session 

/* Sanitize input */
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const DAO = require('./dao'); // module for accessing the DB.  NB: use ./ syntax for files in the same dir
const dayjs = require("dayjs");

const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const expireTime = 60; //seconds

// init express
const app = express();
const port = 3001;

app.use(cors({origin: "http://localhost:5173", credentials: true}));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

/*** Passport ***/
// set up the "username and password" login strategy with a function to verify username and password
passport.use(new LocalStrategy(async function verify(username,password,callback){
  const user= await DAO.getUser(username,password);
  if(!user){
    return callback(null, false,  {message: "Incorrect username or password"});
  }
  return callback(null, user);
}));

passport.serializeUser((user, callback) =>{
  callback(null, user.id);
});

passport.deserializeUser(async function(id, callback){
  try {
    const user= await DAO.getUserById(id);
    callback(null, user);  
  } catch (err) {
    callback(err, null);
  }
});

const isLoggedIn= (req, res, next) =>{
  if(req.isAuthenticated()){
    return next();
  }
  return res.status(401).json({error:"Not authorized"});
}

app.use(session({
  secret: process.env.SESSION_SECRET,  
  resave: false,
  saveUninitialized: false,
  cookie: {httpOnly: true}
}));

// init passport
app.use(passport.initialize()); 
app.use(passport.session());

/*** APIs ***/

/* TICKET */
// GET /api/tickets
app.get('/api/tickets', async (req, res) => {
  
  try {
    const result= await DAO.getAllTickets();
    res.json(result);

  } catch (err) {
    res.status(500).json({error: `Database error: ${err}`});
  }

});

// GET /api/tickets/items --> take all items associated with each ticket 
app.get('/api/tickets/items', isLoggedIn, async (req, res) => {
  
  try {
    const tickets= await DAO.getAllTickets();
    for(let i=0; i< tickets.length; i++){
      const elements= await DAO.getTicketItems(tickets[i].id);
      tickets[i].items= elements;
    }
    res.json(tickets);

  } catch (err) {
    res.status(500).json({error: `Database error: ${err}`});
  }

});

// POST /api/ticket
app.post('/api/ticket', isLoggedIn, [
  check('category').isString().isIn(["inquiry", "maintenance", "new feature", "administrative", "payment"]),
  check('title').trim().isString().isLength({min: 1}),
  check('block').trim().isString().isLength({min: 1})
  ], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({error: errors.array()});
  }
  
  try {
    const category= DOMPurify.sanitize(req.body.category);
    const title= DOMPurify.sanitize(req.body.title);
    const timestamp= dayjs().format('YYYY-MM-DD HH:mm:ss');
    const block= DOMPurify.sanitize(req.body.block);

    const result= await DAO.addTicket("open", category, req.user.id, title, timestamp, block);
    res.json(result);

  } catch (err) {
    res.status(503).json({ error: `Database error during the creation of new ticket: ${err}` });
  }

});

// POST /api/ticket/<id>/item
app.post('/api/ticket/:id/item', isLoggedIn, [
  check('id').isInt({min: 1}),
  check('block').trim().isString().isLength({min: 1})
  ], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({error: errors.array()});
  }
  
  try {
    const ticketID= req.params.id;
    const spy= await DAO.getTicket(ticketID); 

    if(spy.state=== "closed"){
      return res.status(401).json({error: 'Unauthorized operation!'});
    }


    const block= DOMPurify.sanitize(req.body.block);
    const timestamp= dayjs().format('YYYY-MM-DD HH:mm:ss');

    const result= await DAO.addItem(ticketID, req.user.id, block, timestamp);
    res.json(result);

  } catch (err) {
    res.status(503).json({ error: `Database error during the creation of new item for the ticket: ${err}` });
  }

});

// PUT /api/ticket/<id>/state
app.put('/api/ticket/:id/state', isLoggedIn,[
  check('id').isInt({min: 1}),
  check('state').isString().isIn(["open", "closed"]),
  ], async(req, res) => {

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({error: errors.array()});
  }
  
  try {
    const ticketID= req.params.id;
    const spy= await DAO.getTicket(ticketID);

    if(req.user.level==="admin" || (spy.owner=== req.user.id && spy.state==="open")) {
      const result= await DAO.changeTicketState(ticketID, req.body.state);
      return res.json(result);
    }
    
    res.status(401).json({error: 'Unauthorized user!'});

  } catch (err) {
    res.status(503).json({ error: `Database error while editing ticket ${req.params.id}.` });
  }
});

// PUT /api/ticket/<id>/category
app.put('/api/ticket/:id/category', isLoggedIn,[
  check('id').isInt({min: 1}),
  check('category').isString().isIn(["inquiry", "maintenance", "new feature", "administrative", "payment"])
  ], async(req, res) => {

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({error: errors.array()});
  }
  
  try {
    if(req.user.level!=="admin"){
      return res.status(401).json({error: 'Unauthorized user!'});
    }
    
    const result= await DAO.changeCategory(req.params.id, req.body.category);
    res.json(result);

  } catch (err) {
    res.status(503).json({ error: `Database error while editing ticket ${req.params.id}.` });
  }
});



/*----USER----*/
// POST api/sessions
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err){
        return next(err);
      }

      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current 
app.delete('/api/sessions/current', isLoggedIn, (req, res) => {
  req.logout(()=> {res.end();});
});

// GET /sessions/current
app.get('/api/sessions/current', (req, res) => {  
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);
  } 
  else{
  res.status(401).json({error: 'Unauthenticated user!'});
  }
});

/*** Token ***/

// GET /api/auth-token
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  let authLevel = req.user.level;

  const payloadToSign = { access: authLevel, authId: 1234 };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {expiresIn: expireTime});

  res.json({token: jwtToken, authLevel: authLevel});  // authLevel is just for debug. Anyway it is in the JWT payload
});

/*** Other express-related instructions ***/
// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
