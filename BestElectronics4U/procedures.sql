-- Step 1: Make sure you're using the correct database
CREATE DATABASE IF NOT EXISTS electronics4U;
USE electronics4U;

-- Step 2: Create the user table (if not exists)
CREATE TABLE IF NOT EXISTS user (
  user_id VARCHAR(255) PRIMARY KEY,
  user_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  address TEXT,
  email VARCHAR(100) UNIQUE NOT NULL,
  user_password VARCHAR(255) NOT NULL,
  is_vendor BOOLEAN DEFAULT FALSE,
  paid_user BOOLEAN DEFAULT FALSE
);

-- Step 3: Create the stored procedure to insert dummy users
DELIMITER //

CREATE PROCEDURE InsertDummyUsers()
BEGIN
  INSERT INTO user (
    user_id, user_name, first_name, last_name, address,
    email, user_password, is_vendor, paid_user
  ) VALUES 
  -- Paid/Vendor User Alice
    ('u001', 'vendor1', 'Alice', 'Smith', '123 Tech Ave', 'alice@example.com', '1234', TRUE, TRUE),
    
  -- Vendor   
    ('u002', 'vendor2', 'Bob', 'Johnson', '456 Market St', 'bob@example.com', '1234', TRUE, FALSE),

   -- Paid User 
    ('u003', 'customer1', 'Charlie', 'Lee', '789 Oak Rd', 'charlie@example.com', '1234', FALSE, TRUE),
  -- Non Paid User Dana
    ('u004', 'customer2', 'Dana', 'Kim', '321 Maple Dr', 'dana@example.com', '1234', FALSE, FALSE);
END //

DELIMITER ;

-- Step 4: Call the procedure to populate dummy data
CALL InsertDummyUsers();
