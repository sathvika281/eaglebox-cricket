-- Eagle Box Cricket Slot Booking System
-- Database Schema — 12 Tables

CREATE DATABASE IF NOT EXISTS eaglecricket;
USE eaglecricket;

-- 1. Users (customers)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL UNIQUE,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admins
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Slots
CREATE TABLE slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price DECIMAL(10,2) DEFAULT 500.00,
  status ENUM('available', 'booked', 'blocked') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bookings
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id VARCHAR(20) NOT NULL UNIQUE,
  customer_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(100),
  slot_id INT NOT NULL,
  num_players INT DEFAULT 1,
  booking_type ENUM('regular', 'corporate', 'tournament') DEFAULT 'regular',
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (slot_id) REFERENCES slots(id)
);

-- 5. Payments
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('cash', 'upi', 'card', 'online') DEFAULT 'cash',
  status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  paid_at TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- 6. Tournaments
CREATE TABLE tournaments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  max_teams INT DEFAULT 8,
  status ENUM('upcoming', 'ongoing', 'completed') DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tournament Registrations
CREATE TABLE tournament_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id INT NOT NULL,
  team_name VARCHAR(100) NOT NULL,
  captain_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  num_players INT DEFAULT 6,
  status ENUM('registered', 'confirmed', 'eliminated') DEFAULT 'registered',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

-- 8. Memberships
CREATE TABLE memberships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_name VARCHAR(100) NOT NULL,
  duration_days INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  benefits TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Membership Subscriptions
CREATE TABLE membership_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  membership_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (membership_id) REFERENCES memberships(id)
);

-- 10. Players
CREATE TABLE players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  position VARCHAR(50),
  batting_style VARCHAR(50),
  bowling_style VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Occupancy
CREATE TABLE occupancy (
  id INT AUTO_INCREMENT PRIMARY KEY,
  record_date DATE NOT NULL,
  total_slots INT DEFAULT 0,
  booked_slots INT DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Feedback
CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  customer_name VARCHAR(100),
  phone VARCHAR(15),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
