import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useState, useEffect } from 'react';
import {Table, Form, Accordion, Row, Button, Alert} from 'react-bootstrap';
import API from '../API.js';

/* Componenti Ticket */

function TicketRow(props) {
    const [estimation, setEstimation]= useState("");

    const t= props.ticket;

    function handleCategory(event) {
        if(event.target.value!== t.category){
          props.changeCategory(t.id, event.target.value);
        }
    };

    function handleState(event) {
        if(event.target.value!== t.state){
          props.changeTicketState(t.id, event.target.value);
        }
    };

    /* Stima chiusura ticket */
    useEffect(() => { 
        if(props.authToken && props.logUser && props.logUser.level==="admin" && t && t.state==="open"){
            API.getTicketEstimation(props.authToken, t, "list")
            .then(value => setEstimation(value))
            .catch(err =>{ setEstimation(""); props.getToken();});
        }
        else{
            setEstimation("");
        }
    }, [props.authToken, t]);

    return (
        <tr>
            <td>{t.title}</td>
            <td>{t.timestamp}</td>
            <td>{t.owner}</td>

            <td>{(props.logUser && props.logUser.level==="admin") ? 
                <Form.Select value={t.category} onChange={handleCategory} >
                    <option value="administrative">administrative</option>
                    <option value="inquiry">inquiry</option>
                    <option value="maintenance">maintenance</option>
                    <option value="new feature">new feature</option>
                    <option value="payment">payment</option>
                </Form.Select> : t.category}
            </td> 

            <td>{(props.logUser && props.logUser.level==="admin") || (props.logUser && t.state==="open" && props.logUser.name=== t.owner) ? 
                <Form.Select value={t.state} onChange={handleState} >
                    <option value="open">open</option>
                    <option value="closed">closed</option>
                </Form.Select> : t.state}
            </td>
            
            {props.logUser && props.logUser.level==="admin" ? (estimation ? <td> {`${estimation} hours`} </td> : <td></td>) : ""}

            {props.logUser ? <td> <Button variant="info" onClick={() => props.showItems(t.id)}> {props.openTicket.includes(t.id) ? 'Hide Details' : 'Show Details'} </Button> </td> : ""}

        </tr>
    );
}

function ItemRow(props) {
    return (
        <>
            <Row className="fw-bold fs-6">{`${props.response.timestamp} - ${props.response.author}:`}</Row>
            <Row style={{ whiteSpace: 'pre-wrap'}}>{props.response.block} </Row>
        </>
    );
}

function ItemsBlock(props) {
    const [newBlock, setNewBlock] = useState("");
    const [errorMessage, setErrorMessage] = useState('');

    const ticket = props.ticketItems;

    function handleAddItem(id) {
        if (!newBlock.trim()) {
            return setErrorMessage("Response cannot be empty");
        }
        setNewBlock("");
        props.addNewItem(id, newBlock);
    }

    return (
        <Accordion.Item eventKey={ticket.id.toString()}>
            <Accordion.Header>{`${ticket.title} - Details`}</Accordion.Header>

            <Accordion.Body>
                
                {ticket.items.map((testo, i) => <ItemRow key={i} response={testo}/>)}

                {ticket.state=== "open" ?
                    <>
                        <Form.Control className='mt-3' as="textarea" rows={3} value={newBlock} onChange={(event) => setNewBlock(event.target.value)} />

                        {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
                
                        <Button className='mt-3' onClick={() => handleAddItem(ticket.id)}>Add Response</Button>
                        
                    </> : ""}

            </Accordion.Body>

        </Accordion.Item>
    );
}
  
function TicketTable(props) {
    const [openTicket, setOpenTicket] = useState([]);

    function showItems(ticketID){
        setOpenTicket((lista) => lista.includes(ticketID) ? lista.filter((id) => id !== ticketID) : [...lista, ticketID]);
    }

    return (
        <>
            <Table bordered hover style={{ textAlign: "center" }}>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Timestamp</th>
                        <th>Owner</th>
                        <th>Category</th>
                        <th>State</th>
                        {props.logUser && props.logUser.level==="admin" ? <th>Estimated closing time</th> : ""}
                        {props.logUser ? <th>Actions</th> : ""}
                    </tr>
                </thead>
                <tbody>
                    {props.listOfTickets.map((e) =>
                        <TicketRow key={e.id} ticket={e} logUser={props.logUser} changeTicketState={props.changeTicketState} changeCategory={props.changeCategory} getToken={props.getToken} authToken={props.authToken} openTicket={openTicket} showItems={showItems}/>
                    )
                    }
                </tbody>
            </Table>

            {props.logUser && openTicket.length> 0 ? 
                <Accordion defaultActiveKey={props.listOfTickets.map(f => f.id.toString())} alwaysOpen>
                    {props.listOfTickets
                        .filter((el) => openTicket.includes(el.id))
                        .map((b) => <ItemsBlock key={b.id} ticketItems={b}  addNewItem={props.addNewItem} />)}
                </Accordion> : ""} 
        </>
    );
}


export {TicketTable};