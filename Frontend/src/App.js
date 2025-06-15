import './App.css'; // Import your CSS file
import Navbar from './components/Navbar';
import MainContent from './components/MainContent';
import ContentDetails from './components/ContentDetails';
import Footer from './components/Footer';
import { useState, useEffect } from 'react';
import React from 'react';
import axios from "axios";

function App() {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showContentDetails, setShowContentDetails] = useState(false);

  const toggleRegisterForm = () => {
    setShowRegisterForm((prevValue) => !prevValue);
    // Ensure that login form is hidden when registration form is shown
    setShowLoginForm(false);
    setShowContentDetails(false);
  };

  const toggleLoginForm = () => {
    setShowLoginForm((prevValue) => !prevValue);
    // Ensure that registration form is hidden when login form is shown
    setShowRegisterForm(false);
    setShowContentDetails(false);
  };

  const [isAdding, setIsAdding] = useState(false);
  const toggleContentDetails = () => {
    if(showContentDetails){
      setIsEditing(false);
      setIsAdding(true);
    }else{
      setShowContentDetails(true); 
      setIsAdding(true);
      setIsEditing(false);
    } 
    setShowRegisterForm(false);
    setShowLoginForm(false);
    // conditional rendering" or "conditional rendering with a short-circuit operator."
    // If showContentDetails is true, the expression after && is evaluated and rendered. In this case, 
    // it's <ContentDetails isVisible={showContentDetails} />.
  };

  const toggleHome = () => {
    setShowContentDetails(false);
    setShowRegisterForm(false);
    setShowLoginForm(false);
  };

  const toggleLogin = () => {
    setShowContentDetails(false);
    setShowRegisterForm(false);
    setShowLoginForm(true);
  }; // to toggle the login form after successful registration (MainContent)

  const [auth, setAuth] = useState(false);
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      setAuth(true); // Set auth state to true if token exists
    }
    // You can set the role state here if needed
  }, []);

  // Function to update auth state after successful login
  const toggleLoginNavbar = () => {
    axios.get('http://localhost:8800/api/verifyUser')
    .then(res => {
      if(res.data.Status === "Success"){
        const token = res.data.token; // Assuming the token is sent in the response
        localStorage.setItem('authToken', token);
        setAuth(true);
        console.log(res);
      }else{
        setAuth(false);
      }
    })
    .catch(err => console.log(err));
  };

  const onLoginDelete = () =>{
    axios.get('http://localhost:8800/api/logout')
    .then(res => {
      localStorage.removeItem('authToken'); // Clear the auth token from local storage
      setAuth(false);
    })
    .catch(err => console.log(err));
    toggleHome();
  };

  const [isEditing, setIsEditing] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState([]);
  const toggleUpdateFields = (ticketID, tickets) => {
    if(showContentDetails){
      setIsEditing(true);
      setIsAdding(false);
    }else{
      setShowContentDetails(true); 
      setIsEditing(true);
      setIsAdding(false);
    }

    // Find the ticket with the given ticketID
    const ticketToUpdate = tickets.find((ticket) => ticket.ticketID === ticketID);

    if (ticketToUpdate) {
      // Set the found ticket as the selectedTicket
      setSelectedTicket(ticketToUpdate);
      console.log(`Ticket with ID ${ticketID} is found.`);
    } else {
      // Handle the case where the ticket with the specified ID was not found
      console.log(`Ticket with ID ${ticketID} not found.`);
    }
  }; 

  const [checkUpdate, setCheckUpdate] = useState(false);

  const [account, setAccount] = useState(false);
  const handleMyAccount = () => {
    if(showContentDetails){
      setAccount(true);
      setIsEditing(false);
      setIsAdding(false);
    }else{
      setAccount(true);
      setShowContentDetails(true); 
      setIsEditing(false);
      setIsAdding(false);
    }
  };
  
  const [userList, setUserList] = useState(false);
  const handleUserList = () => {
    if(showContentDetails){
      setUserList(true);
      setAccount(false);
      setIsEditing(false);
      setIsAdding(false);
    }else{
      setUserList(true);
      setShowContentDetails(true); 
      setAccount(false);
      setIsEditing(false);
      setIsAdding(false);
    }
  };

  return (
    <div className="container"> 
      <div className="child1">
        <Navbar toggleRegisterForm={toggleRegisterForm} toggleLoginForm={toggleLoginForm} toggleContentDetails={toggleContentDetails} toggleHome={toggleHome} authApp={auth} handleDelete={onLoginDelete} handleMyAccount={handleMyAccount} handleUserList={handleUserList}/>
      </div>
      <div className="child2">
          <MainContent showRegisterForm={showRegisterForm} showLoginForm={showLoginForm} showContentDetails={showContentDetails} toggleLogin={toggleLogin} toggleTickets={toggleHome} toggleLoginNavbar={toggleLoginNavbar} 
          authApp={auth} toggleUpdateFields={toggleUpdateFields} checkUpdate={checkUpdate} setCheckUpdate={setCheckUpdate}/>
          {showContentDetails && <ContentDetails isVisible={showContentDetails} authApp={auth} isEditing={isEditing} isAdding={isAdding} selectedTicket={selectedTicket} toggleTickets={toggleHome} setCheckUpdate={setCheckUpdate} account={account} userList={userList} toggleLogin={toggleLogin}/>}
      </div>
      <div className="child3">
        <Footer />
      </div>
    </div>
  );
}

export default App;

