import {React, useState, useEffect} from 'react';
import './ContentDetails.css';
import Validation from './updateValidation';
import customSelectStyles from '../Styles_ReactCustom_Components/styleSelectCustomElementReact'; 
import axios from "axios";
import Select from 'react-select';

const ContentDetails = ({isVisible, authApp, isEditing, isAdding, selectedTicket, toggleTickets, setCheckUpdate, account, userList, toggleLogin}) => {

  const [charCountUpdate, setCharCountUpdate] = useState({ short: 0, long: 0 });
  const [charCountAdd, setCharCountAdd] = useState({ short: 0, long: 0 });
  
  const [values, setValues] = useState({ //Values for update form
    shortDescription: '',
    description: '',
    assignedTo: '',
    assignedToName: '',
    state: '',
    priority: '',
  });

  //Create the DATE format before inserting into the database 
  function getCurrentDateForMySQL() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
  }


  const [valuesAdd, setValuesAdd] = useState({
    shortDescription: '',
    description: '',
    assignedTo: '',
    assignedToName: '',
    state: 'New', //Default value
    priority: '4 Low', //Default value
    created_on: getCurrentDateForMySQL() // e.g., "2025-06-24"
  });

  const [errors, setErrors] = useState({});
  const [assignError, setAssignError] = useState({
    assignedTo:'',
  });

  const [errorsAdd, setErrorsAdd] = useState({});
  const [assignErrorAdd, setAssignErrorAdd] = useState({
    assignedTo:'',
  });

  const handleClear = () => {
    // Reset the input fields to their initial empty values
    setValues({
      shortDescription: '',
      description: '',
      assignedTo: '',
      state: '',
      priority: '',
    });
    setErrors({});
    setAssignError({});
    setCharCountUpdate({ short: 0, long: 0 });
  }; 
  
  const handleClearAdd = () => {
    // Reset the input fields to their initial empty values
    setValuesAdd({
      shortDescription: '',
      description: '',
      assignedTo: '',
      state: 'New',
      priority: '4 Low',
    });
    setErrorsAdd({});
    setAssignErrorAdd({});
    setCharCountAdd({ short: 0, long: 0 });
  };

  useEffect(() => { //Click and fill in the input texts
    if (selectedTicket.shortDescription !== '') {
      setValues(selectedTicket);
      setErrors({}); // to reset the error span if another ticket is clicked
      setAssignError({});
    } else {
      handleClear();
    }
  }, [selectedTicket]);

  useEffect(() => {
    if(errors.shortDescription === "" && errors.assignedTo === "" && errors.state === "" &&  errors.priority === "" && assignError.assignedTo === ""){
      // Make a PUT request to the backend to mark the ticket as deleted
      axios.put(`http://localhost:8800/api/ticketsUpdate/${selectedTicket.ticketID}`, values)
          .then(response => {
              console.log(`Ticket marked as updates ${selectedTicket.ticketID}`);
              setCheckUpdate(true); // rerender the UI 
              toggleTickets(); 
            })
          .catch(error => {
              // Handle errors, e.g., display an error message
              console.error('Error marking ticket as deleted:');
          });
    }
    
  }, [errors, assignError, values, setCheckUpdate, toggleTickets, selectedTicket.ticketID]);

  useEffect(() => {
    if(errorsAdd.shortDescription === "" && errorsAdd.assignedTo === "" && errorsAdd.state === "" &&  errorsAdd.priority === "" && assignErrorAdd.assignedTo === ""){
      // Make a PUT request to the backend to mark the ticket as deleted

      axios.post(`http://localhost:8800/api/addTicket`, valuesAdd)
          .then(response => {
              setCheckUpdate(true); // rerender the UI 
              toggleTickets(); 
            })
          .catch(error => {
              // Handle errors, e.g., display an error message
              console.error('Error');
          });
    }
    
  }, [errorsAdd, assignErrorAdd, valuesAdd, setCheckUpdate, toggleTickets]);

  const [userID, setUserID] = useState([]);
  useEffect(() => {
    const fetchUserId = async () => {
      try {
          const response = await fetch(`http://localhost:8800/api/checkAssignTo`);
          const userID = await response.json();
          console.log('Fetched assignedTo:', userID);
          setUserID(userID); // Return the data directly
      } catch (error) {
          console.error('Error fetching tickets:', error);
          throw error; // Rethrow the error to handle it elsewhere if needed
      }
    };
    fetchUserId();
    }, []);

    const [accountBack, setAccountBack] = useState({});

