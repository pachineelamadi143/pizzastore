# User Story 1 — Database Setup (DDL)

-- Tasks:

-- 1. Create a database named TechNovaDB.
CREATE DATABASE TechNovaDB;
USE TechNovaDB;

-- 2. Create the following tables with appropriate data types, constraints, and normalization rules:
-- ○ Department(DeptID, DeptName, Location)
-- ○ Employee(EmpID, EmpName, Gender, DOB, HireDate, DeptID)
-- ○ Project(ProjectID, ProjectName, DeptID, StartDate, EndDate)
-- ○ Performance(EmpID, ProjectID, Rating, ReviewDate)
-- ○ Reward(EmpID, RewardMonth, RewardAmount)

-- Table 1: Department
CREATE TABLE Department (
    DeptID INT PRIMARY KEY,
    DeptName VARCHAR(50) NOT NULL UNIQUE,
    Location VARCHAR(50) NOT NULL
);

-- Table 2: Employee
CREATE TABLE Employee (
    EmpID INT PRIMARY KEY,
    EmpName VARCHAR(100) NOT NULL,
    Gender CHAR(1) CHECK (Gender IN ('M', 'F')),
    DOB DATE NOT NULL,
    HireDate DATE NOT NULL,
    DeptID INT,
    FOREIGN KEY (DeptID) REFERENCES Department(DeptID)
);

-- Table 3: Project
CREATE TABLE Project (
    ProjectID INT PRIMARY KEY,
    ProjectName VARCHAR(100) NOT NULL,
    DeptID INT,
    StartDate DATE NOT NULL,
    EndDate DATE,
    FOREIGN KEY (DeptID) REFERENCES Department(DeptID)
);

-- Table 4: Performance
CREATE TABLE Performance (
    EmpID INT,
    ProjectID INT,
    Rating DECIMAL(3,1) CHECK (Rating BETWEEN 1.0 AND 5.0),
    ReviewDate DATE NOT NULL,
    PRIMARY KEY (EmpID, ProjectID),
    FOREIGN KEY (EmpID) REFERENCES Employee(EmpID),
    FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID)
);

-- Table 5: Reward
CREATE TABLE Reward (
    EmpID INT,
    RewardMonth DATE NOT NULL,
    RewardAmount DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (EmpID, RewardMonth),
    FOREIGN KEY (EmpID) REFERENCES Employee(EmpID)
);


-- 3. Define primary keys, foreign keys, and unique constraints where applicable.

-- Index on EmpName for fast employee name lookups
CREATE INDEX idx_empname ON Employee(EmpName);

-- 4. Create an index on EmpName and DeptID to optimize frequent lookups.

-- Index on DeptID in Employee table for fast department lookups
CREATE INDEX idx_deptid ON Employee(DeptID);

SHOW INDEX FROM Employee;

# User Story 2 — Insert and Manage Data (DML)

-- Tasks:

-- 1. Insert at least 5 records each into Department, Employee, Project, Performance, and Reward tables

INSERT INTO Department VALUES
(101, 'IT', 'Bangalore'),
(102, 'HR', 'Delhi'),
(103, 'Finance', 'Mumbai'),
(104, 'Marketing', 'Chennai'),
(105, 'Operations', 'Hyderabad');


INSERT INTO Employee VALUES
(1, 'Asha', 'F', '1990-07-12', '2018-06-10', 101),
(2, 'Raj', 'M', '1988-04-09', '2020-03-22', 102),
(3, 'Neha', 'F', '1995-01-15', '2021-08-05', 101),
(4, 'Arjun', 'M', '1992-11-20', '2019-05-15', 103),
(5, 'Priya', 'F', '1993-03-25', '2022-01-10', 104),
(6, 'Kiran', 'M', '1991-08-30', '2017-09-01', 105);


INSERT INTO Project VALUES
(201, 'HR Portal', 102, '2021-01-01', '2021-12-31'),
(202, 'ERP System', 101, '2020-06-01', '2022-06-30'),
(203, 'Finance Tracker', 103, '2022-01-01', '2022-12-31'),
(204, 'Marketing App', 104, '2023-01-01', '2023-12-31'),
(205, 'Ops Dashboard', 105, '2021-07-01', '2022-07-01');


INSERT INTO Performance VALUES
(1, 202, 4.5, '2022-06-30'),
(2, 201, 3.8, '2021-12-31'),
(3, 202, 4.9, '2022-06-30'),
(4, 203, 3.5, '2022-12-31'),
(5, 204, 4.2, '2023-12-31'),
(6, 205, 3.0, '2022-07-01');

INSERT INTO Reward VALUES
(1, '2024-01-01', 3000.00),
(2, '2024-02-01', 800.00),
(3, '2024-03-01', 2500.00),
(4, '2024-04-01', 1500.00),
(5, '2024-05-01', 500.00),
(6, '2024-06-01', 2000.00);


SELECT * FROM Department;
SELECT * FROM Employee;
SELECT * FROM Project;
SELECT * FROM Performance;
SELECT * FROM Reward;

-- 2. Update one employee’s department.

-- Moving Raj (EmpID=2) from HR to IT department
UPDATE Employee 
SET DeptID = 101 
WHERE EmpID = 2;
-- Verified 
SELECT EmpID, EmpName, DeptID 
FROM Employee 
WHERE EmpID = 2;


-- 3. Delete one reward record where the amount is less than 1000.

-- Deleted rewards where amount is less than 1000
DELETE FROM Reward 
WHERE RewardAmount < 1000;
-- Verified
SELECT * FROM Reward;

