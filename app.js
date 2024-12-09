// App.js

/*
    SETUP
*/

const express = require("express"); // Import express
const cors = require("cors"); // Import CORS
const db = require("./database/db-connector"); // Import the database connector

const app = express(); // Create an instance of the express app
const PORT = 9101; // Set a port number

// Middleware
app.use(cors());
app.use(express.json()); // Parses JSON data
app.use(express.urlencoded({ extended: true })); // Parses form data
app.use(express.static("public")); // Serve all files in the 'public' folder as static files

// Test DB connection
db.pool.query("SELECT 1", (err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  } else {
    console.log("Database connected successfully");
  }
});

/*
    ROUTES
*/
// Read all customers
app.get("/customers", (req, res) => {
  const query = `
        SELECT customerID, firstName, lastName, email, phoneNumber, tablePreference 
        FROM Customers;
    `;
  db.pool.query(query, (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.json(rows);
    }
  });
});

// Read a single customer by customerID
app.get("/customers/:customerID", (req, res) => {
  const { customerID } = req.params;

  const query = `
        SELECT customerID, firstName, lastName, email, phoneNumber, tablePreference 
        FROM Customers 
        WHERE customerID = ?;
    `;
  
  db.pool.query(query, [customerID], (error, rows) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Database error", details: error });
    } else if (rows.length === 0) {
      res.status(404).json({ error: "Customer not found" });
    } else {
      res.json(rows[0]);
    }
  });
});


app.post("/customers", (req, res) => {
  console.log("Request body:", req.body); // Debugging log
  const { firstName, lastName, email, phoneNumber, tablePreference } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
        INSERT INTO Customers (firstName, lastName, email, phoneNumber, tablePreference) 
        VALUES (?, ?, ?, ?, ?);
    `;
  db.pool.query(query, [firstName, lastName, email, phoneNumber, tablePreference], (error, result) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).send("Error adding customer");
    } else {
      res.status(201).send("Customer added successfully");
    }
  });
});

// Update a customer
app.put("/customers/:customerID", (req, res) => {
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
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.send("Customer updated successfully");
    }
  });
});

// Delete a customer
app.delete("/customers/:customerID", (req, res) => {
  const { customerID } = req.params;
  const query = `
        DELETE FROM Customers 
        WHERE customerID = ?;
    `;
  db.pool.query(query, [customerID], (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.send("Customer deleted successfully");
    }
  });
});

// Reservations
app.get("/reservations", (req, res) => {
  const query = `
        SELECT reservationID, customerID, tableID, reservationDate, reservationTime, partySize, reservationStatus
        FROM Reservations;
    `;
  db.pool.query(query, (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.json(rows);
    }
  });
});

// Read a single reservation by reservationID
app.get("/reservations/:reservationID", (req, res) => {
  const { reservationID } = req.params;

  const query = `
        SELECT reservationID, customerID, tableID, reservationDate, reservationTime, partySize, reservationStatus
        FROM Reservations
        WHERE reservationID = ?;
    `;
  db.pool.query(query, [reservationID], (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error", details: error });
    } else if (rows.length === 0) {
      res.status(404).json({ error: "Reservation not found" });
    } else {
      res.json(rows[0]); // Return the first (and only) row as JSON
    }
  });
});


app.post("/reservations", (req, res) => {
  const { customerID, tableID, reservationDate, reservationTime, partySize, reservationStatus } = req.body;

  if (!customerID || !tableID || !reservationDate || !reservationTime || !partySize || !reservationStatus) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO Reservations (customerID, tableID, reservationDate, reservationTime, partySize, reservationStatus)
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  db.pool.query(
    query,
    [customerID, tableID, reservationDate, reservationTime, partySize, reservationStatus],
    (error) => {
      if (error) {
        console.error("Database error:", error);
        res.status(500).send("Error adding reservation");
      } else {
        res.status(201).send("Reservation added successfully");
      }
    }
  );
});


app.put("/reservations/:reservationID", (req, res) => {
  const { reservationID } = req.params;
  const { reservationDate, reservationTime, partySize, reservationStatus } = req.body;

  if (!reservationDate || !reservationTime || !partySize || !reservationStatus) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    UPDATE Reservations 
    SET reservationDate = ?, reservationTime = ?, partySize = ?, reservationStatus = ?
    WHERE reservationID = ?;
  `;
  db.pool.query(
    query,
    [reservationDate, reservationTime, partySize, reservationStatus, reservationID],
    (error) => {
      if (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error", details: error });
      } else {
        res.send("Reservation updated successfully");
      }
    }
  );
});


app.delete("/reservations/:reservationID", (req, res) => {
  const { reservationID } = req.params;
  const query = `
        DELETE FROM Reservations 
        WHERE reservationID = ?;
    `;
  db.pool.query(query, [reservationID], (error) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.send("Reservation deleted successfully");
    }
  });
});


