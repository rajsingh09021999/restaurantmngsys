// App.js

/*
    SETUP
*/

const express = require('express');             // Import express
const cors = require('cors');                   // Import CORS
const db = require('./database/db-connector');  // Import the database connector

const app = express();                          // Create an instance of the express app
const PORT = 9101;                              // Set a port number

// Middleware
app.use(cors());
app.use(express.json()); // Parses JSON data
app.use(express.urlencoded({ extended: true })); // Parses form data
app.use(express.static('public')); // Serve all files in the 'public' folder as static files

// Test DB connection
db.pool.query('SELECT 1', (err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    } else {
        console.log('Database connected successfully');
    }
});

/*
    ROUTES
*/

// Read all customers
app.get('/customers', (req, res) => {
    const query = `
        SELECT customerID, firstName, lastName, email, phoneNumber, tablePreference 
        FROM Customers;
    `;
    db.pool.query(query, (error, rows) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Database error', details: error });
        } else {
            res.json(rows);
        }
    });
});

app.post('/customers', (req, res) => {
    console.log('Request body:', req.body); // Debugging log
    const { firstName, lastName, email, phoneNumber, tablePreference } = req.body;
    
    if (!firstName || !lastName || !email || !phoneNumber) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    const query = `
        INSERT INTO Customers (firstName, lastName, email, phoneNumber, tablePreference) 
        VALUES (?, ?, ?, ?, ?);
    `;
    db.pool.query(query, [firstName, lastName, email, phoneNumber, tablePreference], (error, result) => {
        if (error) {
            console.error('Database error:', error);
            res.status(500).send('Error adding customer');
        } else {
            res.status(201).send('Customer added successfully');
        }
    });
});

// Update a customer
app.put('/customers/:customerID', (req, res) => {
    const { customerID } = req.params;
    const { firstName, lastName, email, phoneNumber, tablePreference } = req.body;

    const query = `
        UPDATE Customers 
        SET firstName = ?, lastName = ?, email = ?, phoneNumber = ?, tablePreference = ?
        WHERE customerID = ?;
    `;
    db.pool.query(query, [firstName, lastName, email, phoneNumber, tablePreference, customerID], (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Database error', details: error });
        } else {
            res.send('Customer updated successfully');
        }
    });
});

// Delete a customer
app.delete('/customers/:customerID', (req, res) => {
    const { customerID } = req.params;
    const query = `
        DELETE FROM Customers 
        WHERE customerID = ?;
    `;
    db.pool.query(query, [customerID], (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Database error', details: error });
        } else {
            res.send('Customer deleted successfully');
        }
    });
});

/*
    LISTENER
*/

app.listen(PORT, function () {
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.');
});
