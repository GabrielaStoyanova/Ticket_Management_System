import React, { useState } from 'react';
import './Login.css';
import Validation from './LoginValidation';
import axios from "axios";

const Login = ({ onLoginSuccess, onLoginNavbar }) => {
  const [values, setValues] = useState({
    fullName: '',
    passwordHash: ''
  });

  //After submitting a wrong password (even with correct full name), you see no login happens even after correcting the inputs.
  //Your useEffect is watching errors — but setErrors(...) is async, so when you re-submit the form with 
  // corrected values, errors doesn't change (it’s already empty), so the useEffect does not run again, 
  // and the login is never retried.

  const [errors, setErrors] = useState({});
  const [invalidPassUsername, setInvalidPassUsername] = useState(false);

  axios.defaults.withCredentials = true;

  const handleInput = (event) => {
    setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
    setInvalidPassUsername(false); // clear login error when user starts typing again
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = Validation(values);
    setErrors(validationErrors);

    // Check if no validation errors
    const noErrors = Object.values(validationErrors).every(val => val === "");

    if (noErrors) {
      axios.post('http://localhost:8800/api/login', values)
        .then(res => {
          if (res.data.Status === "Success!") {
            console.log(res);
            setInvalidPassUsername(false); // Clear error state
            onLoginSuccess();
            onLoginNavbar();
          } else {
            setInvalidPassUsername(true); // Show login error
          }
        })
        .catch(err => {
          console.error(err);
          setInvalidPassUsername(true);
        });
    }
  };

  return (
    <div className="containerLogin">
      <div className='colorBorder'>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullName" className='labelFull'>Full Name:</label>
            <input
              type="text"
              placeholder="Enter Full Name"
              className='inputLogin'
              name='fullName'
              onChange={handleInput}
              required
            />
            {errors.fullName && <span className='textDanger'>{errors.fullName}</span>}
          </div>
          <div>
            <label htmlFor="passwordHash" className='labelPass'>Password:</label>
            <input
              type="password"
              placeholder="Enter password"
              className='inputLogin'
              name='passwordHash'
              onChange={handleInput}
              required
            />
            {errors.passwordHash && <span className='textDanger'>{errors.passwordHash}</span>}
          </div>
          {invalidPassUsername && <p className='textDanger'>Invalid Login Credentials!</p>}
          <button className="ButtonLogin" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
