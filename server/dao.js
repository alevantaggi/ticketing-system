'use strict';

const {Ticket, Item}= require("./Classi.js")
const db = require('./db.js');
const dayjs = require("dayjs");
const crypto = require('crypto');

/* Sanitize input */
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/* TICKET */
exports.getAllTickets= () =>{
  return new Promise((resolve, reject) => {

    const sql = "SELECT t.id, t.state, t.category, t.owner, t.title, t.timestamp, u.name FROM ticket t, users u WHERE t.owner= u.id"
    db.all(sql, [], (err, rows) => {
      const res = [];      
      if (err) {
        return reject(err);
      }
      for (let row of rows) {
        res.push(new Ticket(DOMPurify.sanitize(row.id), DOMPurify.sanitize(row.state), DOMPurify.sanitize(row.category), DOMPurify.sanitize(row.name), DOMPurify.sanitize(row.title), DOMPurify.sanitize(row.timestamp)));
      }
      res.sort((a,b) => {return dayjs(a.timestamp).isBefore(dayjs(b.timestamp)) ? 1 : -1});
      resolve(res);
     }
    );
   }
  );
}

exports.getTicketItems = (ticketID) => {
  return new Promise(async (resolve, reject) => {
    const sql = "SELECT u.name, i.block, i.timestamp FROM item i, users u WHERE i.ticketID=? AND i.authorID= u.id";
    db.all(sql, [ticketID], (err, rows) => {
      const res = [];      
      if (err) {
        return reject(err);
      }
      for (let row of rows) {
        res.push(new Item(DOMPurify.sanitize(row.name), DOMPurify.sanitize(row.block), DOMPurify.sanitize(row.timestamp)));
      }
      res.sort((a,b) => {return dayjs(a.timestamp).isAfter(dayjs(b.timestamp)) ? 1 : -1});
      resolve(res);
     }
    );
   }
  );
}

exports.addTicket= (state, category, owner, title, timestamp, block) => {
  return new Promise((resolve, reject) => {
    const sql = "insert into ticket(state, category, owner, title, timestamp) VALUES(?,?,?,?,?)"
    db.run(sql, [state, category, owner, title, timestamp], function(err, row) {
      if (err) {
        return reject(err);
      }
      const ticketID= this.lastID;
      const q= "insert into item(ticketID, authorID, block, timestamp) VALUES(?,?,?,?)";
      db.run(q, [ticketID, owner, block, timestamp], function(err, row) {
        if (err) {
          return reject(err);
        }
        resolve(true);
       }
      );
     }
    );
   }
  );
}

exports.addItem= (ticketID, userID, block, timestamp) => {
  return new Promise((resolve, reject) => {
    const sql = "insert into item(ticketID, authorID, block, timestamp) VALUES(?,?,?,?)"
    db.run(sql, [ticketID, userID, block, timestamp], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(true);
     }
    );
   }
  );
}

exports.getTicket = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM ticket WHERE id=?"
    db.get(sql, [id], (err, row) => {
      if (err) {
        return reject(err);
      }
      if(!row){
        resolve({error: 'Ticket not found!'});
      }
      resolve(new Ticket(DOMPurify.sanitize(row.id), DOMPurify.sanitize(row.state), DOMPurify.sanitize(row.category), DOMPurify.sanitize(row.owner), DOMPurify.sanitize(row.title), DOMPurify.sanitize(row.timestamp)));
     }
    );
   }
  );
};

exports.changeTicketState= (id, state) =>{
  return new Promise(function(resolve, reject) {
    const sql = "update ticket set state=? where id=?"
    db.run(sql, [state, id], function(err, row) {
      if (err) {
        return reject(err);
      }
      if(this.changes!== 1 ){
        resolve({error: "Ticket not found"});
      }
      resolve(exports.getTicket(id));
     }
    );
   }
  );
}

exports.changeCategory= (id, category) =>{
  return new Promise(function(resolve, reject) {
    const sql = "update ticket set category=? where id=?"
    db.run(sql, [category, id], function(err, row) {
      if (err) {
        return reject(err);
      }
      if(this.changes!== 1 ){
        resolve({error: "Ticket not found"});
      }
      resolve(exports.getTicket(id));
     }
    );
   }
  );
}


/* USER */
exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err){
        reject(err);
      }
      else if (row === undefined){
        resolve({ error: 'User not found.' });
      }
      else {
        const user = { id: DOMPurify.sanitize(row.id), email: DOMPurify.sanitize(row.email), name: DOMPurify.sanitize(row.name), level: DOMPurify.sanitize(row.level) }
        resolve(user);
      }
    });
  });
};

exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) {
        return reject(err);
      }
      else if (row === undefined) {
        return resolve(false);
      }
      const user = { id: DOMPurify.sanitize(row.id), email: DOMPurify.sanitize(row.email), name: DOMPurify.sanitize(row.name), level: DOMPurify.sanitize(row.level) };

      crypto.scrypt(password, row.salt, 32, (err, hashedPassword) => {
        if (err) {
          return reject(err);
        }
        if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)) {
          return resolve(false);
        }
        return resolve(user);
      });

    });
  });
};