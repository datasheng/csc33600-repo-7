[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/lbrlp8ht)


BestElectronics4U

A mock website where users can find the best deals on a wide range of electronics and find out where to buy them !

![image](https://github.com/user-attachments/assets/ac7ec5ae-3bea-4134-a8fd-69d771dc06b3)


![image](https://github.com/user-attachments/assets/6224ffd1-e2ca-4229-9e10-232a5c5b15d2)


![image](https://github.com/user-attachments/assets/e488cabc-f737-4b5b-9729-0aef54efff96)

How To Run:
Here are some instructions to run the backend/Front End:

1. First ensure you have MySQL workbench installed and you have filled our the .env file with your respective information.

2. Enter this code to initialize MySQL DB:

                DROP DATABASE IF EXISTS electronics4U;
                CREATE DATABASE electronics4U;
                USE electronics4U;
                
                
                CREATE TABLE user (
                  user_id VARCHAR(255) PRIMARY KEY,
                  user_name VARCHAR(100) NOT NULL,
                  first_name VARCHAR(100),
                  last_name VARCHAR(100),
                  address TEXT,
                  email VARCHAR(100) UNIQUE NOT NULL,
                  user_password VARCHAR(255) NOT NULL,
                  is_vendor BOOLEAN DEFAULT FALSE
                );
                
                
                
                CREATE TABLE shop (
                  shop_id VARCHAR(255) PRIMARY KEY,  -- Matches user.user_id for vendors
                  shop_name VARCHAR(100) NOT NULL,
                  shop_address TEXT,
                  CONSTRAINT fk_shop_user FOREIGN KEY (shop_id) REFERENCES user(user_id) ON DELETE CASCADE
                );
                
                
                
                CREATE TABLE category (
                  category_id INT PRIMARY KEY AUTO_INCREMENT,
                  category_name VARCHAR(100) NOT NULL,
                  parent_id INT DEFAULT NULL,
                  FOREIGN KEY (parent_id) REFERENCES category(category_id) ON DELETE CASCADE
                );
                
                
                
                CREATE TABLE product (
                  product_id VARCHAR(50) PRIMARY KEY,
                  product_name TEXT NOT NULL,
                  discounted_price FLOAT,
                  actual_price FLOAT,
                  discount_percentage FLOAT DEFAULT 0,
                  rating FLOAT DEFAULT 0,
                  rating_count INT DEFAULT 0,
                  about_product TEXT,
                  external_url TEXT,
                  image_url TEXT,
                  shop_id VARCHAR(255),  -- ✅ Corrected to match shop.shop_id
                  category_id INT,
                  FOREIGN KEY (shop_id) REFERENCES shop(shop_id) ON DELETE SET NULL,
                  FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE SET NULL
                );
                
                
                
                CREATE TABLE saved_items (
                  user_id VARCHAR(255),
                  product_id VARCHAR(50),
                  PRIMARY KEY (user_id, product_id),
                  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
                  FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
                );
                
                
                
                CREATE TABLE review (
                  review_id VARCHAR(50) PRIMARY KEY,
                  user_id VARCHAR(50),
                  product_id VARCHAR(50),
                  review_title TEXT,
                  review_content TEXT,
                  review_date DATE,
                  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
                  FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
                );
                
                
                CREATE TABLE external_review (
                  external_review_id VARCHAR(50) PRIMARY KEY,
                  product_id VARCHAR(50),
                  external_review_title TEXT,
                  external_review_content TEXT,
                  review_user_name VARCHAR(100),
                  FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
                );
                
                
                CREATE TABLE subscription (
                  subscription_id VARCHAR(50) PRIMARY KEY,
                  user_id VARCHAR(50),
                  type_of_subscription TEXT,
                  features TEXT,
                  monthly_price FLOAT,
                  start_date DATE,
                  end_date DATE,
                  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
                );


Then Run procedures SQL code to create/generate user dummy data ( you can use this to test the app's features):

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
                
                


IF you decide to make an account manually, make sure you think Vendor as : Yes, so that you have access to the Shop section :), or else it will block you.


3. Open CMD or Mac Equivalent and change your directory to example: csc360_project/project/backend

4. Run the following command(this will inject the dummy data into MySQL and you only need to run this once!):
node seed.js  



5.  To run the backend user command(note this must be on, for front-end to work properly):
node server.js
