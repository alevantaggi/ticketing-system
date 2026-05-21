"use strcit";

const URL = 'http://localhost:3001/api';

/* Gestione Ticket */
async function getAllTickets() {
    try {
        const response = await fetch(URL + "/tickets");
        const tickets = await response.json();
        
        if (response.ok) {
            return tickets;
        } 
        else {
            throw tickets.error;  
        }
        
    } catch (err) {
        throw err;
    }
}

async function getTicketItems() {
    try {
        const response = await fetch(URL + "/tickets/items", {credentials: 'include'});
        const risultato = await response.json();
        
        if (response.ok) {
            return risultato;
        } 
        else {
            throw risultato.error;  
        }
        
    } catch (err) {
        throw err;
    }
}

async function addTicket(category, title, block) {  
    try {
        const response = await fetch(URL + "/ticket",{
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({category: category, title: title, block: block}),
            credentials: 'include'
        });

        if (response.ok) {
            return true;
        } else {
            const result= await response.json();
            throw result.error;  
        }

    } catch (err) {
        throw err;
    }
}

async function addItem(id, block) {  
    try {
        const response = await fetch(URL + `/ticket/${id}/item`,{
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({block: block}),
            credentials: 'include'
        });

        if (response.ok) {
            return true;
        } else {
            const result= await response.json();
            throw result.error;  
        }

    } catch (err) {
        throw err;
    }
}

async function changeTicketState(id, state) {  
    try {
        const response = await fetch(URL + `/ticket/${id}/state`,{
            method: "PUT",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({state: state}),
            credentials: 'include'
        });

        if (response.ok) {
            return true;
        } else {
            const result= await response.json();
            throw result.error;  
        }

    } catch (err) {
        throw err;
    }
}

async function changeCategory(id, category) {  
    try {
        const response = await fetch(URL + `/ticket/${id}/category`,{
            method: "PUT",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({category: category}),
            credentials: 'include'
        });

        if (response.ok) {
            return true;
        } else {
            const result= await response.json();
            throw result.error;  
        }

    } catch (err) {
        throw err;
    }
}



/*----Gestione User----*/
async function logIn(credentials) {
        let response = await fetch(URL + '/sessions', {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(credentials),
        });
        if (response.ok) {
            const user = await response.json();
            return user;
        } 
        else {
            const errDetail = await response.json();
            throw errDetail.message;
    }
}

async function logOut() {
    await fetch(URL + '/sessions/current', {method: 'DELETE', credentials: 'include'});
}

async function getUserInfo() {
        const response = await fetch(URL + '/sessions/current', {credentials: 'include'});
        const userInfo = await response.json();
        if (response.ok) {
            return userInfo;
        } 
        else {
            throw userInfo;  // an object with the error coming from the server
    }
}

/*----Gestione Token----*/
async function getAuthToken(){
    const response = await fetch(URL + '/auth-token', {
        credentials: 'include'
    });
    const token = await response.json();
    if (response.ok) {
        return token;
    } else {
        throw token;  // an object with the error coming from the server
    }
}

async function getTicketEstimation(authToken, ticket, position) {
    const response = await fetch('http://localhost:3002' + `/api/ticket-stat`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticket: ticket, position: position}),
    });
    const result = await response.json();
    if (response.ok) {
        return result.estimation;
    } else {
        throw result;  // expected to be a json object (coming from the server) with info about the error
    }
}

const API = {getAllTickets, getTicketItems, addTicket, addItem, changeTicketState, changeCategory, logIn, logOut, getUserInfo, getAuthToken, getTicketEstimation};
export default API;
