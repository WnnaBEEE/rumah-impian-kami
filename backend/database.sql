-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 30, 2025 at 05:48 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rumah_impian_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `increment_property_views` (IN `prop_id` INT)   BEGIN
    UPDATE properties SET views = views + 1 WHERE id = prop_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied') DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `name`, `email`, `phone`, `message`, `status`, `created_at`) VALUES
(1, 'Budi Santoso', 'budi@email.com', '081234567890', 'Saya tertarik dengan rumah di Jatijajar, apakah masih tersedia?', 'new', '2025-11-18 00:19:48'),
(2, 'Siti Nurhaliza', 'siti@email.com', '082345678901', 'Bisa dibantu untuk survey rumah di Beji?', 'new', '2025-11-18 00:19:48');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `properties`
--

CREATE TABLE `properties` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `address` text NOT NULL,
  `type` varchar(50) NOT NULL COMMENT 'Contoh: Rumah, Apartemen, Villa, Ruko',
  `status` enum('Jual','Sewa') NOT NULL,
  `bedrooms` int(11) NOT NULL,
  `bathrooms` int(11) NOT NULL,
  `area` int(11) NOT NULL COMMENT 'Luas dalam meter persegi',
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `views` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `properties`
--

INSERT INTO `properties` (`id`, `user_id`, `title`, `price`, `address`, `type`, `status`, `bedrooms`, `bathrooms`, `area`, `image`, `description`, `is_featured`, `views`, `created_at`, `updated_at`) VALUES
(1, 10, 'rumah anya', 9000000000.00, 'Perumahan Bunga Indah Blok C7 No. 12, Desa Sinar Baru, Kecamatan Mandala, Kabupaten Fiktif, Jawa Tengah 54321\r\n', 'Rumah', 'Jual', 1, 2, 200, '/uploads/properties/1764477857743-anmyaaa.png', 'rumah anya iraharsimase', 0, 0, '2025-11-30 04:44:17', '2025-11-30 04:44:17');

-- --------------------------------------------------------

--
-- Table structure for table `property_images`
--

CREATE TABLE `property_images` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('user','agen','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `full_name`, `phone`, `role`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@rumahimpian.com', '$2a$10$XqWYJvXvVqGvXq6Xz5YZKeLJZFgE7VK3kLUJvQk3mJ8YNz9X5Y8Ky', 'Administrator', '081234567890', 'admin', '2025-11-18 00:19:48', '2025-11-18 00:19:48'),
(2, 'yanto', 'apis@gmail.com', '$2a$10$Biz8bVV6Olr5QV60GdKdd.qo7Gddo6/3bG3Ho0ZPaKS4NLda5joja', 'apis', '08123456789', 'user', '2025-11-18 00:35:35', '2025-11-18 00:35:35'),
(3, 'agen_budi', 'agen@rumahimpian.com', '$2a$10$XqWYJvXvVqGvXq6Xz5YZKeLJZFgE7VK3kLUJvQk3mJ8YNz9X5Y8Ky', 'Budi Santoso (Agen)', '081234567890', 'agen', '2025-11-23 12:51:54', '2025-11-23 12:51:54'),
(4, 'agen_siti', 'siti.agen@rumahimpian.com', '$2a$10$XqWYJvXvVqGvXq6Xz5YZKeLJZFgE7VK3kLUJvQk3mJ8YNz9X5Y8Ky', 'Siti Nurhaliza (Agen)', '082345678901', 'agen', '2025-11-23 12:51:54', '2025-11-23 12:51:54'),
(7, 'userbiasa', 'user@email.com', '$2a$10$GquzCak2p83N3PHB0gSQFeDtQIExdUsHmzBAvtQ9pYSYNvo9qblvu', 'user', '08987654321', 'user', '2025-11-23 13:09:18', '2025-11-23 13:09:18'),
(8, 'agen', 'agen@email.com', '$2a$10$AOs3HZrb2ek1NiL3jlF7MubU9fRvBVuSgTGROEJVQaqWULzrM3Oc6', 'agen', '08987654321', 'agen', '2025-11-23 13:10:15', '2025-11-30 04:41:46'),
(10, 'apisagen', 'test1@gmail.com', '$2a$10$.xT/Emr5uVN0TUWfH/DtBuaY.A4eyo2zT2jh7tNNz7tWwTLOr9jfi', 'apis mabar', '08987654321', 'agen', '2025-11-30 04:42:39', '2025-11-30 04:42:39');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_properties_with_user`
-- (See below for the actual view)
--
CREATE TABLE `v_properties_with_user` (
`id` int(11)
,`user_id` int(11)
,`title` varchar(200)
,`price` decimal(15,2)
,`address` text
,`type` varchar(50)
,`status` enum('Jual','Sewa')
,`bedrooms` int(11)
,`bathrooms` int(11)
,`area` int(11)
,`image` varchar(255)
,`description` text
,`is_featured` tinyint(1)
,`views` int(11)
,`created_at` timestamp
,`updated_at` timestamp
,`owner_username` varchar(50)
,`owner_email` varchar(100)
,`owner_phone` varchar(20)
,`owner_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Structure for view `v_properties_with_user`
--
DROP TABLE IF EXISTS `v_properties_with_user`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_properties_with_user`  AS SELECT `p`.`id` AS `id`, `p`.`user_id` AS `user_id`, `p`.`title` AS `title`, `p`.`price` AS `price`, `p`.`address` AS `address`, `p`.`type` AS `type`, `p`.`status` AS `status`, `p`.`bedrooms` AS `bedrooms`, `p`.`bathrooms` AS `bathrooms`, `p`.`area` AS `area`, `p`.`image` AS `image`, `p`.`description` AS `description`, `p`.`is_featured` AS `is_featured`, `p`.`views` AS `views`, `p`.`created_at` AS `created_at`, `p`.`updated_at` AS `updated_at`, `u`.`username` AS `owner_username`, `u`.`email` AS `owner_email`, `u`.`phone` AS `owner_phone`, `u`.`full_name` AS `owner_name` FROM (`properties` `p` left join `users` `u` on(`p`.`user_id` = `u`.`id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_favorite` (`user_id`,`property_id`),
  ADD KEY `property_id` (`property_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `properties`
--
ALTER TABLE `properties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_price` (`price`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `property_images`
--
ALTER TABLE `property_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_property_id` (`property_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `properties`
--
ALTER TABLE `properties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `property_images`
--
ALTER TABLE `property_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `properties`
--
ALTER TABLE `properties`
  ADD CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `property_images`
--
ALTER TABLE `property_images`
  ADD CONSTRAINT `property_images_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
