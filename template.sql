-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Cze 17, 2026 at 06:37 PM
-- Wersja serwera: 10.4.32-MariaDB
-- Wersja PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gzmtec`
--
CREATE DATABASE IF NOT EXISTS `gzmtec` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `gzmtec`;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `deviations`
--

CREATE TABLE `deviations` (
  `id` int(45) NOT NULL,
  `trip` varchar(20) NOT NULL,
  `lineLabel` varchar(20) NOT NULL,
  `stop_id` int(20) NOT NULL,
  `vehicle_id` int(25) NOT NULL,
  `deviation` int(4) NOT NULL,
  `arrival_time` datetime NOT NULL,
  `weekday` varchar(20) NOT NULL,
  `timestamp` int(10) NOT NULL,
  `departure_seconds` int(11) GENERATED ALWAYS AS (time_to_sec(cast(`arrival_time` as time))) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `favorite_routes`
--

CREATE TABLE `favorite_routes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `route_name` varchar(100) NOT NULL,
  `from_stop_name` varchar(100) NOT NULL,
  `from_lat` decimal(10,8) NOT NULL,
  `from_lon` decimal(11,8) NOT NULL,
  `to_stop_name` varchar(100) NOT NULL,
  `to_lat` decimal(10,8) NOT NULL,
  `to_lon` decimal(11,8) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(128) NOT NULL,
  `email` varchar(127) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `deviations`
--
ALTER TABLE `deviations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_deviation_lookup_v2` (`lineLabel`,`stop_id`,`weekday`,`departure_seconds`);

--
-- Indeksy dla tabeli `favorite_routes`
--
ALTER TABLE `favorite_routes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `deviations`
--
ALTER TABLE `deviations`
  MODIFY `id` int(45) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favorite_routes`
--
ALTER TABLE `favorite_routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `favorite_routes`
--
ALTER TABLE `favorite_routes`
  ADD CONSTRAINT `favorite_routes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
