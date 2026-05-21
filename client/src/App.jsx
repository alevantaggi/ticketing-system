import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { DefaultLayout, DefaultRoute, LoginLayout, TicketsLayout } from './components/Layout.jsx';
import { TicketForm } from './components/FormComponents.jsx';
import API from './API.js';

/* Visualizzazione */
function App() {
  const [ticketList, setTicketList] = useState([]);
  const [dirty, setDirty]= useState(true);

  /* Verifica logged - in user*/
  const [logUser, setLogUser]= useState(undefined);
  
  /* TOKEN */
  const [authToken, setAuthToken]= useState("");
  
  function getToken(){
    API.getAuthToken().then(resp => setAuthToken(resp.token)).catch((err) => console.log(err));
  }

  // Visualizzazione 
  function addNewTicket(category, title, block) {
    API.addTicket(category, title, block).then(() => setDirty(true)).catch((err) => console.log(err));
  }

  function addNewItem(id, block) {
    API.addItem(id, block).then(() => setDirty(true)).catch((err) => console.log(err));  
  }

  function changeTicketState(id, state) {
    API.changeTicketState(id, state).then(() => setDirty(true)).catch((err) => console.log(err));
  }

  function changeCategory(id, category) {
    API.changeCategory(id, category).then(() => setDirty(true)).catch((err) => console.log(err));
  }

  // Gestione utente
  useEffect(()=> {
    const checkAuth = async() => {
      try {
        const user= await API.getUserInfo();
        setLogUser(user);
        getToken();
      } catch(err) {
      }
    };
    checkAuth();
  }, []);

  async function handleLogout(){
    await API.logOut();
    setLogUser(undefined);
    setTicketList([]);
    setAuthToken("");
    //setStats("");
    setDirty(true);
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route path='/' element={<DefaultLayout handleLogout={handleLogout} logUser={logUser}/>}>
          
          <Route index element={
            <TicketsLayout 
              logUser={logUser} getToken={getToken} authToken={authToken}
              listOfTickets={ticketList} 
              dirty={dirty}
              setDirty={setDirty}
              setTickets={setTicketList}  
              addNewItem={addNewItem} 
              changeTicketState= {changeTicketState} changeCategory={changeCategory}
            />}
          />
          
          <Route path='/add' element={logUser ? <TicketForm  getToken={getToken} authToken={authToken} addNewTicket={addNewTicket}/> : <Navigate replace to= "/"/>} />
        
        </Route>

        <Route path='/*' element={<DefaultRoute />} />

        <Route path='/login' element={logUser ? <Navigate replace to= "/"/> : <LoginLayout setUser={setLogUser} getToken={getToken} setDirty={setDirty}/>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App
