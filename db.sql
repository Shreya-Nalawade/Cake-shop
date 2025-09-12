CREATE DATABASE IF NOT EXISTS cake_shop;

USE cake_shop;

CREATE TABLE IF NOT EXISTS cakes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  inStock BOOLEAN NOT NULL,
  image VARCHAR(255) NOT NULL
);

-- Insert sample cakes
INSERT INTO cakes (name, price, quantity, inStock, image) VALUES
('Chocolate Delight', 250.00, 5, true, '/uploads/chocolate.jpeg'),
('Strawberry Dream', 300.00, 0, false, '/uploads/strawberry.jpeg');