useEffect(() => {
  // Fetch account data from the backend
  axios.get('http://localhost:8800/api/getAccount')
    .then((response) => {
      if (response.status === 200) {
        setAccountBack(response.data);
      } else {
        console.error('Error fetching account data:', response.statusText);
      }
    })
    .catch((error) => {
      console.error('Error fetching account data:', error);
    });
}, []);

const [users, setUsers] = useState([]);
useEffect(() => {
  // Function to fetch tickets from the backend
  const fetchUsers= async () => {
    try {
      const response = await fetch(`http://localhost:8800/api/userList`);
      const data = await response.json();
      console.log('Fetched data userList:', data);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  fetchUsers();
}, []); 

  const [usersForOptionsSelect, setUsersForOptionsSelect] = useState([]);
  useEffect(() => {
  const fetchUsersForOptionsSelect= async () => {
    try {
      const response = await fetch(`http://localhost:8800/api/userList`);
      const data = await response.json();
      const options = data.map(user => ({
          value: user.userID,
          label: user.fullName,
        }));
        setUsersForOptionsSelect(options);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  fetchUsersForOptionsSelect();
}, []);
    
  if (!isVisible) {
    return null; // Hide the component by returning null
  }
  //So, the line {showContentDetails && <ContentDetails isVisible={showContentDetails} />} 
  // checks if showContentDetails is true. If it's true, it renders the ContentDetails component 
  // with the isVisible prop set to true, making the component visible. If showContentDetails is false, 
  // it doesn't render anything, effectively hiding the ContentDetails component.
  // When isVisible is true, it renders the content within the <div className="content-details">. 
  // This approach ensures that the component is hidden or shown based on the value of isVisible.


// Cancel Events in JavaScript Using preventDefault() Method. The “preventDefault()” method cancels 
// the attached event if it is cancel-able. 
  
function handleInputUpdate(event) {
  const { name, value } = event.target;
  setValues(prev => ({ ...prev, [name]: value }));

  if (name === 'shortDescription' || name === 'description') {
    setCharCountUpdate(prev => ({
      ...prev,
      short: name === 'shortDescription' ? value.length : prev.short,
      long: name === 'description' ? value.length : prev.long
    }));
  }
}

function handleInputAdd(event) {
  const { name, value } = event.target;
  setValuesAdd(prev => ({ ...prev, [name]: value }));

  if (name === 'shortDescription' || name === 'description') {
    setCharCountAdd(prev => ({
      ...prev,
      short: name === 'shortDescription' ? value.length : prev.short,
      long: name === 'description' ? value.length : prev.long
    }));
  }
}

function handleSubmitUpdate(event) {
  event.preventDefault();
  const validationErrors = Validation(values);
  setErrors(validationErrors);
  const assignedToValues = userID.map(item => item.userID);

  if (!assignedToValues.includes(Number(values.assignedTo))) {
    setAssignError({ assignedTo: "Invalid user ID!" });
    // return;
  } else {
    setAssignError({ assignedTo: "" }); // Clear the assignError if it's valid
  }
  
}

function handleSubmitAdd(event) {
  event.preventDefault();
  const validationErrors = Validation(valuesAdd);
  setErrorsAdd(validationErrors);
  const assignedToValues = userID.map(item => item.userID);

  if (!assignedToValues.includes(Number(valuesAdd.assignedTo))) {
    setAssignErrorAdd({ assignedTo: "Invalid user ID!" });
    // return;
  } else {
    setAssignErrorAdd({ assignedTo: "" }); // Clear the assignError if it's valid
  }
  
};

  return (
    <div className="contentDetails">
    <button className="exit" onClick={toggleTickets}>X</button>
    <div className="forms">
      {authApp ? (
        <>
          {isEditing ? (
            <div className='editForm'>
            <form onSubmit={handleSubmitUpdate}>
              <div className='labelsInputsContent'>
                <label htmlFor="shortDescription" >Short description:</label>
                <input
                  type="text"
                  placeholder="Short description"
                  className='inputUpdateContent'
                  name = 'shortDescription'
                  maxLength={150}
                  value={values.shortDescription}
                  onChange={handleInputUpdate}
                  required
                />
                {charCountUpdate.short >= 150 && (<span className="textDangerUpdate">Maximum 150 characters reached.</span>)}
                {errors.shortDescription && <span className='textDangerUpdate'>{errors.shortDescription}</span>}
              </div>
              <div className='labelsInputsContent'>
                <label htmlFor="description">Description:</label>
                  <textarea
                    placeholder="description"
                    className='inputUpdateContent autoExpand'
                    name='description'
                    maxLength={250}
                    value={values.description}
                    onChange={handleInputUpdate}
                    rows={3}
                  />
                  {charCountUpdate.long >= 250 && (<span className="textDangerUpdate">Maximum 250 characters reached.</span>)}
              </div>
              <div className='labelsInputsContent'>
                <label htmlFor="assignedTo">Assigned to:</label>
                <Select 
                  styles={customSelectStyles}
                  options={usersForOptionsSelect}
                  value={usersForOptionsSelect.find(option => option.value === values.assignedTo) || null}
                  onChange={(selectedOption) =>
                    setValues(prev => ({ 
                      ...prev, 
                      assignedTo: selectedOption ? selectedOption.value : '',
                      assignedToName: selectedOption ? selectedOption.label : ''
                    }))
                  }
                  placeholder="Select a user"
                  isSearchable
                />
                {errors.assignedTo && <span className='textDangerUpdate'>{errors.assignedTo}</span>}
                {assignError.assignedTo && <span className='textDangerUpdate'>{assignError.assignedTo}</span>}
              </div>
              <div className='labelsInputsContent'>
                <label htmlFor="state">State:</label>
                <select
                  name="state"
                  className="inputUpdateContent"
                  value={values.state}
                  onChange={handleInputUpdate}
                  required
                >
                  <option value="New">New</option>
                  <option value="In progress">In progress</option>
                  <option value="Review">Review</option>
                  <option value="Done">Done</option>
                </select>
                {errors.state && <span className='textDangerUpdate'>{errors.state}</span>}
              </div>
              <div className='labelsInputsContent'>
                <label htmlFor="priority">Priority:</label>
                <select
                  name="priority"
                  className="inputUpdateContent"
                  value={values.priority}
                  onChange={handleInputUpdate}
                  required
                >
                  <option value="1 Critical">1-Critical</option>
                  <option value="2 High">2-High</option>
                  <option value="3 Moderate">3-Moderate</option>
                  <option value="4 Low">4-Low</option>
                </select>
                {errors.priority && <span className='textDangerUpdate'>{errors.priority}</span>}
              </div>
              <div className='buttonsUpdateContent'>
                <div>
                  <button type="submit" className='buttonsStyleUpdate'>Update</button>
                </div>
                <div>
                  <button type="button" onClick={handleClear} className='buttonsStyleUpdate'>Cancel</button>
                </div>
              </div>
          </form>
          </div>
          ) : isAdding ? (
            <div className='addForm'>
            <form onSubmit={handleSubmitAdd}>
              <div className='labelsInputsContent'>
                <label htmlFor="shortDescription" >Short description:</label>
                <input
                  type="text"
                  placeholder="Short description"
                  className='inputAddContent'
                  name = 'shortDescription'
                  maxLength={150}
                  value={valuesAdd.shortDescription}
                  onChange={handleInputAdd}
                  required
                />
                {charCountAdd.short >= 150 && (<span className="textDangerUpdate">Maximum 150 characters reached.</span>)}
                {errorsAdd.shortDescription && <span className='textDangerUpdate'>{errorsAdd.shortDescription}</span>}
              </div>
              <div className='labelsInputsContent'>
                <label htmlFor="description">Description:</label>
                <textarea
                  placeholder="Description"
                  className='inputAddContent autoExpand'
                  name='description'
                  maxLength={250}
                  value={valuesAdd.description}
                  onChange={handleInputAdd}
                  rows={3}
                />
                {charCountAdd.long >= 250 && (<span className="textDangerUpdate">Maximum 250 characters reached.</span>)}
                {errorsAdd.description && <span className='textDangerUpdate'>{errorsAdd.description}</span>}
              </div>
              <div className='labelsInputsContent'>
                <label htmlFor="assignedTo">Assigned to:</label>
                <Select 
                  styles={customSelectStyles}
                  options={usersForOptionsSelect}
                  value={usersForOptionsSelect.find(option => option.value === valuesAdd.assignedTo) || null}
                  onChange={(selectedOption) =>
                    setValuesAdd(prev => ({
                      ...prev,
                      assignedTo: selectedOption ? selectedOption.value : '',
                      assignedToName: selectedOption ? selectedOption.label : ''
                    }))
                  }
                  placeholder="Select a user"
                  isSearchable
                />
                {assignErrorAdd.assignedTo && <span className='textDangerUpdate'>{assignErrorAdd.assignedTo}</span>}
                {errorsAdd.assignedTo && <span className='textDangerUpdate'>{errorsAdd.assignedTo}</span>}
              </div>
              <div className='labelsInputsContent'>
                <label htmlFor="state">State:</label>
                <select
                  name="state"
                  className="inputAddContent"
                  value={valuesAdd.state}
                  onChange={handleInputAdd}
                  required
                >
                  <option value="New">New</option>
                  <option value="In progress">In progress</option>
                  <option value="Review">Review</option>
                  <option value="Done">Done</option>
                </select>
                {errorsAdd.state && <span className='textDangerUpdate'>{errorsAdd.state}</span>}
              </div>
              <div className='labelsInputsContent'>
                <label htmlFor="priority">Priority:</label>
                <select
                  name="priority"
                  className="inputAddContent"
                  value={valuesAdd.priority}
                  onChange={handleInputAdd}
                  required
                >
                  <option value="1 Critical">1-Critical</option>
                  <option value="2 High">2-High</option>
                  <option value="3 Moderate">3-Moderate</option>
                  <option value="4 Low">4-Low</option>
                </select>
                {errorsAdd.priority && <span className='textDangerUpdate'>{errorsAdd.priority}</span>}
              </div>
              <div className='buttonsUpdateContent'>
                <div>
                  <button type="submit" className='buttonsStyleAdd'>Submit</button>
                </div>
                <div>
                  <button type="button" onClick={handleClearAdd} className='buttonsStyleAdd'>Cancel</button>
                </div>
              </div>
            </form>
            </div>
          ) : account ? (
            <div className='account'>
              <p><span style={{color: '#03c1c4'}}>User ID:</span> {accountBack.userID}</p>
              <p><span style={{color: '#03c1c4'}}>Name:</span> {accountBack.name}</p>
              <p><span style={{color: '#03c1c4'}}>Role:</span> {accountBack.role}</p>
            </div>
          ) : userList ? (
            <table className='user-table'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userID}>
                    <td className='colorTable'>{user.userID}</td>
                    <td>{user.fullName}</td>
                    <td className='colorTable'>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <></>
          )}
        </>
      ) : (
        <div className='borderNoLogin'>
          <div>
            <button className='noLoginAddTicketContentShow' onClick={toggleLogin}>Login Now</button>
          </div>
          <div>
            <p className='noLoginAddTicketContentShowParagraph'>To manage tickets!</p>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default ContentDetails;
