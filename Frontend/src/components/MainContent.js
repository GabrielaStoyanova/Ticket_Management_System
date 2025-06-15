import React from 'react';
import './MainContent.css';
import TicketList from './TicketList';
import Login from './Login';
import Registation from './Registration';

const MainContent = ({ showRegisterForm, showLoginForm, showContentDetails, toggleLogin, toggleTickets, toggleLoginNavbar, authApp, toggleUpdateFields, checkUpdate, setCheckUpdate }) => {
  
    const mainContentClassName = showContentDetails ? 'main-content with-details' : 'main-content';
    // This will allow the MainContent component to react to the visibility of ContentDetails.
    // when showContentDetails is true, the MainContent component will have the with-details class,
    //  which will make it take up 70vw width. When showContentDetails is false, it will have the default 
    // styles and take up 100vw width.

  return (
    <div className={mainContentClassName}>
      {showRegisterForm ? (
        <div className="registration-form">
          <Registation onRegisterSuccess={toggleLogin}/> 
        </div>
      ) : showLoginForm ? (
        <div className="login-form">
          <Login onLoginSuccess={toggleTickets} onLoginNavbar={toggleLoginNavbar}/>
        </div>
      ) : (
        <div className="ticket-list">
          <TicketList authButtons={authApp} handleClickUpdate={toggleUpdateFields} checkUpdate={checkUpdate} setCheckUpdate={setCheckUpdate}/>
        </div>
      )}
    </div>
  );
};

export default MainContent;
