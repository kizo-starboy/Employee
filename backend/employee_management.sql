-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 29, 2025 at 12:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `employee_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_code` varchar(10) NOT NULL,
  `department_name` varchar(100) NOT NULL,
  `gross_salary` decimal(10,2) NOT NULL,
  `total_deduction` decimal(10,2) NOT NULL DEFAULT 0.00,
  `net_salary` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_code`, `department_name`, `gross_salary`, `total_deduction`, `net_salary`, `created_at`, `updated_at`) VALUES
('ENG', 'Engineering', 75000.00, 15000.00, 60000.00, '2025-05-29 10:10:09', '2025-05-29 10:10:09'),
('FIN', 'Finance', 70000.00, 14000.00, 56000.00, '2025-05-29 10:10:09', '2025-05-29 10:10:09'),
('HR', 'Human Resources', 65000.00, 13000.00, 52000.00, '2025-05-29 10:10:09', '2025-05-29 10:10:09'),
('MKT', 'Marketing', 60000.00, 12000.00, 48000.00, '2025-05-29 10:10:09', '2025-05-29 10:10:09');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_number` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `position` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `hired_date` date NOT NULL,
  `department_code` varchar(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_number`, `first_name`, `last_name`, `position`, `address`, `telephone`, `gender`, `hired_date`, `department_code`, `created_at`, `updated_at`) VALUES
('EMP001', 'John', 'Doe', 'Software Engineer', '123 Main St', '555-0101', 'Male', '2023-01-15', 'ENG', '2025-05-29 10:10:09', '2025-05-29 10:10:09'),
('EMP002', 'Jane', 'Smith', 'HR Manager', '456 Oak Ave', '555-0102', 'Female', '2023-02-01', 'HR', '2025-05-29 10:10:09', '2025-05-29 10:10:09'),
('EMP003', 'Mike', 'Johnson', 'Financial Analyst', '789 Pine Rd', '555-0103', 'Male', '2023-03-10', 'FIN', '2025-05-29 10:10:09', '2025-05-29 10:10:09'),
('EMP004', 'Sarah', 'Williams', 'Marketing Specialist', '321 Elm St', '555-0104', 'Female', '2023-04-05', 'MKT', '2025-05-29 10:10:09', '2025-05-29 10:10:09'),
('EMP005', 'David', 'Brown', 'Senior Developer', '654 Maple Dr', '555-0105', 'Male', '2023-01-20', 'ENG', '2025-05-29 10:10:09', '2025-05-29 10:10:09'),
('EMP006', 'Lisa', 'Davis', 'Accountant', '987 Cedar Ln', '555-0106', 'Female', '2023-05-15', 'FIN', '2025-05-29 10:10:09', '2025-05-29 10:10:09');

-- --------------------------------------------------------

--
-- Table structure for table `salaries`
--

CREATE TABLE `salaries` (
  `id` int(11) NOT NULL,
  `employee_number` varchar(20) NOT NULL,
  `gross_salary` decimal(10,2) NOT NULL,
  `total_deduction` decimal(10,2) NOT NULL,
  `net_salary` decimal(10,2) NOT NULL,
  `month` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salaries`
--

INSERT INTO `salaries` (`id`, `employee_number`, `gross_salary`, `total_deduction`, `net_salary`, `month`, `created_at`, `updated_at`) VALUES
(1, 'EMP001', 75000.00, 15000.00, 60000.00, '2023-01-01', '2025-05-29 10:10:09', '2025-05-29 10:10:09'),
(2, 'EMP002', 65000.00, 13000.00, 52000.00, '2023-01-01', '2025-05-29 10:10:09', '2025-05-29 10:10:09'),
(3, 'EMP003', 70000.00, 14000.00, 56000.00, '2023-01-01', '2025-05-29 10:10:09', '2025-05-29 10:10:09'),
(4, 'EMP001', 75000.00, 15000.00, 60000.00, '2023-02-01', '2025-05-29 10:10:09', '2025-05-29 10:10:09'),
(5, 'EMP002', 65000.00, 13000.00, 52000.00, '2023-02-01', '2025-05-29 10:10:09', '2025-05-29 10:10:09'),
(6, 'EMP003', 70000.00, 14000.00, 56000.00, '2023-02-01', '2025-05-29 10:10:09', '2025-05-29 10:10:09');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `first_name`, `last_name`, `email`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2b$10$mLEI4smzk0YQPfNx7KA5UOlHu.77V0VG/W9RqQmPBJA0KQNu4W5Hy', 'Admin', 'User', 'admin@example.com', '2025-05-29 10:10:09', '2025-05-29 10:10:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_code`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_number`),
  ADD KEY `department_code` (`department_code`);

--
-- Indexes for table `salaries`
--
ALTER TABLE `salaries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_employee_month` (`employee_number`,`month`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `salaries`
--
ALTER TABLE `salaries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`department_code`) REFERENCES `departments` (`department_code`);

--
-- Constraints for table `salaries`
--
ALTER TABLE `salaries`
  ADD CONSTRAINT `salaries_ibfk_1` FOREIGN KEY (`employee_number`) REFERENCES `employees` (`employee_number`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
