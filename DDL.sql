-- Disable foreign key checks and autocommit to reduce import errors
SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT=0;

-- Drop existing tables if they exist to prevent errors during creation
DROP TABLE IF EXISTS StaffSchedules;
DROP TABLE IF EXISTS StaffTables;
DROP TABLE IF EXISTS Reservations;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Tables;
DROP TABLE IF EXISTS Staff;
DROP TABLE IF EXISTS Schedules;

-- Creating Customers table to store customer details including their table preferences
CREATE TABLE Customers (
    customerID INT AUTO_INCREMENT,                          -- Unique identifier for each customer
    firstName VARCHAR(50) NOT NULL,                         
    lastName VARCHAR(50) NOT NULL,                         
    email VARCHAR(100) NOT NULL,                           
    phoneNumber VARCHAR(15) NOT NULL,                       
    tablePreference ENUM('Window', 'Balcony', 'Patio', 'Bar', 'Main Dining Room', 'Private Room'), -- Preferred table section, can be NULL if not specified
    PRIMARY KEY (customerID)                                -- Primary key for unique identification
);

-- Creating Reservations table to record reservation details and link to Customers and Tables
CREATE TABLE Reservations (
    reservationID INT AUTO_INCREMENT,                               
    customerID INT NOT NULL,                                        -- Foreign key linking to Customers table
    tableID INT NULL,                                               -- Foreign key linking to Tables table
    reservationDate DATE NOT NULL,                                  
    reservationTime TIME NOT NULL,                                 
    partySize INT NOT NULL,                                       
    reservationStatus ENUM('Booked', 'Canceled', 'Completed') NOT NULL, 
    PRIMARY KEY (reservationID),                                    -- Primary key for unique reservation identification
    -- ON DELETE CASCADE: If a customer is deleted, all the reservations associated with it will be deleted .
    -- ON UPDATE CASCADE: If the primary key (customerID) in Customers is updated,
    -- the corresponding customerID in Reservations will also update automatically.
    FOREIGN KEY (customerID) REFERENCES Customers(customerID) ON DELETE CASCADE ON UPDATE CASCADE, -- Foreign key linking to the Customers table.                                         
    FOREIGN KEY (tableID) REFERENCES Tables(tableID) ON DELETE SET NULL ON UPDATE CASCADE     -- ON DELETE SET NULL: If a table record is deleted in the Tables table,
                                                                                              -- the tableID in any associated reservations will be set to NULL in the Reservations table,
);

-- Creating Tables table to record details of each restaurant table (size, type, availability status)
CREATE TABLE Tables (
    tableID INT AUTO_INCREMENT,                                            
    tableSection ENUM('Window', 'Balcony', 'Patio', 'Bar', 'Main Dining Room', 'Private Room') NOT NULL, -- Table section in the restaurant, 
    tableType ENUM('Standard', 'Booth', 'High-top', 'Low-top', 'Communal') NOT NULL, -- Type of table
    tableSize INT NOT NULL,                                                 -- Number of seats available at the table
    availabilityStatus ENUM('Available', 'Occupied', 'Reserved') NOT NULL,  
    PRIMARY KEY (tableID)                                                   -- Primary key for table identification
);

-- Creating Staff table to store employee details (servers, hosts, etc.) and roles
CREATE TABLE Staff (
    staffID INT AUTO_INCREMENT,                     -- Unique identifier for each staff member
    firstName VARCHAR(50) NOT NULL,                 
    lastName VARCHAR(50) NOT NULL,                 
    phoneNumber VARCHAR(15) NOT NULL,              
    email VARCHAR(100) NOT NULL,                    
    staffRole ENUM('Server', 'Host', 'Bartender', 'Chef', 'Manager') NOT NULL,
    PRIMARY KEY (staffID)                           -- Primary key for unique staff identification
);

-- Creating Schedules table to store details of shifts that can be assigned to staff members
CREATE TABLE Schedules (
    scheduleID INT AUTO_INCREMENT,                         -- Unique identifier for each schedule
    scheduleDate DATE NOT NULL,                           
    scheduleStart TIME NOT NULL,                           
    scheduleEnd TIME NOT NULL,                            
    scheduleType ENUM('Morning', 'Afternoon', 'Evening') NOT NULL, 
    PRIMARY KEY (scheduleID)                               -- Primary key for unique schedule identification
);

-- Creating StaffSchedules table to map the many-to-many relationship between Staff and Schedules
CREATE TABLE StaffSchedules (
    staffID INT NOT NULL,                       -- Foreign key linking to Staff table
    scheduleID INT NOT NULL,                    -- Foreign key linking to Schedules table
    PRIMARY KEY (staffID, scheduleID),          -- Composite primary key for each unique staff-schedule pairing
    FOREIGN KEY (staffID) REFERENCES Staff(staffID) ON DELETE CASCADE ON UPDATE CASCADE, -- Cascade on delete/update for staff changes
    FOREIGN KEY (scheduleID) REFERENCES Schedules(scheduleID) ON DELETE CASCADE ON UPDATE CASCADE -- Cascade on delete/update for schedule changes
);

