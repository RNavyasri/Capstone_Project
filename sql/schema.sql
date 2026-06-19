CREATE DATABASE IF NOT EXISTS money_transfer_system;
USE money_transfer_system;

CREATE TABLE IF NOT EXISTS accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_holder_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status ENUM('ACTIVE', 'CLOSED', 'LOCKED') NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS transaction_logs (
    transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_account BIGINT NOT NULL,
    to_account BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    rewards_earned INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rewards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    reward_points INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO accounts (account_holder_name, username, password, status, balance)
VALUES
('Navya', 'navya', 'Navyasri@2004', 'ACTIVE', 8000.00),
('Shreya', 'shreya', 'Shreya@2005', 'ACTIVE', 5500.00),
('Rahul', 'rahul', 'Rahul@2006', 'LOCKED', 3000.00),
('Rinku', 'rinku', 'Rinku@2007', 'CLOSED', 90.00);

INSERT INTO rewards (username, reward_points) VALUES
('navya', 0),
('shreya', 0),
('rahul', 0),
('rinku', 0);
