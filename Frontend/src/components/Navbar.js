import { React }from 'react';
import './Navbar.css';

const Navbar = ({ toggleRegisterForm, toggleLoginForm, toggleContentDetails, toggleHome, authApp, handleDelete, handleMyAccount, handleUserList}) => {
  
  return (
    <div className="navbar">
        <h1 className='n1Nav' onClick={toggleHome}>Ticket Management System</h1>
        <h1 className='n1Nav tms-hidden'>TMS</h1> 
        <div className='options'>
          <div className='auth'>
            { authApp ?
              <div>
                <button className="buttonsNavbar" onClick={handleDelete}>Logout</button>
                <button className="buttonsNavbar" onClick={handleMyAccount}>My Account</button>
                <button className="buttonsNavbar" onClick={handleUserList}>Users</button>
              </div>
              :
              <div className='withoutAuth'>
                <div>
                  <button className='register' onClick={toggleRegisterForm}>Register</button>
                </div>
                <div>
                  <button className='login' onClick={toggleLoginForm}>Login</button>
                </div>
              </div>
            }
          </div>
          <button className='add-ticket' onClick={toggleContentDetails}>Add Ticket</button>
        </div>
    </div>
  );
};

export default Navbar;