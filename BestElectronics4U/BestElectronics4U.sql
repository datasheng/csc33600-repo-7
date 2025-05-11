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
  is_vendor BOOLEAN DEFAULT FALSE,
  paid_user BOOLEAN DEFAULT FALSE -- ✅ New column
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



