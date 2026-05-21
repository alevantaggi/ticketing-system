import { Navbar, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API.js';

function LoginForm(props) {
    const [username, setUsername] = useState('u1@p.it');
    const [password, setPassword] = useState('pwd');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const credentials= {username,password};
        
        if(!username){
            return setErrorMessage("Username cannot be empty");
        }
        
        if(!password){
            return setErrorMessage("Password cannot be empty");
        }

        API.logIn(credentials)
            .then((user) => {
                props.setUser(user);
                props.getToken();
                props.setDirty(true);
                navigate("/");
            })
            .catch((err) => setErrorMessage(err));
    };

    return (
        <Container fluid>

            <Navbar className="d-flex justify-content-between" bg="primary" variant="dark" style={{ marginTop: "0.5rem" }}>

                <Navbar.Brand style={{ marginLeft: '0.25rem' }}>
                    <i className="bi bi-card-checklist" />
                    {" Ticketing system"}
                </Navbar.Brand>

            </Navbar>

            <Row>
                <Col xs={4}/>

                <Col xs={4}>

                    <h2>Login</h2>

                    <Form onSubmit={handleSubmit}>
                        {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
                        
                        <Form.Group className='mb-3'>
                            <Form.Label>Email</Form.Label>
                            <Form.Control type='email' value={username} onChange={event => setUsername(event.target.value)} />
                        </Form.Group>
                        
                        <Form.Group className='mb-3'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type='password' value={password} onChange={event => setPassword(event.target.value)} />
                        </Form.Group>
                        
                        <Button className='mt-3' type='submit'>Login</Button>
                        <Button className='mt-3 ms-1' variant='danger' onClick={()=> navigate("/")}>Back</Button>

                    </Form>

                </Col>

                <Col xs={4}/>

            </Row>

        </Container>
    );
}

export { LoginForm };