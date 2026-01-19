-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 19, 2026 at 03:03 AM
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
-- Table structure for table `page_components`
--

DROP TABLE IF EXISTS `page_components`;
CREATE TABLE IF NOT EXISTS `page_components` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `page_id` bigint UNSIGNED NOT NULL,
  `component_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `component_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `page_components_page_id_sort_order_index` (`page_id`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=235 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `page_components`
--

INSERT INTO `page_components` (`id`, `page_id`, `component_type`, `component_data`, `sort_order`, `is_visible`, `created_at`, `updated_at`) VALUES
(72, 1, 'news_highlight', '{\"order_by\": \"created_at\", \"custom_id\": \"\", \"show_date\": true, \"bg_section\": \"bg-gradient-gray\", \"grid_count\": 3, \"intro_label\": \"MEDIA & ACTIVITIES\", \"intro_title\": \"Keep up with what\'s happening at Linknet\", \"custom_class\": \"\", \"show_excerpt\": true, \"show_category\": true, \"container_type\": \"container\", \"excerpt_length\": 150, \"featured_count\": 1, \"order_direction\": \"desc\", \"featured_excerpt_length\": 200}', 7, 1, '2025-10-08 06:19:11', '2025-10-19 07:51:57'),
(77, 1, 'business_tab', '{\"custom_id\":null,\"custom_class\":null,\"intro_label\":{\"en\":\"EXPLORE OUR BUSINESS\"},\"intro_title\":{\"en\":\"Driving Better Lives Through Innovation\"},\"intro_description\":{\"en\":\"Linknet advances Indonesia\\u2019s digital transformation through innovative, reliable infrastructure.\"},\"tabs\":[{\"name\":\"EnterpriseCo\",\"id\":\"enterprise\",\"title\":\"Seamless Connectivity, Smart ICT Solutions, and Trusted Cybersecurity\",\"title_id\":null,\"description\":\"We provide reliable connectivity, technology, and cybersecurity solutions to support digital transformation. With over 3,300 customers, we deliver secure, high-performance internet and ICT services for large-scale enterprises while offering reliable connectivity for SMEs (Small Medium Enterprises) to help businesses grow in the digital era.\",\"description_id\":\"Kami menyediakan solusi konektivitas, teknologi, dan keamanan siber yang andal untuk mendukung transformasi digital. Dengan lebih dari 3.300 pelanggan, kami menghadirkan layanan internet dan TIK yang aman dan berkinerja tinggi untuk perusahaan berskala besar, sekaligus menawarkan konektivitas yang andal bagi UKM (Usaha Kecil dan Menengah) untuk membantu bisnis berkembang di era digital.\",\"background_image\":\"https:\\/\\/linknet.co.id\\/frontend\\/src\\/assets\\/bg\\/bg-enterprise.jpg\",\"logo_image\":\"https:\\/\\/linknet.co.id\\/frontend\\/src\\/assets\\/logos\\/logo-enterprise.svg\",\"bg_position\":\"right\",\"cta_text\":\"Learn More\",\"cta_text_id\":null,\"cta_link\":\"https:\\/\\/linknet.co.id\\/business\\/linknet-enterprise\"},{\"name\":\"FiberCo\",\"id\":\"fiberco\",\"title\":\"Your Solution for Nationwide Connectivity\",\"title_id\":null,\"description\":\"Linknet Fiber dedicated to delivering the ultimate internet experience with cutting-edge fiber optic technology that will connect Internet Service Providers (ISPs) to customers. Corinections via backbone and last mile networks allow ISPs to provide access to telecommunications services to customers\",\"description_id\":\"Linknet Fiber berkomitmen untuk menghadirkan pengalaman internet terbaik dengan teknologi serat optik mutakhir yang akan menghubungkan Penyedia Layanan Internet (ISP) kepada pelanggan. Koneksi melalui jaringan backbone dan last mile memungkinkan ISP menyediakan akses layanan telekomunikasi kepada pelanggan.\",\"background_image\":\"https:\\/\\/linknet.co.id\\/storage\\/files\\/1\\/assets\\/bg\\/ln-fiber-desktop.jpg\",\"logo_image\":\"https:\\/\\/linknet.co.id\\/frontend\\/src\\/assets\\/logos\\/logo-fiberco-white.png\",\"bg_position\":\"center\",\"cta_text\":\"Learn More\",\"cta_text_id\":null,\"cta_link\":\"https:\\/\\/linknet.co.id\\/business\\/linknet-fiber\"},{\"name\":\"MediaCo\",\"id\":\"mediaco\",\"title\":\"Your Gateway to Quality Content and Smarter Media\",\"title_id\":null,\"description\":\"Premium entertainment and media solutions that bring the best content directly to your home and business.\",\"description_id\":\"Solusi hiburan dan media premium yang menghadirkan konten terbaik langsung ke rumah dan bisnis Anda\",\"background_image\":\"https:\\/\\/www.linknet.co.id\\/storage\\/files\\/1\\/assets\\/bg\\/ln-media-desktop.jpg\",\"logo_image\":\"https:\\/\\/linknet.co.id\\/frontend\\/src\\/assets\\/logos\\/logo-mediaco.svg\",\"bg_position\":\"center\",\"cta_text\":\"Learn More\",\"cta_text_id\":null,\"cta_link\":\"https:\\/\\/linknet.co.id\\/business\\/linknet-media\"}],\"bg_type\":\"color\",\"bg_color\":\"#ffffff\",\"bg_color_text\":\"#ffffff\",\"bg_image\":null,\"bg_position\":\"center\"}', 4, 1, '2025-10-09 02:16:21', '2025-12-05 08:36:04');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
