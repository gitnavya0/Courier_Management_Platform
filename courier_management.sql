SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `courier_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE manager_login_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);
INSERT INTO manager_login_details VALUES(1,"Manager1", "M1PASS");

CREATE TABLE `branch` (
  `branch_id` int(11) NOT NULL,
  `branch_addr` varchar(50) DEFAULT NULL,
  `branch_city` varchar(30) DEFAULT NULL,
  `branch_phone` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `parcels`
--

CREATE TABLE `parcels` (
  `parcel_id` int(11) NOT NULL,
  `cost` int(11) DEFAULT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `recv_name` varchar(20) DEFAULT NULL,
  `recv_addr` varchar(50) DEFAULT NULL,
  `date_accepted` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `emp_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `parcels_details`
--

CREATE TABLE `parcels_details` (
  `parcel_id` int(11) NOT NULL,
  `cost` int(11) DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `length` float DEFAULT NULL,
  `width` float DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `height` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `receiver`
--

CREATE TABLE `receiver` (
  `recv_name` varchar(20) NOT NULL,
  `recv_addr` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sender`
--

CREATE TABLE `sender` (
  `sender_id` int(11) NOT NULL,
  `sender_name` varchar(20) DEFAULT NULL,
  `sender_addr` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sends`
--

CREATE TABLE `sends` (
  `sender_id` int(11) NOT NULL,
  `recv_addr` varchar(50) NOT NULL,
  `recv_name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `emp_id` int(11) NOT NULL,
  `emp_name` varchar(20) DEFAULT NULL,
  `emp_phone` int(10) DEFAULT NULL,
  `emp_branch_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `branch`
--
ALTER TABLE `branch`
  ADD PRIMARY KEY (`branch_id`);

--
-- Indexes for table `parcels`
--
ALTER TABLE `parcels`
  ADD PRIMARY KEY (`parcel_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `recv_name` (`recv_name`),
  ADD KEY `emp_id` (`emp_id`);

--
-- Indexes for table `parcels_details`
--
ALTER TABLE `parcels_details`
  ADD PRIMARY KEY (`parcel_id`);

--
-- Indexes for table `receiver`
--
ALTER TABLE `receiver`
  ADD PRIMARY KEY (`recv_name`,`recv_addr`);

ALTER TABLE `receiver`
  ADD INDEX idx_recv_addr (recv_addr);
  
ALTER TABLE `parcels_details`
  ADD INDEX idx_cost (cost);
  
--
-- Indexes for table `sender`
--
ALTER TABLE `sender`
  ADD PRIMARY KEY (`sender_id`);

--
-- Indexes for table `sends`
--
ALTER TABLE `sends`
  ADD PRIMARY KEY (`sender_id`,`recv_addr`,`recv_name`),
  ADD KEY `recv_addr` (`recv_addr`),
  ADD KEY `sends_recv_name` (`recv_name`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`emp_id`),
  ADD KEY `emp_branch_id` (`emp_branch_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `parcels`
--
ALTER TABLE `parcels`
  ADD CONSTRAINT `parcels_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `sender` (`sender_id`),
  ADD CONSTRAINT `parcels_ibfk_2` FOREIGN KEY (`recv_name`) REFERENCES `receiver` (`recv_name`),
  ADD CONSTRAINT `parcels_ibfk_3` FOREIGN KEY (`emp_id`) REFERENCES `staff` (`emp_id`),
  ADD CONSTRAINT `parcels_ibfk_4` FOREIGN KEY (`recv_addr`) REFERENCES `receiver` (`recv_addr`),
  ADD CONSTRAINT `parcels_ibfk_5` FOREIGN KEY (`cost`) REFERENCES `parcels_details` (`cost`);
  
--
-- Constraints for table `parcels_details`
--
ALTER TABLE `parcels_details`
  ADD CONSTRAINT `parcels_details_ibfk_1` FOREIGN KEY (`parcel_id`) REFERENCES `parcels` (`parcel_id`);

--
-- Constraints for table `sends`
--
ALTER TABLE `sends`
  ADD CONSTRAINT `sends_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `sender` (`sender_id`),
  ADD CONSTRAINT `sends_recv_name` FOREIGN KEY (`recv_name`) REFERENCES `receiver` (`recv_name`),
  ADD CONSTRAINT `sends_ibfk_2` FOREIGN KEY (`recv_addr`) REFERENCES `receiver` (`recv_addr`);
--
-- Constraints for table `staff`
--
ALTER TABLE `staff`
  ADD CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`emp_branch_id`) REFERENCES `branch` (`branch_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