// Read all tables
app.get("/tables", (req, res) => {
  const query = `
        SELECT tableID, tableSection, tableType, tableSize, availabilityStatus 
        FROM Tables;
    `;
  db.pool.query(query, (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.json(rows); // Return all rows as JSON
    }
  });
});

// Read a single table by tableID
app.get("/tables/:tableID", (req, res) => {
  const { tableID } = req.params;

  const query = `
        SELECT tableID, tableSection, tableType, tableSize, availabilityStatus 
        FROM Tables
        WHERE tableID = ?;
    `;
  db.pool.query(query, [tableID], (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error", details: error });
    } else if (rows.length === 0) {
      res.status(404).json({ error: "Table not found" });
    } else {
      res.json(rows[0]);
    }
  });
});

// Add a new table
app.post("/tables", (req, res) => {
  const { tableSection, tableType, tableSize, availabilityStatus } = req.body;

  if (!tableSection || !tableType || !tableSize || !availabilityStatus) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
        INSERT INTO Tables (tableSection, tableType, tableSize, availabilityStatus) 
        VALUES (?, ?, ?, ?);
    `;
  db.pool.query(query, [tableSection, tableType, tableSize, availabilityStatus], (error, result) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).send("Error adding table");
    } else {
      res.status(201).send("Table added successfully");
    }
  });
});

// Update a table
app.put("/tables/:tableID", (req, res) => {
  const { tableID } = req.params;
  const { tableSection, tableType, tableSize, availabilityStatus } = req.body;

  const query = `
        UPDATE Tables 
        SET tableSection = ?, tableType = ?, tableSize = ?, availabilityStatus = ?
        WHERE tableID = ?;
    `;
  db.pool.query(query, [tableSection, tableType, tableSize, availabilityStatus, tableID], (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.send("Table updated successfully");
    }
  });
});

// Delete a table
app.delete("/tables/:tableID", (req, res) => {
  const { tableID } = req.params;
  const query = `
        DELETE FROM Tables 
        WHERE tableID = ?;
    `;
  db.pool.query(query, [tableID], (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.send("Table deleted successfully");
    }
  });
});

// Staff
app.get("/staff", (req, res) => {
  const query = `
        SELECT staffID, firstName, lastName, phoneNumber, email, staffRole
        FROM Staff;
    `;
  db.pool.query(query, (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.json(rows);
    }
  });
});

// Read a single staff member by staffID
app.get("/staff/:staffID", (req, res) => {
  const { staffID } = req.params;

  const query = `
        SELECT staffID, firstName, lastName, phoneNumber, email, staffRole
        FROM Staff
        WHERE staffID = ?;
    `;
  db.pool.query(query, [staffID], (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error", details: error });
    } else if (rows.length === 0) {
      res.status(404).json({ error: "Staff member not found" });
    } else {
      res.json(rows[0]);
    }
  });
});


app.post("/staff", (req, res) => {
  const { firstName, lastName, phoneNumber, email, staffRole } = req.body;

  if (!firstName || !lastName || !phoneNumber || !email || !staffRole) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
        INSERT INTO Staff (firstName, lastName, phoneNumber, email, staffRole) 
        VALUES (?, ?, ?, ?, ?);
    `;
  db.pool.query(query, [firstName, lastName, phoneNumber, email, staffRole], (error) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).send("Error adding staff");
    } else {
      res.status(201).send("Staff added successfully");
    }
  });
});

app.put("/staff/:staffID", (req, res) => {
  const { staffID } = req.params;
  const { firstName, lastName, phoneNumber, email, staffRole } = req.body;

  const query = `
        UPDATE Staff 
        SET firstName = ?, lastName = ?, phoneNumber = ?, email = ?, staffRole = ?
        WHERE staffID = ?;
    `;
  db.pool.query(query, [firstName, lastName, phoneNumber, email, staffRole, staffID], (error) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.send("Staff updated successfully");
    }
  });
});

app.delete("/staff/:staffID", (req, res) => {
  const { staffID } = req.params;
  const query = `
        DELETE FROM Staff 
        WHERE staffID = ?;
    `;
  db.pool.query(query, [staffID], (error) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.send("Staff deleted successfully");
    }
  });
});

// Schedules
app.get("/schedules", (req, res) => {
  const query = `
        SELECT scheduleID, scheduleDate, scheduleStart, scheduleEnd, scheduleType 
        FROM Schedules;
    `;
  db.pool.query(query, (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.json(rows);
    }
  });
});

app.get("/schedules/:scheduleID", (req, res) => {
  const { scheduleID } = req.params;

  const query = `
        SELECT scheduleID, scheduleDate, scheduleStart, scheduleEnd, scheduleType 
        FROM Schedules 
        WHERE scheduleID = ?;
    `;
  db.pool.query(query, [scheduleID], (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error", details: error });
    } else if (rows.length === 0) {
      res.status(404).json({ error: "Schedule not found" });
    } else {
      res.json(rows[0]);
    }
  });
});


