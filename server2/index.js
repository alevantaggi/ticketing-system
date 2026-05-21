'use strict';

require('dotenv').config();

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');


const { expressjwt: jwt } = require('express-jwt');

const jwtSecret = process.env.JWT_SECRET;

// init express
const app = express();
const port = 3002;
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

// Check token validity
app.use(jwt({
  secret: jwtSecret,
  algorithms: ["HS256"],
  // token from HTTP Authorization: header
})
);


// To return a better object in case of errors
app.use( function (err, req, res, next) {
  //console.log("DEBUG: error handling function executed");
  if (err.name === 'UnauthorizedError') {
    // Example of err content:  {"code":"invalid_token","status":401,"name":"UnauthorizedError","inner":{"name":"TokenExpiredError","message":"jwt expired","expiredAt":"2024-05-23T19:23:58.000Z"}}
    res.status(401).json({ errors: [{  'param': 'Server', 'msg': 'Authorization error', 'path': err.code }] });
  } else {
    next();
  }
} );


/*** APIs ***/

// POST /api/-stats
app.post('/api/ticket-stat', (req, res) => {
  //console.log('DEBUG: req.auth: ',req.auth);
  const authAccessLevel = req.auth.access;
  const ticket= req.body.ticket;
  const position= req.body.position;

  if (!ticket || !position) {
    return res.status(400).json({ error: 'Invalid ticket data' });
  }

  const count= ticket.title.replace(/\s/g, '').length + ticket.category.replace(/\s/g, '').length;
  const random= Math.floor(Math.random() * 240) + 1;

  if(authAccessLevel === 'admin' && position==="list"){
    const estimation= Math.floor(count * 10 + random);
    return res.json({estimation: estimation});
  }

  const estimation= Math.floor((count * 10 + random)/24);  
  res.json({estimation: estimation});
});

/*** Other express-related instructions ***/
// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
