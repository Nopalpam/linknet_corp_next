-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Feb 02, 2026 at 06:43 AM
-- Server version: 8.2.0
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `linknetcorpdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
CREATE TABLE IF NOT EXISTS `menus` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `section_title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_order` int NOT NULL DEFAULT '0',
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `badge` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` enum('header','footer','both') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'header',
  `type` enum('link','dropdown','mega') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'link',
  `order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `open_new_tab` tinyint(1) NOT NULL DEFAULT '0',
  `css_class` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menus_parent_id_foreign` (`parent_id`),
  KEY `menus_position_order_is_active_index` (`position`,`order`,`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `parent_id`, `section_title`, `section_order`, `title`, `translations`, `slug`, `url`, `icon`, `image`, `description`, `badge`, `position`, `type`, `order`, `is_active`, `open_new_tab`, `css_class`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, 0, 'Home', NULL, NULL, '/', NULL, NULL, NULL, NULL, 'header', 'link', 1, 1, 0, NULL, 'system', NULL, '2025-10-21 08:47:16', '2025-10-21 08:47:16'),
(2, NULL, NULL, 0, 'About', '{\"id\":{\"title\":\"Tentang\",\"slug\":null,\"description\":null},\"en\":{\"title\":\"About\",\"slug\":null,\"description\":null}}', NULL, '#', NULL, NULL, NULL, NULL, 'header', 'mega', 2, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-22 21:48:01'),
(3, 2, NULL, 0, 'Corporate Information', '{\"id\":{\"title\":\"Informasi Perseroan\",\"slug\":null,\"description\":null},\"en\":{\"title\":\"Corporate Information\",\"slug\":null,\"description\":null}}', NULL, '/about/corporate-information', NULL, NULL, NULL, NULL, 'header', 'link', 1, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:00:28'),
(4, 2, NULL, 0, 'Corporate Overview', '{\"id\":{\"title\":\"Ikhtisar Perusahaan\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/about/corporate-overview', NULL, NULL, NULL, NULL, 'header', 'link', 2, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:00:49'),
(5, 2, NULL, 0, 'Milestone', NULL, NULL, '/about/milestone', NULL, NULL, NULL, NULL, 'header', 'link', 3, 1, 0, NULL, 'system', NULL, '2025-10-21 08:47:16', '2025-10-21 08:47:16'),
(6, 2, NULL, 0, 'Group Structures', '{\"id\":{\"title\":\"Struktur Grup\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/about/group-structures', NULL, NULL, NULL, NULL, 'header', 'link', 4, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:01:18'),
(7, 2, NULL, 0, 'Management', '{\"id\":{\"title\":\"Manajemen\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/about/management', NULL, NULL, NULL, NULL, 'header', 'link', 5, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:01:31'),
(8, 2, NULL, 0, 'Awards', '{\"id\":{\"title\":\"Penghargaan\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/about/awards', NULL, NULL, NULL, NULL, 'header', 'link', 6, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:01:42'),
(9, NULL, NULL, 0, 'Business', '{\"id\":{\"title\":\"Bisnis\",\"slug\":null,\"description\":null},\"en\":{\"title\":\"Business\",\"slug\":null,\"description\":null}}', NULL, '#', NULL, NULL, NULL, NULL, 'header', 'mega', 3, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 06:57:51'),
(10, 9, NULL, 0, 'Linknet Enterprise', '{\"id\":{\"title\":null,\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/business/linknet-enterprise', NULL, NULL, NULL, NULL, 'header', 'link', 1, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-10-26 21:55:58'),
(11, 9, NULL, 0, 'Linknet Fiber', NULL, NULL, '/business/linknet-fiber', NULL, NULL, NULL, NULL, 'header', 'link', 2, 1, 0, NULL, 'system', NULL, '2025-10-21 08:47:16', '2025-10-21 08:47:16'),
(12, 9, NULL, 0, 'Linknet Media', NULL, NULL, '/business/linknet-media', NULL, NULL, NULL, NULL, 'header', 'link', 3, 1, 0, NULL, 'system', NULL, '2025-10-21 08:47:16', '2025-10-21 08:47:16'),
(13, NULL, NULL, 0, 'Corporate Governance', '{\"id\":{\"title\":\"Tata Kelola\",\"slug\":null,\"description\":null},\"en\":{\"title\":\"Corporate Governance\",\"slug\":null,\"description\":null}}', NULL, '#', NULL, NULL, NULL, NULL, 'header', 'mega', 4, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 06:58:21'),
(14, 13, NULL, 0, 'Structure', '{\"id\":{\"title\":\"Struktur Tata Kelola Perusahaan\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/corporate-governance/structure', NULL, NULL, NULL, NULL, 'header', 'link', 1, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:03:48'),
(15, 13, NULL, 0, 'Principle', '{\"id\":{\"title\":\"Prinsip Tata Kelola Perusahaan\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/corporate-governance/principle', NULL, NULL, NULL, NULL, 'header', 'link', 2, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:04:11'),
(16, 13, NULL, 0, 'Guidance', '{\"id\":{\"title\":\"Panduan Tata Kelola Perusahaan\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/corporate-governance/guidance', NULL, NULL, NULL, NULL, 'header', 'link', 3, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:04:28'),
(17, 13, NULL, 0, 'Article of Association', '{\"id\":{\"title\":\"Anggaran Dasar\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/corporate-governance/association', NULL, NULL, NULL, NULL, 'header', 'link', 4, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:05:30'),
(18, 13, NULL, 0, 'Code of Conduct', '{\"id\":{\"title\":\"Kode Etik\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/corporate-governance/code-of-conduct', NULL, NULL, NULL, NULL, 'header', 'link', 5, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:05:50'),
(19, 13, NULL, 0, 'Certified for Standarization of Management System', '{\"id\":{\"title\":\"Sertifikasi Standarisasi Sistem Manajemen\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/corporate-governance/summary-of-standardization', NULL, NULL, NULL, NULL, 'header', 'link', 6, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:06:09'),
(20, 13, NULL, 0, 'Organization Structures', '{\"id\":{\"title\":\"Struktur Organisasi\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/corporate-governance/organization-structure', NULL, NULL, NULL, NULL, 'header', 'link', 7, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:06:21'),
(21, 13, NULL, 0, 'Linknet Policy', '{\"id\":{\"title\":\"Kebijakan Linknet\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/corporate-governance/linknet-policy', NULL, NULL, NULL, NULL, 'header', 'link', 8, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:06:36'),
(22, 13, NULL, 0, 'Board & Committee Charters', '{\"id\":{\"title\":\"Piagam Dewan & Komite\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/corporate-governance/board-committee-charters', NULL, NULL, NULL, NULL, 'header', 'link', 9, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:06:56'),
(23, 13, NULL, 0, 'Whistleblowing System', '{\"id\":{\"title\":\"Sistem Whistleblowing\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/corporate-governance/whistleblowing-system', NULL, NULL, NULL, NULL, 'header', 'link', 10, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:07:14'),
(24, 13, NULL, 0, 'Whistleblowing Policy', '{\"id\":{\"title\":\"Kebijakan Whistleblowing\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/corporate-governance/whistleblowing-policy', NULL, NULL, NULL, NULL, 'header', 'link', 11, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:07:31'),
(25, 13, NULL, 0, 'Data Privacy Policy', '{\"id\":{\"title\":\"Kebijakan Privasi Data\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/corporate-governance/data-privacy-policy', NULL, NULL, NULL, NULL, 'header', 'link', 12, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:07:50'),
(26, NULL, NULL, 0, 'Investor', NULL, NULL, '#', NULL, NULL, NULL, NULL, 'header', 'mega', 5, 1, 0, NULL, 'system', NULL, '2025-10-21 08:47:16', '2025-10-21 08:47:16'),
(27, 26, NULL, 1, 'GMS Announcement', '{\"id\":{\"title\":\"Pengumuman RUPS\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/investor/gms-announcement', NULL, NULL, NULL, NULL, 'header', 'link', 1, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:08:32'),
(28, 26, NULL, 1, 'Emiten Announcement', '{\"id\":{\"title\":\"Pengumuman Emiten\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/investor/emiten-announcement', NULL, NULL, NULL, NULL, 'header', 'link', 2, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:09:13'),
(29, 26, NULL, 1, 'Public Expose Announcement', '{\"id\":{\"title\":\"Pengumuman Paparan Publik\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/investor/public-expose-announcement', NULL, NULL, NULL, NULL, 'header', 'link', 3, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:09:26'),
(30, 26, NULL, 1, 'Financial Statement', '{\"id\":{\"title\":\"Laporan Keuangan\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/investor/financial-statement', NULL, NULL, NULL, NULL, 'header', 'link', 4, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:10:07'),
(31, 26, NULL, 1, 'Annual Report', '{\"id\":{\"title\":\"Laporan Tahunan\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/investor/annual-report', NULL, NULL, NULL, NULL, 'header', 'link', 5, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:10:17'),
(32, 26, NULL, 1, 'Sustainable Report', '{\"id\":{\"title\":\"Laporan Berkelanjutan\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/investor/sustainable-report', NULL, NULL, NULL, NULL, 'header', 'link', 6, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:10:32'),
(33, 26, 'Investor', 2, 'Stock Price', '{\"id\":{\"title\":\"Harga Saham\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/investor-relations', NULL, NULL, NULL, NULL, 'header', 'link', 1, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:08:55'),
(34, NULL, NULL, 0, 'Media', NULL, NULL, '/news', NULL, NULL, NULL, NULL, 'header', 'link', 6, 1, 0, NULL, 'system', NULL, '2025-10-21 08:47:16', '2025-10-21 08:47:16'),
(35, NULL, NULL, 0, 'Sustainability', '{\"id\":{\"title\":\"Keberlanjutan\",\"slug\":null,\"description\":null},\"en\":{\"title\":\"Sustainability\",\"slug\":null,\"description\":null}}', NULL, '/sustainability', NULL, NULL, NULL, NULL, 'header', 'link', 7, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 06:59:01'),
(36, NULL, NULL, 0, 'Life at Linknet', '{\"id\":{\"title\":\"Life at Linknet\",\"slug\":null,\"description\":null},\"en\":{\"title\":\"Career\",\"slug\":null,\"description\":null}}', NULL, '/life-at-linknet', NULL, NULL, NULL, NULL, 'header', 'link', 8, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:28:33'),
(37, NULL, NULL, 0, 'Company', '{\"id\":{\"title\":\"Perusahaan\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '#', NULL, NULL, NULL, NULL, 'footer', 'dropdown', 1, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:17:08'),
(38, 37, NULL, 0, 'About', '{\"id\":{\"title\":\"Tentang\",\"slug\":\"\\/about\\/corporate-information\",\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/about/corporate-overview', NULL, NULL, NULL, NULL, 'footer', 'link', 1, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:11:50'),
(39, 37, NULL, 0, 'Management', '{\"id\":{\"title\":\"Manajemen\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/about/management', NULL, NULL, NULL, NULL, 'footer', 'link', 2, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:18:20'),
(40, 37, NULL, 0, 'Business', '{\"id\":{\"title\":\"Bisnis\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/business/linknet-enterprise', NULL, NULL, NULL, NULL, 'footer', 'link', 3, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:19:06'),
(41, 37, NULL, 0, 'Media & News', '{\"id\":{\"title\":null,\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/news', NULL, NULL, NULL, NULL, 'footer', 'link', 4, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:19:27'),
(42, 37, NULL, 0, 'Awards', '{\"id\":{\"title\":\"Penghargaan\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/about/awards', NULL, NULL, NULL, NULL, 'footer', 'link', 5, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:20:12'),
(43, NULL, NULL, 0, 'Investor Relations', NULL, NULL, '#', NULL, NULL, NULL, NULL, 'footer', 'dropdown', 2, 1, 0, NULL, 'system', NULL, '2025-10-21 08:47:16', '2025-10-21 08:47:16'),
(44, 43, NULL, 0, 'Stock Price', '{\"id\":{\"title\":\"Harga Saham\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/investor-relations', NULL, NULL, NULL, NULL, 'footer', 'link', 1, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-12-02 08:35:58'),
(45, 43, NULL, 0, 'GMS Announcements', '{\"id\":{\"title\":\"Pengumuman RUPS\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/investor/gms-announcement', NULL, NULL, NULL, NULL, 'footer', 'link', 2, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:23:45'),
(46, 43, NULL, 0, 'Reports', '{\"id\":{\"title\":\"Laporan Keuangan\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/investor/financial-statement', NULL, NULL, NULL, NULL, 'footer', 'link', 3, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:24:50'),
(47, NULL, NULL, 0, 'Join #FirstSquad', NULL, NULL, '#', NULL, NULL, NULL, NULL, 'footer', 'dropdown', 3, 1, 0, NULL, 'system', NULL, '2025-10-21 08:47:16', '2025-10-21 08:47:16'),
(48, 47, NULL, 0, 'Life at Linknet', NULL, NULL, '/life-at-linknet', NULL, NULL, NULL, NULL, 'footer', 'link', 1, 1, 0, NULL, 'system', NULL, '2025-10-21 08:47:16', '2025-10-21 08:47:16'),
(49, 47, NULL, 0, 'Explore Career', '{\"id\":{\"title\":\"Karir\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/life-at-linknet/careers', NULL, NULL, NULL, NULL, 'footer', 'link', 2, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:25:55'),
(50, NULL, NULL, 0, 'Platform', NULL, NULL, '#', NULL, NULL, NULL, NULL, 'footer', 'dropdown', 4, 1, 0, NULL, 'system', NULL, '2025-10-21 08:47:16', '2025-10-21 08:47:16'),
(51, 50, NULL, 0, 'Corporate Policy', '{\"id\":{\"title\":\"Kebijakan Linknet\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/corporate-governance/linknet-policy', NULL, NULL, NULL, NULL, 'footer', 'link', 1, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:29:48'),
(53, 50, NULL, 0, 'Contact Us', '{\"id\":{\"title\":\"Hubungi Kami\",\"slug\":null,\"description\":null},\"en\":{\"title\":null,\"slug\":null,\"description\":null}}', NULL, '/contact-us', NULL, NULL, NULL, NULL, 'footer', 'link', 3, 1, 0, NULL, 'system', 'admin@gmail.com', '2025-10-21 08:47:16', '2025-11-26 07:30:20');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
