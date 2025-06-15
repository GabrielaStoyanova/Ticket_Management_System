import express from "express";
import mysql from "mysql2";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
const salt = 10;

const app = express();
const port = 8800;
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["POST", "GET", "PUT"],
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const dataBase = mysql.createConnection({
    host:'127.0.0.1',
    user: 'root',
    password: 'Decata_2002',
    database: 'ticket_management_system'
})

// API route to fetch data
//app.get("/api/data", (req, res)=> {
    //const query = 'SELECT * FROM ticket_management_system.ticket';
    //dataBase.query(query, (error, results)=> {
        //if(error) throw error;
        //res.json(results);
    //})
//})

app.get("/api/data", (req, res) => {
    const query = `SELECT 
        ticket.*, 
        user.fullName AS assignedToName 
      FROM 
        ticket_management_system.ticket 
      LEFT JOIN 
        ticket_management_system.user 
      ON 
        ticket.assignedTo = user.userID 
      WHERE 
        ticket.is_deleted = FALSE;
    `;
    dataBase.query(query, (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

/*app.get("/api/loadData", (req, res) => {
  const query = `SELECT * FROM ticket_management_system.ticket WHERE is_deleted = FALSE AND ticketID>5 LIMIT 5;`;
  dataBase.query(query, (error, results) => {
      if (error) throw error;
      res.json(results);
  });
});*/

app.get("/api/deleted", (req, res) => {
  const query = `SELECT 
        ticket.*, 
        user.fullName AS assignedToName 
      FROM 
        ticket_management_system.ticket 
      LEFT JOIN 
        ticket_management_system.user 
      ON 
        ticket.assignedTo = user.userID 
      WHERE 
        ticket.is_deleted = TRUE;
    `;
  dataBase.query(query, (error, results) => {
      if (error) throw error;
      res.json(results);
  });
});

app.post('/api/login', (req, res) => {
    
    // Perform a database query to check if the user exists, but only by fullName, because the passwoed is hashed
    const query = `SELECT * FROM ticket_management_system.user WHERE fullName = ?`;

    dataBase.query(query, [req.body.fullName], (error, results) => {
      if (error) return res.json("Login error in server!");
      if (results.length > 0){ // if the email exists in the database 
        // compare the password // the first record of the data => results[0]
        bcrypt.compare(req.body.passwordHash.toString(), results[0].passwordHash, (err, response) => {
          if (err) return res.json("Password compare error!");
          if(response){
            const name = results[0].fullName; // grab the fullName from the record
            const role = results[0].role; // grab the role from the record for the update and delete logic
            const userID = results[0].userID;
            const token = jwt.sign({name, role, userID}, "jwt-secret-token", {expiresIn: '1d'}); // create the token
            res.cookie('token', token);
            return res.json({Status: "Success!"});
          }else {
            return res.json({Status: "Error", Message: "Invalid password!"}); // <- Add this
          }        
        })
      }else{
        return res.json("No record");
      }
    });
  });
  
app.post('/api/register', (req, res) => {
    
  const query = "INSERT INTO user ( `firstName`, `lastName`, `fullName`, `passwordHash`, `role`) VALUES (?)";
  bcrypt.hash(req.body.passwordHash.toString(), salt, (error, hash) => {
    if(error) return res.json({Error: "Error for hassing password"});
    const values = [
      req.body.firstName,
      req.body.lastName,
      req.body.fullName,
      hash,
      req.body.role
    ];

    dataBase.query(query, [values], (error, results) => {
      if (error) return res.json({Error: "Register failed!"});
      return res.json({Status: "Success"});
      
    });
  })
    
});

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if(!token){
    return res.json({Error: "You are not authenticated"});
  }else{
    jwt.verify(token, "jwt-secret-token", (err, decoded) => {
      if(err){
        return res.json({Error: "Token not correct"});
      }else{
        req.name = decoded.name;
        req.role = decoded.role;
        req.userID = decoded.userID;
        next();
      }
    })
  }
};

app.get('/api/verifyUser', verifyUser, (req, res) => {
  return res.json({Status: "Success"});
});

app.get('/api/logout', (req, res) => {
  res.clearCookie('token');
  // res.clearCookie('connect.sid', {path: '/'}).status(200).send('Ok.');
  return res.json({Status: "Success"});
});

const verifyRole = (req, res, next) => {
  const token = req.cookies.token;
  if(!token){
    return res.json({Error: "You are not authenticated"});
  }else{
    jwt.verify(token, "jwt-secret-token", (err, decoded) => {
      if(err){
        return res.json({Error: "Token not correct"});
      }else{
        req.role = decoded.role;
        next();
      }
    })
  }
};

app.get('/api/getRole',verifyRole, (req, res) => {
  return res.json({Status: "Success", role: req.role}); // Use req.role from the verifyUser middleware
});

import updateStatus from './JiraCloudRestAPI/JIRA-Cloud-REST-API-Tutorial/update-status.js';
app.put('/api/ticketsDelete/:ticketID', (req, res) => {
  
  const ticketID = req.params.ticketID;
  
  const query = 'UPDATE ticket SET is_deleted = TRUE WHERE ticketID = ?';
  dataBase.query(query, [ticketID], (error, results) => {
      if (error) {
          return res.json({Error: "Error updating ticket."});
      }
      return res.json({Status: "Success"});
  });

  const jiraQuery = `SELECT jiraID FROM ticket_management_system.ticket WHERE ticketID = ?`;
dataBase.query(jiraQuery, [ticketID], (error, results) => {
    if (error) throw error;
    
    if (results.length > 0) {
        const jiraID = results[0].jiraID;
        const updateStatusFunc = async () => {
          const status = await updateStatus(jiraID, '41');
          // 41 = DONE
          console.log(jiraID);
          console.log(status);
          try {
            await sendMessage({
              action: "delete",
              jiraID: jiraID
            });
          } catch (slackError) {
            console.error("Failed to send Slack message:", slackError);
          }
        };
        updateStatusFunc();
    } else {
        console.log("No matching record found.");
    }
});

});

function mapPriorityToJiraPriority(priority) {
  switch (priority) {
    case '1 Critical':
      return 'Highest';
    case '2 High':
      return 'High';
    case '3 Moderate':
      return 'Medium';
    case '4 Low':
      return 'Low';
    default:
      return priority; // Return the input value if it doesn't match any predefined values
  }
}

function mapAddTicketStateToJiraState(state) {
  switch (state) {
    case 'New':
      return '11';
    case 'In progress':
      return '21';
    case 'Review':
      return '31';
    case 'Done':
      return '41';
    default:
      return '0'; // Return the input value if it doesn't match any predefined values
  }
}

import updateIssue from './JiraCloudRestAPI/JIRA-Cloud-REST-API-Tutorial/update-summary-description.js';
app.put('/api/ticketsUpdate/:ticketID', (req, res) => {
  
  const ticketID = req.params.ticketID;

  const query = 'UPDATE ticket SET shortDescription = ?, description = ?, assignedTo = ?, state = ?, priority = ? WHERE ticketID = ?';

  const values = [
    req.body.shortDescription,
    req.body.description,
    req.body.assignedTo,
    req.body.state,
    req.body.priority,
    ticketID, // Append ticketID to the end of the values array
  ];

  dataBase.query(query, values, (error, results) => {
      if (error) {
          return res.json({Error: "Error updating ticket."});
      }
      return res.json({Status: "Success"});
  });

  const jiraQuery = `SELECT jiraID FROM ticket_management_system.ticket WHERE ticketID = ?`;
dataBase.query(jiraQuery, [ticketID], (error, results) => {
    if (error) throw error;
    
    if (results.length > 0) {
        const jiraID = results[0].jiraID;
        const updateIssueFunc = async () => {
            const status = await updateIssue(jiraID, req.body.shortDescription, req.body.description, mapPriorityToJiraPriority(req.body.priority));
            console.log(jiraID);
        };
        updateIssueFunc();
        const updateStatusFunc = async () => {
          const status = await updateStatus(jiraID,  mapAddTicketStateToJiraState(req.body.state));
          console.log(jiraID);
          console.log(status);
          if(status === undefined && req.body.state === 'Done'){
            const status = await updateStatus(jiraID, '41');
            console.log(jiraID);
            console.log(status);
          }
        };
        updateStatusFunc();
        const sendMessageSlack = async () => {
          try {
            await sendMessage({
              action: "update",
              createdOn: req.body.created_on,
              shortDescription: req.body.shortDescription,
              description: req.body.description,
              priority: req.body.priority,
              state: req.body.state,
              assignedTo: req.body.assignedToName, //get the name of the user not the ID
              jiraID: jiraID
            });
          } catch (slackError) {
            console.error("Failed to send Slack message:", slackError);
          }
        }
        sendMessageSlack();
    } else {
        console.log("No matching record found.");
    }
  });
});

app.post('/api/ticketsClone', (req, res) => {

  const query = "INSERT INTO ticket ( `shortDescription`, `description`, `assignedTo`, `state`, `priority`, `created_on`, `jiraID`) VALUES (?)";
  
    const values = [
      req.body.shortDescription,
      req.body.description,
      req.body.assignedTo,
      req.body.state,
      req.body.priority,
      req.body.created_on,
      null,
    ];

    dataBase.query(query, [values], (error, results) => {
      if (error) return res.json({Error: "Add failed!"});
      try {
        const createIssueApp = async () => {
          const issueType = 'Task';
          const summary = req.body.shortDescription;
          const description = req.body.description;
          const jiraPriority = mapPriorityToJiraPriority(req.body.priority);
          const startDate = req.body.created_on;
        
          const issueKey = await createIssue('SCRUM', issueType, summary, description, jiraPriority, startDate);
          console.log(`Created issue with key: ${issueKey}`);

          const updateQuery = "UPDATE ticket SET jiraID = ? WHERE ticketID = ?";
        dataBase.query(updateQuery, [issueKey, results.insertId], (updateError, updateResults) => {
          if (updateError) {
            return res.json({ Error: "Failed to update jiraID for the ticket" });
          }
        });
        const updateStatusFunc = async () => {
          const status = await updateStatus(issueKey,  mapAddTicketStateToJiraState(req.body.state));
          console.log(issueKey);
          console.log(status);
        };
        updateStatusFunc();
        try {
            await sendMessage({
              action: "add",
              createdOn: req.body.created_on,
              shortDescription: req.body.shortDescription,
              description: req.body.description,
              priority: req.body.priority,
              state: req.body.state,
              assignedTo: req.body.assignedToName, //get the name of the user not the ID
              jiraID: issueKey
            });
          } catch (slackError) {
            console.error("Failed to send Slack message:", slackError);
          }
        }
        createIssueApp();
  
      } catch (jiraError) {
        return res.json({ Error: "Failed to create Jira issue"});
      }
    return res.json({ Status: "Success" });
  });
});


app.get("/api/checkAssignTo", (req, res) => {
  const query = `SELECT userID FROM ticket_management_system.user`;
  dataBase.query(query, (error, results) => {
      if (error) throw error;
      res.json(results);
  });
});

import createIssue from "./JiraCloudRestAPI/JIRA-Cloud-REST-API-Tutorial/create-issue.js"; // Jira create issue 
import sendMessage from "./SlackCodes/SendMessage.js"
app.post('/api/addTicket', (req, res) => {
    
  const query = "INSERT INTO ticket ( `shortDescription`, `description`, `assignedTo`, `state`, `priority`, `created_on`, `jiraID`) VALUES (?)";
  
    const values = [
      req.body.shortDescription,
      req.body.description,
      req.body.assignedTo,
      req.body.state,
      req.body.priority,
      req.body.created_on,
      null,
    ];

    dataBase.query(query, [values], (error, results) => {
      if (error) return res.json({Error: "Add failed!"});
       // If the database insertion is successful, create an issue in Jira
       try {
        const createIssueApp = async () => {
          const issueType = 'Task';
          const summary = req.body.shortDescription;
          const description = req.body.description;
          const jiraPriority = mapPriorityToJiraPriority(req.body.priority);
          const startDate = req.body.created_on;
        
          // Note that we are using the project key which will be auto created in the above function call
          const issueKey = await createIssue('SCRUM', issueType, summary, description, jiraPriority, startDate);
          console.log(`Created issue with key: ${issueKey}`);

          const updateQuery = "UPDATE ticket SET jiraID = ? WHERE ticketID = ?";
        dataBase.query(updateQuery, [issueKey, results.insertId], (updateError, updateResults) => {
          if (updateError) {
            return res.json({ Error: "Failed to update jiraID for the ticket" });
          }
        });
        const updateStatusFunc = async () => {
          const status = await updateStatus(issueKey,  mapAddTicketStateToJiraState(req.body.state));
          console.log(issueKey);
          console.log(status);
        };
        updateStatusFunc();
        try {
            await sendMessage({
              action: "add",
              createdOn: req.body.created_on,
              shortDescription: req.body.shortDescription,
              description: req.body.description,
              priority: req.body.priority,
              state: req.body.state,
              assignedTo: req.body.assignedToName, //get the name of the user not the ID
              jiraID: issueKey
            });
          } catch (slackError) {
            console.error("Failed to send Slack message:", slackError);
          }
        }
        createIssueApp();
  
      } catch (jiraError) {
        return res.json({ Error: "Failed to create Jira issue"});
      }
      return res.json({Status: "Success"});
    });
    
});

const verifyAccount = (req, res, next) => {
  const token = req.cookies.token;
  if(!token){
    return res.json({Error: "You are not authenticated"});
  }else{
    jwt.verify(token, "jwt-secret-token", (err, decoded) => {
      if(err){
        return res.json({Error: "Token not correct"});
      }else{
        req.name = decoded.name;
        req.role = decoded.role;
        req.userID = decoded.userID;
        next();
      }
    })
  }
};

app.get('/api/getAccount', verifyAccount, (req, res) => {
  const account = {
    name: req.name,
    role: req.role,
    userID: req.userID,
  };
  
  return res.json(account);
});

app.get('/api/assignFilter/:assignID', (req, res) => {
  
  const assignedTo = req.params.assignID;

  const query = `
    SELECT 
      ticket.*, 
      user.fullName AS assignedToName 
    FROM 
      ticket_management_system.ticket 
    LEFT JOIN 
      ticket_management_system.user 
    ON 
      ticket.assignedTo = user.userID 
    WHERE 
      ticket.assignedTo = ? 
      AND ticket.is_deleted = FALSE;
  `;

  dataBase.query(query, assignedTo, (error, results) => {
      if (error) {
          return res.json({Error: "Error updating ticket."});
      }
      return res.json(results);
  });
});

app.get('/api/priorityFilter/:priority', (req, res) => {
  
  const priority = req.params.priority;

  const query = `
      SELECT 
        ticket.*, 
        user.fullName AS assignedToName 
      FROM 
        ticket_management_system.ticket 
      LEFT JOIN 
        ticket_management_system.user 
      ON 
        ticket.assignedTo = user.userID 
      WHERE 
        ticket.priority = ? 
        AND ticket.is_deleted = FALSE;
  `;

  dataBase.query(query, priority, (error, results) => {
      if (error) {
          return res.json({Error: "Error updating ticket."});
      }
      return res.json(results);
  });
});

app.get('/api/stateFilter/:state', (req, res) => {
  
  const state = req.params.state;

  const query = `
    SELECT 
      ticket.*, 
      user.fullName AS assignedToName 
    FROM 
      ticket_management_system.ticket 
    LEFT JOIN 
      ticket_management_system.user 
    ON 
      ticket.assignedTo = user.userID 
    WHERE 
      ticket.state = ? 
      AND ticket.is_deleted = FALSE;
  `;

  dataBase.query(query, state, (error, results) => {
      if (error) {
          return res.json({Error: "Error updating ticket."});
      }
      return res.json(results);
  });
});

app.get("/api/userList", (req, res) => {
  const query = `SELECT userID, fullName, role FROM ticket_management_system.user;`;
  dataBase.query(query, (error, results) => {
      if (error) throw error;
      res.json(results);
  });
});

app.put('/api/ticketsRestore/:ticketID', (req, res) => {
  
  const ticketID = req.params.ticketID;
  
  const query = "UPDATE ticket SET is_deleted = FALSE, state = 'In progress' WHERE ticketID = ?";
  dataBase.query(query, [ticketID], (error, results) => {
      if (error) {
          return res.json({Error: "Error restoring ticket."});
      }
      return res.json({Status: "Success"});
  });

  const jiraQuery = `SELECT jiraID FROM ticket_management_system.ticket WHERE ticketID = ?`;
  dataBase.query(jiraQuery, [ticketID], (error, results) => {
    if (error) throw error;
    
    if (results.length > 0) {
        const jiraID = results[0].jiraID;
        const updateStatusFuncAndSlackMessage = async () => {
          const status = await updateStatus(jiraID, '21');
          // 21 = In progress
          console.log(jiraID);
          console.log(status);
          try {
            await sendMessage({
              action: "restore",
              jiraID: jiraID
            });
          } catch (slackError) {
            console.error("Failed to send Slack message:", slackError);
          }
        };
        updateStatusFuncAndSlackMessage();
    } else {
        console.log("No matching record found.");
    }
  });
});

// Example Express route
app.get('/api/dateFilter/:createdOn', (req, res) => {
  const { createdOn } = req.params;
  const query = "SELECT * FROM tickets WHERE DATE(created_on) = ?";
  db.query(query, [createdOn], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get('/api/checkFullName/:fullName', (req, res) => {
  const fullName = req.params.fullName;
  const query = 'SELECT * FROM ticket_management_system.user WHERE fullName = ?';
  
  dataBase.query(query, [fullName], (error, results) => {
    if (error) return res.status(500).json({ error: "Database error" });

    if (results.length > 0) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  });
});

app.listen(port, ()=>{
  console.log(`Listinning to port ${port}`);
})