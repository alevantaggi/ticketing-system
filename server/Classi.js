"use strict";

const dayjs = require("dayjs");

function Ticket(id, state, category, owner, title, timestamp) {
    this.id= id;
    this.state=state;
    this.category= category;
    this.owner= owner;
    this.title= title;
    this.timestamp= dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
    this.items= [];
}

function Item(author, block, timestamp) {
    this.author= author;
    this.block=block;
    this.timestamp= dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

module.exports = {Ticket: Ticket, Item: Item};