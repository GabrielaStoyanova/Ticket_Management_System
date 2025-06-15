import React from 'react';
import './Footer.css';
import logo from '../Pictures/GitHub-Mark.png';

const Footer = () => {
  return (
    <div className="footer">
        <a className='aGit' href="https://github.com/GabrielaStoyanova/DSS" target="_blank" rel="noreferrer">
            <img className='git' src={logo} alt="GitHub"/>
            </a>
        <div className='Pfooter'><p>© 2025 Ticket Management System. All rights reserved.</p>
        </div>
    </div>
  );
};

export default Footer;