-- Creating StaffTables table to map the many-to-many relationship between Staff and Tables
CREATE TABLE StaffTables (
    staffID INT NOT NULL,                       -- Foreign key linking to Staff table
    tableID INT NOT NULL,                       -- Foreign key linking to Tables table
    PRIMARY KEY (staffID, tableID),             -- Composite primary key for each unique staff-table pairing
    FOREIGN KEY (staffID) REFERENCES Staff(staffID) ON DELETE CASCADE ON UPDATE CASCADE, 
    FOREIGN KEY (tableID) REFERENCES Tables(tableID) ON DELETE CASCADE ON UPDATE CASCADE 
);

-- Insert sample data into Customers table
INSERT INTO Customers (firstName, lastName, email, phoneNumber, tablePreference) VALUES
('John', 'Doe', 'john.doe@gmail.com', '1234567890', 'Window'),
('Sarah', 'Smith', 'sarah.smith@oregonstate.com', '1987654321', 'Main Dining Room'),
('Michael', 'Brown', 'mike.brown@gmail.com', '1123456789', NULL),
('Emily', 'Davis', 'emily.davis@expensify.com', '1098765432', 'Patio'),
('Chris', 'Wilson', 'chris.wilson@gmail.com', '1234987654', 'Private Room');

-- Insert sample data into Tables table
INSERT INTO Tables (tableSection, tableType, tableSize, availabilityStatus) VALUES
('Window', 'Standard', 4, 'Available'),
('Window', 'Booth', 4, 'Reserved'),
('Balcony', 'Low-top', 2, 'Reserved'),
('Balcony', 'High-top', 2, 'Available'),
('Patio', 'Communal', 6, 'Occupied'),
('Patio', 'Standard', 4, 'Available'),
('Main Dining Room', 'Booth', 8, 'Reserved'),
('Main Dining Room', 'Standard', 6, 'Available'),
('Private Room', 'Standard', 10, 'Reserved'),
('Bar', 'High-top', 2, 'Available'),
('Bar', 'Standard', 4, 'Occupied');

-- Insert sample data into Reservations table
INSERT INTO Reservations (customerID, tableID, reservationDate, reservationTime, partySize, reservationStatus) VALUES
(1, 1, '2024-11-01', '18:30:00', 4, 'Booked'),
(2, 7, '2024-11-01', '19:00:00', 2, 'Completed'),
(3, 6, '2024-11-02', '20:00:00', 3, 'Booked'),
(4, 5, '2024-11-03', '18:00:00', 6, 'Canceled'),
(5, 9, '2024-11-04', '18:45:00', 4, 'Booked');

-- Insert sample data into Staff table
INSERT INTO Staff (firstName, lastName, phoneNumber, email, staffRole) VALUES
('Alice', 'Johnson', '1234567890', 'alice.johnson@gmail.com', 'Server'),
('Bob', 'Smith', '1987654321', 'bob.smith@yahoo.com', 'Host'),
('Carol', 'Davis', '1123456789', 'carol.davis@outlook.com', 'Bartender'),
('David', 'Brown', '1098765432', 'david.brown@icloud.com', 'Chef'),
('Eve', 'Wilson', '1234987654', 'eve.wilson@aol.com', 'Server');

-- Insert sample data into Schedules table
INSERT INTO Schedules (scheduleDate, scheduleStart, scheduleEnd, scheduleType) VALUES
('2024-11-01', '08:00:00', '12:00:00', 'Morning'),
('2024-11-01', '12:00:00', '16:00:00', 'Afternoon'),
('2024-11-01', '16:00:00', '20:00:00', 'Evening'),
('2024-11-02', '08:00:00', '12:00:00', 'Morning'),
('2024-11-02', '12:00:00', '16:00:00', 'Afternoon');

-- Insert sample data into StaffSchedules table
INSERT INTO StaffSchedules (staffID, scheduleID) VALUES
(1, 1), (1, 3), (2, 2), (3, 3), (4, 4), (5, 5);

-- Insert sample data into StaffTables table
INSERT INTO StaffTables (staffID, tableID) VALUES
(1, 1), (1, 2), (1, 6), (2, 4), (2, 3), (3, 10), (3, 11), (4, 7), (5, 5), (5, 9);

-- Enable foreign key checks and commit changes
SET FOREIGN_KEY_CHECKS=1;
COMMIT;
