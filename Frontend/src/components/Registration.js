import React, { useState } from 'react';
import './Registration.css';
import axios from 'axios';
import Validation from './RegistrationValidation';

function Registation({ onRegisterSuccess }) {
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    passwordHash: '',
    role: ''
  });

  const [errors, setErrors] = useState({});

  function handleInputRegister(event) {
    setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmitRegister(event) {
    event.preventDefault();
    const validationErrors = await Validation(values);
    setErrors(validationErrors);

    // Check if there are no errors
    const noErrors = Object.values(validationErrors).every(error => error === "");

    if (noErrors) {
      axios.post('http://localhost:8800/api/register', values)
        .then(res => {
          console.log(res);
          setValues({
            firstName: '',
            lastName: '',
            fullName: '',
            passwordHash: '',
            role: '',
          });
          onRegisterSuccess(); // toggle the Login after successful register 
        })
        .catch(err => console.log(err));
    }
  }

  return (
    <div className="containerRegister">
      <div className='colorBorderRegister'>
        <h2>Register</h2>
        <form className='formRegister' onSubmit={handleSubmitRegister}>
          <div className='firstLine'>
            <div className='input-group'>
              <label htmlFor="firstName" className='labelRegister'>First Name:</label>
              <input
                type="text"
                placeholder="Enter First Name"
                className='inputRegister'
                name='firstName'
                onChange={handleInputRegister}
                required
                value={values.firstName}
              />
              {errors.firstName && <span className='textDangerRegister'>{errors.firstName}</span>}
            </div>
            <div className='input-group'>
              <label htmlFor="lastName" className='labelRegister'>Last Name:</label>
              <input
                type="text"
                placeholder="Enter Last Name"
                className='inputRegister'
                name='lastName'
                onChange={handleInputRegister}
                required
                value={values.lastName}
              />
              {errors.lastName && <span className='textDangerRegister'>{errors.lastName}</span>}
            </div>
          </div>
          <div className='secondLine'>
            <div className='input-group'>
              <label htmlFor="fullName" className='labelRegister'>Full Name:</label>
              <input
                type="text"
                placeholder="Enter Full Name"
                className='inputRegister'
                name='fullName'
                onChange={handleInputRegister}
                required
                value={values.fullName}
              />
              {errors.fullName && <span className='textDangerRegister'>{errors.fullName}</span>}
            </div>
            <div className='input-group'>
              <label htmlFor="passwordHash" className='labelRegister'>Password:</label>
              <input
                type="password"
                placeholder="Enter password"
                className='inputRegister'
                name='passwordHash'
                onChange={handleInputRegister}
                required
                value={values.passwordHash}
              />
              {errors.passwordHash && <span className='textDangerRegister'>{errors.passwordHash}</span>}
            </div>
          </div>
          <div className='thirdLine'>
            <div className="input-group">
              <label htmlFor="role" className='labelRegister'>Role:</label>
              <select
                  name="role"
                  className="inputRegister"
                  value={values.role}
                  onChange={handleInputRegister}
                  required
                >
                  <option value="">---Select Role---</option>
                  <option value="Developer">Developer</option>
                  <option value="QA">QA</option>
                  <option value="Manager">Manager</option>
                </select>
              {errors.role && <span className='textDangerRegister'>{errors.role}</span>}
            </div>
            <button className="ButtonRegister" type="submit">Register</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Registation;
