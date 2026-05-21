import { Navbar, Container, Col, Row, Button, Alert } from 'react-bootstrap';
import {  useEffect } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import API from "../API.js"

import { TicketTable } from './TicketComponents.jsx';
import { LoginForm } from './LoginComponent.jsx';

/* PATH: / */
function MyHeader(props) {
    const navigate = useNavigate();

    return (
        <>
            <Navbar className="d-flex justify-content-between" bg="primary" variant="dark" style={{ marginTop: "0.5rem" }}>

                <Navbar.Brand style={{ marginLeft: '0.25rem' }}>
                        <i  className="bi bi-card-checklist" />
                        {" Ticketing system"}
                </Navbar.Brand>

                <Navbar.Brand>
                    {props.logUser && props.logUser.name ? (
                        <>Welcome, {props.logUser.name} <Button variant='warning' onClick={()=> {navigate("/"); props.handleLogout();}} style={{ marginLeft: "0.5rem" }} >Logout</Button></>) 
                        : <Button variant='success' onClick={()=> navigate("/login")} style={{ marginLeft: "0.5rem" }}>Login</Button>}            
                </Navbar.Brand>

            </Navbar>
        </>
    );
}

function DefaultLayout(props) {
    return (
        <Container fluid>
            <MyHeader handleLogout={props.handleLogout} logUser={props.logUser}/>
            <Outlet />
        </Container>
    );
}

/* PATH: index  */
function TicketsLayout(props) {
    const navigate = useNavigate();

    useEffect(() => { 
        if(props.dirty){
            if(props.logUser){
                API.getTicketItems()
                .then(lista => {props.setTickets(lista); props.setDirty(false);})
                .catch((err) => console.log(err));
            }
            else{
                API.getAllTickets()
                .then(lista => {props.setTickets(lista); props.setDirty(false);})
                .catch((err) => console.log(err));
            }
        }
    }, [props.dirty]);

    return (
        <Row style={{ marginTop: "0.5rem" }}>
            <Col xs={1}/>

            <Col xs={10}>
                <Row className="justify-content-between bg-white">
                    <Col className="fw-bold fs-4">List of tickets</Col>
                    {props.logUser ? <Col xs="auto">
                        <Button variant="primary" className="mb-3" onClick={() => navigate("/add")}>New ticket +</Button>
                    </Col>: ""}
                </Row>                
                
                <TicketTable listOfTickets={props.listOfTickets} logUser={props.logUser} changeTicketState={props.changeTicketState} 
                    changeCategory={props.changeCategory} getToken={props.getToken} authToken={props.authToken} addNewItem={props.addNewItem}/>                
            </Col>

            <Col xs={1}/>
        </Row>
    );
};

/* PATH: /* */
function DefaultRoute() {
    return (
        <Container fluid>
            <p className="my-2">No data here: This is not a valid page!</p>
            <Link to='/'>Please go back to main page</Link>
        </Container>
    );
};

/* PATH: /login */
function LoginLayout(props){
    return(<LoginForm  setUser={props.setUser} getToken={props.getToken} setDirty={props.setDirty}/>);
}

export { DefaultLayout, DefaultRoute, TicketsLayout, LoginLayout };