# User Story 3 — Generate Insights (DQL, Aggregate and Date Functions)

-- Tasks:

-- 1. Retrieve all employees who joined after 2019-01-01.

SELECT EmpID, EmpName, HireDate, DeptID 
FROM Employee 
WHERE HireDate > '2019-01-01';

-- 2. Find the average performance rating of employees in each department.

SELECT d.DeptName, 
       ROUND(AVG(p.Rating), 2) AS AvgRating
FROM Performance p
JOIN Employee e ON p.EmpID = e.EmpID
JOIN Department d ON e.DeptID = d.DeptID
GROUP BY d.DeptName;

-- 3. List employees with their age (use a date function).

SELECT EmpName, 
       DOB,
       TIMESTAMPDIFF(YEAR, DOB, CURDATE()) AS Age
FROM Employee;


-- 4. Find the total rewards given in the current year.

SELECT SUM(RewardAmount) AS TotalRewards
FROM Reward
WHERE YEAR(RewardMonth) = YEAR(CURDATE());

-- 5. Retrieve employees who have received rewards greater than 2000.

SELECT e.EmpName, 
       r.RewardAmount, 
       r.RewardMonth
FROM Reward r
JOIN Employee e ON r.EmpID = e.EmpID
WHERE r.RewardAmount > 2000;

# User Story 4 — Advanced Queries (Joins and Subqueries)

-- Tasks:

-- 1. Display Employee Name, Department Name, Project Name, and Rating using appropriate joins.

SELECT e.EmpName, 
       d.DeptName, 
       pr.ProjectName, 
       p.Rating
FROM Employee e
JOIN Department d ON e.DeptID = d.DeptID
JOIN Performance p ON e.EmpID = p.EmpID
JOIN Project pr ON p.ProjectID = pr.ProjectID;

-- 2. Find the highest-rated employee in each department using a subquery.

SELECT e.EmpName, 
       d.DeptName, 
       p.Rating
FROM Employee e
JOIN Department d ON e.DeptID = d.DeptID
JOIN Performance p ON e.EmpID = p.EmpID
WHERE p.Rating = (
    SELECT MAX(p2.Rating)
    FROM Performance p2
    JOIN Employee e2 ON p2.EmpID = e2.EmpID
    WHERE e2.DeptID = e.DeptID
);


-- 3. List all employees who have not received any rewards using a subquery.

SELECT EmpID, 
       EmpName
FROM Employee
WHERE EmpID NOT IN (
    SELECT EmpID 
    FROM Reward
);


# User Story 5 — Transaction Control and Optimization

-- Tasks:
 
-- 1. Begin a transaction:

-- Start Transaction
START TRANSACTION;

-- ○ Insert a new employee.
INSERT INTO Employee VALUES
(7, 'Vikram', 'M', '1994-05-10', '2023-03-15', 101);

-- ○ Assign them to a department.
INSERT INTO Performance VALUES
(7, 202, 4.1, '2024-01-01');

-- ○ Add their performance record.
INSERT INTO Reward VALUES
(7, '2024-01-01', 2200.00);

COMMIT;

-- Verified:
SELECT * FROM Employee WHERE EmpID = 7;
SELECT * FROM Performance WHERE EmpID = 7;
SELECT * FROM Reward WHERE EmpID = 7;


-- 2. Rollback the transaction if any insert fails; otherwise, commit it.

-- Start Transaction
START TRANSACTION;

-- Insert new Employee
INSERT INTO Employee VALUES
(8, 'Sneha', 'F', '1996-08-20', '2024-01-10', 102);

-- This will FAIL — Rating 6.0 violates CHECK constraint (max is 5.0)
INSERT INTO Performance VALUES
(8, 201, 6.0, '2024-01-01');

-- Since above failed, UNDO everything
ROLLBACK;

-- Verified
SELECT * FROM Employee WHERE EmpID = 8;

-- 3. Analyze a slow query (for example, joining 3–4 tables without an index). Then, re-run it using indexes and observe improvement using the EXPLAIN command.

-- BEFORE Index (Full table scan)
EXPLAIN SELECT * FROM Employee 
WHERE EmpName = 'Asha';

-- AFTER Index (already created in Step 3)
EXPLAIN SELECT * FROM Employee 
WHERE EmpName = 'Asha';

-- For ScreenShots

-- EXPLAIN before and after applying indexes.

-- Drop the index temporarily
DROP INDEX idx_empname ON Employee;

-- EXPLAIN without index
EXPLAIN SELECT e.EmpName, d.DeptName, pr.ProjectName, p.Rating
FROM Employee e
JOIN Department d ON e.DeptID = d.DeptID
JOIN Performance p ON e.EmpID = p.EmpID
JOIN Project pr ON p.ProjectID = pr.ProjectID
WHERE e.EmpName = 'Asha';

-- Recreated the index
CREATE INDEX idx_empname ON Employee(EmpName);

-- Now EXPLAIN with index
EXPLAIN SELECT e.EmpName, d.DeptName, pr.ProjectName, p.Rating
FROM Employee e
JOIN Department d ON e.DeptID = d.DeptID
JOIN Performance p ON e.EmpID = p.EmpID
JOIN Project pr ON p.ProjectID = pr.ProjectID
WHERE e.EmpName = 'Asha';


-- Queries with aggregate functions.

SELECT e.EmpName, 
       d.DeptName, 
       pr.ProjectName, 
       p.Rating
FROM Employee e
JOIN Department d ON e.DeptID = d.DeptID
JOIN Performance p ON e.EmpID = p.EmpID
JOIN Project pr ON p.ProjectID = pr.ProjectID;


