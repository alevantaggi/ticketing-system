import { useState, useEffect } from 'react';
import { Button, Form, Alert,  Col, Row, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


import API from '../API.js';

function TicketForm(props) {
    const navigate = useNavigate();

    const [newTicket, setNewTicket]= useState(undefined); //set all the informations from the client
    const [estimation, setEstimation]= useState("");

    const [category, setCategory] = useState(newTicket ? newTicket.category : 'defaulOpt');
    const [title, setTitle] = useState(newTicket ? newTicket.title : '');
    const [newBlock, setNewBlock] = useState(newTicket ? newTicket.block : ''); 

    const [errorCategory, setErrorCategory]= useState(false);
    const [errorTitle, setErrorTitle] = useState(false);
    const [errorBlock, setErrorBlock] = useState(false);

    function handleSubmit(event) {
        event.preventDefault();

        let spy= 0;

        setErrorCategory(false);
        setErrorTitle(false);
        setErrorBlock(false);

        if(category=== "defaulOpt"){
            setErrorCategory(true);
            spy++;
        }
        
        if (!title.trim()) {
            setErrorTitle(true);
            spy++;
        }
        
        if (!newBlock.trim()) {
            setErrorBlock(true);
            spy++;
        }

        if(spy=== 0){
            setNewTicket({category: category, title: title, block: newBlock});
            return;
        }

    }

    function confirmAddTicket(){
        props.addNewTicket(newTicket.category, newTicket.title, newTicket.block);
        setNewTicket(undefined);
        navigate("/");
    }

    useEffect(() => { 
        if(props.authToken && newTicket){
            API.getTicketEstimation(props.authToken, newTicket, "final")
            .then(value => setEstimation(value))
            .catch(err =>{ setEstimation(""); props.getToken();});
        }
        else{
            setEstimation("");
        }
    }, [props.authToken, newTicket]);

    return (
        <Row style={{ marginTop: "0.5rem" }}>
            
            <Col xs={3}/>
            
            {newTicket ?
                <Col xs={6}>
                    <Table bordered hover >
                        <thead style={{ textAlign: "center" }}>
                            <tr>
                                <th>Category</th>
                                <th>Title</th>
                                <th>Block of text</th>
                                <th>Estimated closing time (days)</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>{category}</td>
                                <td>{title}</td>
                                <td style={{ whiteSpace: 'pre-wrap'}}>{newBlock}</td>
                                <td>{estimation}</td>
                            </tr>
                        </tbody>

                    </Table>

                    <Button className='mt-3' variant="success" onClick={() => confirmAddTicket()}>Confirm </Button>
                    <Button className='mt-3 ms-1' variant='warning' onClick={() => { setNewTicket(undefined); /*props.setDirty(true);*/ }}>Back</Button>

                </Col >


                : <Col xs={6}>
                    {(errorCategory || errorBlock || errorTitle) ? <Alert variant='danger' dismissible>Error: Fill in all required entry fields</Alert> : false}
                    <Form onSubmit={handleSubmit}>

                        <Form.Group>
                            <Form.Label>Category</Form.Label>
                            <Form.Select value={category} onChange={(event) => setCategory(event.target.value)} style={{ border: errorCategory ? "2px solid red" : '' }}>
                                <option value="defaulOpt"></option>
                                <option value="administrative">administrative</option>
                                <option value="inquiry">inquiry</option>
                                <option value="maintenance">maintenance</option>
                                <option value="new feature">new feature</option>
                                <option value="payment">payment</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text" name="title" value={title} onChange={(event) => setTitle(event.target.value)} style={{ border: errorTitle ? "2px solid red" : '' }} />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Block of text</Form.Label>
                            <Form.Control as="textarea" rows={3} value={newBlock} onChange={(event) => setNewBlock(event.target.value)} style={{ border: errorBlock ? "2px solid red" : '' }} />
                        </Form.Group>                        

                        <Button className='mt-3'type='submit' variant="primary">Add</Button>
                        <Button className='mt-3 ms-1' variant='warning' onClick={()=> {navigate("/"); setNewTicket(undefined); /*props.setDirty(true);*/}}>Back</Button>
                    </Form>

                </Col>
            }

            <Col xs={3}/>
        </Row>
    );
}

export { TicketForm };