app.post("/schedules", (req, res) => {
  const { scheduleDate, scheduleStart, scheduleEnd, scheduleType } = req.body;

  if (!scheduleDate || !scheduleStart || !scheduleEnd || !scheduleType) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
        INSERT INTO Schedules (scheduleDate, scheduleStart, scheduleEnd, scheduleType) 
        VALUES (?, ?, ?, ?);
    `;
  db.pool.query(query, [scheduleDate, scheduleStart, scheduleEnd, scheduleType], (error) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).send("Error adding schedule");
    } else {
      res.status(201).send("Schedule added successfully");
    }
  });
});

app.put("/schedules/:scheduleID", (req, res) => {
  const { scheduleID } = req.params;
  const { scheduleDate, scheduleStart, scheduleEnd, scheduleType } = req.body;

  const query = `
        UPDATE Schedules 
        SET scheduleDate = ?, scheduleStart = ?, scheduleEnd = ?, scheduleType = ?
        WHERE scheduleID = ?;
    `;
  db.pool.query(query, [scheduleDate, scheduleStart, scheduleEnd, scheduleType, scheduleID], (error) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.send("Schedule updated successfully");
    }
  });
});

app.delete("/schedules/:scheduleID", (req, res) => {
  const { scheduleID } = req.params;
  const query = `
        DELETE FROM Schedules 
        WHERE scheduleID = ?;
    `;
  db.pool.query(query, [scheduleID], (error) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.send("Schedule deleted successfully");
    }
  });
});

// StaffSchedules (Intersection Table)
app.get("/staffSchedules", (req, res) => {
  const query = `
        SELECT staffID, scheduleID 
        FROM StaffSchedules;
    `;
  db.pool.query(query, (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.json(rows);
    }
  });
});

app.post("/staffSchedules", (req, res) => {
  const { staffID, scheduleID } = req.body;

  if (!staffID || !scheduleID) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
        INSERT INTO StaffSchedules (staffID, scheduleID) 
        VALUES (?, ?);
    `;
  db.pool.query(query, [staffID, scheduleID], (error) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).send("Error adding staff schedule");
    } else {
      res.status(201).send("Staff schedule added successfully");
    }
  });
});

// Update a staff schedule (staffID or scheduleID)
app.put("/staffSchedules", (req, res) => {
  const { oldStaffID, oldScheduleID, newStaffID, newScheduleID } = req.body;

  if (!oldStaffID || !oldScheduleID || !newStaffID || !newScheduleID) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
        UPDATE StaffSchedules 
        SET staffID = ?, scheduleID = ? 
        WHERE staffID = ? AND scheduleID = ?;
    `;
  db.pool.query(query, [newStaffID, newScheduleID, oldStaffID, oldScheduleID], (error) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).send("Error updating staff schedule");
    } else {
      res.send("Staff schedule updated successfully");
    }
  });
});

app.delete("/staffSchedules", (req, res) => {
  const { staffID, scheduleID } = req.body;

  const query = `
        DELETE FROM StaffSchedules 
        WHERE staffID = ? AND scheduleID = ?;
    `;
  db.pool.query(query, [staffID, scheduleID], (error) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.send("Staff schedule deleted successfully");
    }
  });
});

// StaffTables (Intersection Table)
app.get("/staffTables", (req, res) => {
  const query = `
        SELECT staffID, tableID 
        FROM StaffTables;
    `;
  db.pool.query(query, (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.json(rows);
    }
  });
});

app.post("/staffTables", (req, res) => {
  const { staffID, tableID } = req.body;

  if (!staffID || !tableID) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
        INSERT INTO StaffTables (staffID, tableID) 
        VALUES (?, ?);
    `;
  db.pool.query(query, [staffID, tableID], (error) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).send("Error adding staff table");
    } else {
      res.status(201).send("Staff table added successfully");
    }
  });
});

// Update a staff table (staffID or tableID)
app.put("/staffTables", (req, res) => {
  const { oldStaffID, oldTableID, newStaffID, newTableID } = req.body;

  if (!oldStaffID || !oldTableID || !newStaffID || !newTableID) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
        UPDATE StaffTables 
        SET staffID = ?, tableID = ? 
        WHERE staffID = ? AND tableID = ?;
    `;
  db.pool.query(query, [newStaffID, newTableID, oldStaffID, oldTableID], (error) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).send("Error updating staff table");
    } else {
      res.send("Staff table updated successfully");
    }
  });
});

app.delete("/staffTables", (req, res) => {
  const { staffID, tableID } = req.body;

  const query = `
        DELETE FROM StaffTables 
        WHERE staffID = ? AND tableID = ?;
    `;
  db.pool.query(query, [staffID, tableID], (error) => {
    if (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Database error", details: error });
    } else {
      res.send("Staff table deleted successfully");
    }
  });
});


/*
    LISTENER
*/

app.listen(PORT, function () {
  console.log("Express started on http://localhost:" + PORT + "; press Ctrl-C to terminate.");
});
