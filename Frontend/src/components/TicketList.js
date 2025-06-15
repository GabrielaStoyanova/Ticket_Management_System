import React from 'react';
import { useState, useEffect } from 'react';
import './TicketList.css';
import axios from "axios";
import Select from 'react-select';
import ReactPaginate from 'react-paginate';
import customSelectStyles from '../Styles_ReactCustom_Components/styleSelectCustomElementReact';


const TicketList = ({ authButtons, handleClickUpdate, checkUpdate, setCheckUpdate }) => {
    const [tickets, setTickets] = useState([]);
    const [allTickets, setAllTickets] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [assignFilter, setAssignFilter] = useState(false);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [ticketsPerPage] = useState(5);
    const [lastAvailablePage, setLastAvailablePage] = useState(1);

  useEffect(() => {
    // Function to fetch tickets from the backend
    const fetchTickets = async () => {
      try {
        const response = await fetch(`http://localhost:8800/api/data`);
        // ensure that the request is sent directly to the correct backend endpoint.
        // If your React app and backend are running on different ports or domains, 
        // using the full URL with the correct hostname and port is a good practice to ensure 
        // that the frontend can reach the backend without issues.
        const data = await response.json();
        console.log('Fetched data:', data);
        // it replaces the entire state
        setTickets(data);
        if (allTickets){
          setAllTickets(false);
        }
        // setTickets(prevTickets => [...prevTickets, ...data]); => the spread operator approach appends data to the existing state.
        // The reason the spread operator approach was causing duplicates might be related to how React handles state updates asynchronously. 
        // When you use the spread operator to append data to the state, React might not always immediately reflect the changes in the tickets 
        // state, leading to duplicates when the state is updated rapidly (such as during infinite scrolling).
        if (checkUpdate) {
          setTickets(data);
          setCheckUpdate(false); // Reset the flag after updating the data
        }
        setLoading(false);
        setDeleted(false);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };
    fetchTickets();
  }, [checkUpdate, setCheckUpdate ,allTickets]); 



  axios.defaults.withCredentials = true;

  useEffect(() => {
      axios.get('http://localhost:8800/api/getRole')
        .then(res => {
          if (res.data.Status === "Success") {
            setRole(res.data.role);
          }
        })
        .catch(err => console.log(err));
  }, []);

const handleDelete = (ticketID) => {
    console.log("Deleting ticket", ticketID);
    
    // Make a PUT request to the backend to mark the ticket as deleted
    axios.put(`http://localhost:8800/api/ticketsDelete/${ticketID}`)
        .then(response => {
            console.log('Ticket marked as deleted:');
            setTickets(prevTickets => prevTickets.filter(ticket => ticket.ticketID !== ticketID));
          })
        .catch(error => {
            // Handle errors, e.g., display an error message
            console.error('Error marking ticket as deleted:');
        });
};

const handleRestore = (ticketID) => {
    console.log("Restoring ticket", ticketID);
    
    // Make a PUT request to the backend to mark the ticket as deleted
    axios.put(`http://localhost:8800/api/ticketsRestore/${ticketID}`)
        .then(response => {
            console.log('Ticket marked as deleted:');
            setTickets(prevTickets => prevTickets.filter(ticket => ticket.ticketID !== ticketID));
          })
        .catch(error => {
            // Handle errors, e.g., display an error message
            console.error('Error marking ticket as restored:');
        });
};

const showDeleted = async () => {
    try {
      const response = await fetch(`http://localhost:8800/api/deleted`);
      const data = await response.json();
      console.log('Fetched data:', data);
      setTickets(data);
      setDeleted(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
};

const showAll = () => {
  setAllTickets(true); // to not refresh the manually 
  setDeleted(false);
  setAssignFilter(false);
  setLoading(false);
};

const showState = () =>{
  const customSort = (a, b) => {
    const order = ["New", "In progress", "Review", "Done"];
    return order.indexOf(a.state) - order.indexOf(b.state);
    // hen, we use the indexOf method to determine the index of each ticket's state within that order. 
    // The difference in indexes will determine the sorting order.
  };
  setTickets(prevTickets => [...prevTickets].sort(customSort));
  //  create a new array using the spread operator [...prevTickets], and then we apply the 
  // sort method to this new array. This ensures that the original prevTickets array remains 
  // unchanged, and the sorted tickets are stored in the state via setTickets.
  setAssignFilter(false);
  setDeleted(false);
};

const showPriority = () =>{
  const customSort = (a, b) => {
    const order = ["1 Critical", "2 High", "3 Moderate", "4 Low"];
    return order.indexOf(a.priority) - order.indexOf(b.priority);
  };
  setTickets(prevTickets => [...prevTickets].sort(customSort));
  setAssignFilter(false);
  setDeleted(false);
};

const showAssigned = () => {
  const customSort = (a, b) => {
    return a.assignedTo - b.assignedTo;
  };

  setTickets(prevTickets => [...prevTickets].sort(customSort));
  setAssignFilter(true);
  setDeleted(false);
};

const [assignID, setAssignID] = useState('');
function handleInputAssign(event){
  setAssignID(event.target.value);
};

const [sortCreatedOnAsc, setSortCreatedOnAsc] = useState(true);

const showCreatedOn = () => {
  const sorted = [...tickets].sort((a, b) => {
    const dateA = new Date(a.created_on);
    const dateB = new Date(b.created_on);
    return sortCreatedOnAsc ? dateA - dateB : dateB - dateA;
  });
  setTickets(sorted);
  setSortCreatedOnAsc(!sortCreatedOnAsc); // Toggle direction
  setAssignFilter(false);
  setDeleted(false);
};

const handleSubmitAssign = async (event) => {
  event.preventDefault();
  try {
    const response = await fetch(`http://localhost:8800/api/assignFilter/${Number(assignID)}`);
    const assignTickets = await response.json();
    setTickets(assignTickets); // Return the data directly
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  }
  setDeleted(false);
  setAssignID('');
};

const [priority, setPriority] = useState('');
function handleInputPriority(event){
  setPriority(event.target.value);
};

const handleSubmitPriority = async (event) => {
  event.preventDefault();
  try {
    const response = await fetch(`http://localhost:8800/api/priorityFilter/${priority}`);
    const assignTickets = await response.json();
    setTickets(assignTickets); // Return the data directly
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  }
  setDeleted(false);
  setPriority('');
};

const [state, setState] = useState('');
function handleInputState(event){
  setState(event.target.value);
};

const handleSubmitState = async (event) => {
  event.preventDefault();
  try {
    const response = await fetch(`http://localhost:8800/api/stateFilter/${state}`);
    const assignTickets = await response.json();
    setTickets(assignTickets); // Return the data directly
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  }
  setDeleted(false);
  setState(''); // clear the fields
};

  function getCurrentDateForMySQL() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
  }

const handleClickClone = async (ticket) => {
  try {
    const clonedValues = {
     shortDescription: "CLONED! " + ticket.shortDescription,
      description: ticket.description,
      assignedTo: ticket.assignedTo,
      assignedToName: ticket.assignedToName,
      state: 'New',
      priority: ticket.priority,
      created_on: getCurrentDateForMySQL() // e.g., "2025-06-24"
    };

    axios.post(`http://localhost:8800/api/ticketsClone`, clonedValues)
      .then(response => {
        setCheckUpdate(true); // rerender the UI 
      })
      .catch(error => {
        // Handle errors, e.g., display an error message
        console.error('Error');
    });

    // Trigger a refresh of the ticket list
    setCheckUpdate(true);
  } catch (error) {
    console.error(`Error cloning ticket: `, error);
  }
};


/*const [hasMoreTickets, setHasMoreTickets] = useState(true);
const loadMoreTickets = async () => {
  try {
    const response = await fetch(`http://localhost:8800/api/loadData`);
    const data = await response.json();
    if (data.length === 0) {
      // No more tickets to load, hide the "Load More" button
      setHasMoreTickets(false);
      return;
    }
    console.log('Fetched data:', data);
    const newTickets = data.filter((ticket) => !tickets.includes(ticket));
    setTickets((prevTickets) => [...prevTickets, ...newTickets]);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching tickets:', error);
  }
};*/
// Get current tickets 
const indexOfLastTicket = currentPage * ticketsPerPage;
const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

const totalTickets = tickets.length;
const pageNumbers = [];
for(let i=1; i <= Math.ceil(totalTickets / ticketsPerPage); i++){
  pageNumbers.push(i);
}
// Change page 
// const paginate = (pageNumber) => setCurrentPage(pageNumber); => old paginate
const handlePageClick = (data) => {
  setCurrentPage(data.selected + 1); // because pages are 0-indexed in ReactPaginate
};


useEffect(() => {
  // Function to calculate the last available page
  const calculateLastAvailablePage = () => {
    const totalPages = Math.ceil(totalTickets / ticketsPerPage);
    return totalPages || 1; // Ensure there's at least 1 page even if there are no tickets.
};
  setLastAvailablePage(calculateLastAvailablePage());
}, [tickets, ticketsPerPage, totalTickets]); 

const redirectToLastPage = () => {
  if (currentPage !== lastAvailablePage) {
      setCurrentPage(lastAvailablePage);
  }
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

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


  return (
    <>
      <div className='DropdownLine'>
          <div className="dropdownFilter">
          <button className="dropdown-buttonFilter">Filter</button>
          <div className="dropdown-contentFilter">
            <button className="filterAllTicketButton" onClick={showAll}>All Tickets</button>
            <form onSubmit={handleSubmitAssign}>
              <div className='formFilter'>
                <div className='labelFilter'>
                <label htmlFor="assignID" >Assigned:</label>
                </div>
                <div>
                <Select 
                  styles={customSelectStyles}
                  options={usersForOptionsSelect}
                  value={usersForOptionsSelect.find(option => option.value === assignID) || null}
                  onChange={(selectedOption) =>
                    setAssignID(selectedOption ? selectedOption.value : '')
                  }
                  placeholder="Select a user"
                  isSearchable
                />
                <input
                  type="text"
                  className='inputFilter'
                  name='assignID'
                  value={assignID}
                  onChange={handleInputAssign}
                  disabled
                />
                </div>
                <button type="submit" className='submitTickDropdown'>✓</button>
              </div>
          </form>
          <form onSubmit={handleSubmitPriority}>
              <div className='formFilter'>
                <div className='labelFilter'>
                <label htmlFor="priority">Priority:</label>
                </div>
                <div>
                <select
                  name="priority"
                  className="inputFilter"
                  value={priority}
                  onChange={handleInputPriority}
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="1 Critical">1-Critical</option>
                  <option value="2 High">2-High</option>
                  <option value="3 Moderate">3-Moderate</option>
                  <option value="4 Low">4-Low</option>
                </select>
                </div>
                <button type="submit" className='submitTickDropdown'>✓</button>
              </div>
          </form>
          <form onSubmit={handleSubmitState}>
              <div className='formFilter'>
                <div className='labelFilter'>
                <label htmlFor="state" >State:</label>
                </div>
                <div>
                <select
                  name="state"
                  className="inputFilter"
                  value={state}
                  onChange={handleInputState}
                  required
                >
                  <option value="">Select State</option>
                  <option value="New">New</option>
                  <option value="In progress">In progress</option>
                  <option value="Review">Review</option>
                  <option value="Done">Done</option>
                </select>
                </div>
                <button type="submit" className='submitTickDropdown'>✓</button>
              </div>
          </form>
          </div>
        </div>
        <h2 className='h2List'>Ticket List</h2>
        <div className="dropdown">
          <button className="dropdown-button">Sort</button>
          <div className="dropdown-content">
            <div className='CSSdropDownSort'>
              <button onClick={showAll}>All Tickets</button>
              <button onClick={showAssigned}>Assigned</button>
              <button onClick={showPriority}>Priority</button>
              <button onClick={showState}>State</button>
              <button onClick={showCreatedOn}>Created On {sortCreatedOnAsc ? "↑" : "↓"}</button>
              <button onClick={showDeleted}>Deleted</button>
            </div>
          </div>
        </div>
        </div>
        {tickets.length === 0 ? <h3>No tickets found</h3> : null}
        {currentTickets.length === 0 && !loading && redirectToLastPage()} 
        <ul className='ulTicketList'>
            {currentTickets.map((ticket, index) => (
                <li key={ticket.ticketID} className="ticket-box">
                    <p><span className="label">Number:</span> {(currentPage - 1) * ticketsPerPage + index + 1}</p>
                    <p><span className="label">Created On:</span> {formatDate(ticket.created_on)}</p>
                    <p><span className="label">Short Description:</span> {ticket.shortDescription}</p>
                    <p><span className="label">Description:</span> {ticket.description}</p>
                    <p><span className="label">Priority:</span> {ticket.priority}</p>
                    <p><span className="label">State:</span> {ticket.state}</p>
                    <p><span className="label">Assigned To:</span> {ticket.assignedToName}</p>
                    {assignFilter === true && <p><span className="label">Assigned User ID:</span> {ticket.assignedTo}</p>}
                    <div className='buttonsTickets'>
                    {(authButtons && deleted === false && ticket.state !== 'Done') && <button className='buttonBase' onClick={() => handleClickUpdate(ticket.ticketID, tickets)}>Update</button>}
                    {(authButtons && deleted === false && ticket.state === 'Done') && <button className='buttonBase' onClick={() => handleClickClone(ticket)}>Clone</button>}
                    {(authButtons && role === "Admin" && deleted === false) && <button className='buttonBase' onClick={() => handleDelete(ticket.ticketID)}>Delete</button>}
                    {(authButtons && role === "Admin" && deleted === true) && <button className='buttonBase' onClick={() => handleRestore(ticket.ticketID)}>Restore</button>}
                    {(authButtons && role !== "Admin" && deleted === true) && <p className='deletedNote'>Only admins can restore!</p>}
                    </div>
                </li>
            ))}
            {loading && <div className="spinner" />}
        </ul>
        <div className='pagination'>
            <ReactPaginate
              previousLabel={'← Previous'}
              nextLabel={'Next →'}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={lastAvailablePage}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName={'pagination'}
              pageClassName={'page-item'}
              pageLinkClassName={'page-link'}
              previousClassName={'page-item'}
              previousLinkClassName={'page-link'}
              nextClassName={'page-item'}
              nextLinkClassName={'page-link'}
              activeClassName={'active'}
              forcePage={currentPage - 1}
            />
        </div>
    </>
  );
}

export default TicketList;