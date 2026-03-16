-- Table structure for table `report_items`
--

CREATE TABLE `report_items` (
  `id` bigint UNSIGNED NOT NULL,
  `report_type_id` bigint UNSIGNED DEFAULT NULL,
  `report_section_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sub_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `pdf_file` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cover_image` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_type` enum('Consolidated','Interim') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `audit_status` enum('Audited','Unaudited','Limited Review') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `report_items`
--

INSERT INTO `report_items` (`id`, `report_type_id`, `report_section_id`, `title`, `sub_description`, `pdf_file`, `cover_image`, `data_type`, `audit_status`, `file_size`, `sort_order`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, NULL, '2024', 'Transform Your Connectivity for Better Life', 'https://www.linknet.co.id/storage/files/document/report/annual/id/2024/LINK%20AR2024%20Rev.pdf', 'https://linknet.co.id/storage/files/1/files/report/cover/2024.webp', NULL, NULL, NULL, 1, 1, '2025-10-21 15:18:39', '2025-10-22 08:46:04', NULL),
(2, 1, NULL, '2023', 'Broadband Freedom', 'https://www.linknet.co.id/storage/files/document/report/annual/id/2023/LN%20AR%202023-Broadband%20Freedom.pdf', 'https://linknet.co.id/storage/files/1/files/report/cover/2023.webp', NULL, NULL, NULL, 2, 1, '2025-10-21 15:18:39', '2025-10-22 09:42:54', NULL),
(3, 1, NULL, '2022', 'Empowering Nation To Lead Modern Community', 'https://www.linknet.co.id/storage/files/document/report/annual/id/2022/AR%20LINK%202022%20-%20Empowering%20Nation%20to%20Lead%20Modern%20Community.pdf', 'https://linknet.co.id/storage/files/1/files/report/cover/2022.webp', NULL, NULL, NULL, 3, 1, '2025-10-21 15:18:39', '2025-10-22 09:43:02', NULL),
(4, 1, NULL, '2021', 'Value Creation Through New Identity', 'https://www.linknet.co.id/storage/files/document/report/annual/id/2021/AR%20LINK%2021%20Final%20Report.pdf', 'https://linknet.co.id/storage/files/1/files/report/cover/2021.webp', NULL, NULL, NULL, 4, 1, '2025-10-21 15:18:39', '2025-10-22 09:46:04', NULL),
(5, 1, NULL, '2020', 'Enpowering The New Normal', 'https://www.linknet.co.id/storage/files/document/report/annual/id/2020/EMPOWERING%20THE%20NEW%20NORMAL%20%5BFULL%20VERSION%5D/ARLN%2020%20-%20All%20For%20One%20(compress).pdf', 'https://linknet.co.id/storage/files/1/files/report/cover/2020.webp', NULL, NULL, NULL, 5, 1, '2025-10-21 15:18:39', '2025-10-22 09:47:22', NULL),
(6, 1, NULL, '2019', 'Building Remarkable Brand', 'https://linknet.co.id/storage/files/document/report/annual/id/2019/BUILDING%20REMARKABLE%20BRAND%20%5BFULL%20VERSION%5D/BUILDING%20REMARKABLE%20BRAND%20%5BFULL%20VERSION%5D.pdf', 'https://linknet.co.id/storage/files/1/files/report/cover/2019.webp', NULL, NULL, NULL, 6, 1, '2025-10-21 15:18:39', '2025-10-22 09:47:46', NULL),
(7, 1, NULL, '2018', 'Beyond Connectivity', 'https://linknet.co.id/storage/files/document/report/annual/id/2018/LN_AR2018%20-%20Beyond%20Connectivity%20%5BFINAL%5D.pdf', 'https://linknet.co.id/storage/files/1/files/report/cover/2018.webp', NULL, NULL, NULL, 7, 1, '2025-10-21 15:20:53', '2025-10-22 09:46:31', NULL),
(8, 1, NULL, '2017', 'Powering Broadband Momentum', 'https://linknet.co.id/storage/files/document/report/annual/id/2017/FINAL%20AR%20Link%20Net%202017_Combine.pdf', 'https://linknet.co.id/storage/files/1/files/report/cover/2017.webp', NULL, NULL, NULL, 8, 1, '2025-10-21 15:20:53', '2025-10-22 09:46:47', NULL),
(9, 1, NULL, '2016', 'English Version', 'https://linknet.co.id/storage/files/document/report/annual/id/2016/English%20Version.pdf', 'https://linknet.co.id/frontend/src/assets/img/main-image-4.jpg', NULL, NULL, NULL, 9, 1, '2025-10-21 15:20:53', '2025-10-21 15:20:53', NULL),
(10, 1, NULL, '2015', 'English Version', 'https://linknet.co.id/storage/files/document/report/annual/id/2015/English%20Version.pdf', 'https://linknet.co.id/frontend/src/assets/img/main-image-4.jpg', NULL, NULL, NULL, 10, 1, '2025-10-21 15:23:11', '2025-10-21 15:23:11', NULL),
(11, 1, NULL, '2014', 'English Version', 'https://linknet.co.id/storage/files/document/report/annual/id/2014/English%20Version.pdf', 'https://linknet.co.id/frontend/src/assets/img/main-image-4.jpg', NULL, NULL, NULL, 23, 1, '2025-10-21 15:23:11', '2025-10-21 15:23:11', NULL),
(12, 3, NULL, '2024', 'Empowering Connectivity for Sustainable Impact', 'https://www.linknet.co.id/storage/files/document/report/sustainable-report/LINK%202024SR%20Lowres.pdf', 'https://linknet.co.id/storage/files/1/files/report/sustainability/cover/2024.webp', NULL, NULL, NULL, 1, 1, '2025-10-21 15:25:50', '2025-10-22 10:05:33', NULL),
(13, 3, NULL, '2023', 'Harmonization in Sustainable Connection', 'https://www.linknet.co.id/storage/files/document/report/sustainable-report/LN%20SR-2023-Harmonization%20in%20Sustainable%20Connection.pdf', 'https://linknet.co.id/storage/files/1/files/report/sustainability/cover/2023.webp', NULL, NULL, NULL, 2, 1, '2025-10-21 15:25:50', '2025-10-22 10:05:39', NULL),
(14, 3, NULL, '2022', 'Growing Connection, Improving Lives', 'https://www.linknet.co.id/storage/files/document/report/sustainable-report/PT%20Link%20Net%20Tbk%20-%20FY2022%20Sustainability%20Report.pdf', 'https://linknet.co.id/storage/files/1/files/report/sustainability/cover/2022.webp', NULL, NULL, NULL, 3, 1, '2025-10-21 15:25:50', '2025-10-22 10:05:46', NULL),
(15, 3, NULL, '2021', 'Sustaining Our Way Of Life', 'https://www.linknet.co.id/storage/files/document/report/sustainable-report/Final%20LinkNet%20SR2021%20Lores%20Pages%202.pdf', 'https://linknet.co.id/storage/files/1/files/report/sustainability/cover/2021.webp', NULL, NULL, NULL, 4, 1, '2025-10-21 15:25:50', '2025-10-22 10:05:52', NULL),
(16, 2, 1, 'Interim Consolidated Financial Statements as of 30 June 2025', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2025/LINK_TWII_LKFS%20Final%2030%20June%202025.pdf', NULL, 'Interim', 'Audited', NULL, 3, 1, '2025-10-21 17:05:50', '2026-02-16 08:26:01', NULL),
(17, 2, 1, 'Interim Consolidated Financial Statements 31 March 2025', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/NewFolder/LINK_TW%20I_LKFS%20Final%2031%20March%202025.pdf', NULL, 'Interim', 'Unaudited', NULL, 4, 1, '2025-10-21 17:05:50', '2026-02-16 08:26:01', NULL),
(18, 2, 2, 'Consolidated Financial Statements for the year ended 31 December 2024', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2024/2024_LINK%20LKT%2031Dec2024_Audit.pdf', NULL, 'Consolidated', 'Audited', NULL, 3, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(19, 2, 2, 'Interim Consolidated Financial Statements as of 31 Maret 2024', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2024/2024_LINK%20LKTWI%2031Mar2024_Limited%20Review.pdf', NULL, 'Interim', 'Unaudited', NULL, 4, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(20, 2, 2, 'Interim Consolidated Financial Statements as of 30 June 2024', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2024/2024_LINK%20LKTT%20TWII%2030Jun2024_Audit.pdf', NULL, 'Interim', 'Audited', NULL, 5, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(21, 2, 2, 'Interim Consolidated Financial Statements as of 30 September 2024', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2024/2024_LINK%20LKTWIII%2030Sep2024_Audit.pdf', NULL, 'Interim', 'Audited', NULL, 6, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(22, 2, 3, 'Consolidated Financial Statements for the year ended 31 December 2023', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2023/2023_LINK%20LKT%2031%20Dec%202023_Audited.pdf', NULL, 'Consolidated', 'Audited', NULL, 7, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(23, 2, 3, 'Interim Consolidation Financial Statements as of 30 September 2023', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2023/2023_LINK%20LKTWIII%2030Sep2023_Audited.pdf', NULL, 'Interim', 'Audited', NULL, 8, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(24, 2, 3, 'Interim Consolidation Financial Statements as of 30 June 2023', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2023/2023_LINK%20LKTWII%2030%20JUNE%202023%20%5Baudited%5D.pdf', NULL, 'Interim', 'Audited', NULL, 9, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(25, 2, 3, 'Interim Consolidated Financial Statements as of 31 March 2023', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2023/2023_LINK%20LKTWI%2031%20MARET%202023.pdf', NULL, 'Interim', 'Unaudited', NULL, 10, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(26, 2, 4, 'Consolidated Financial Statements for the Years ended 31 December 2022', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2022/2022_LINK_LKT%2031Des2022.pdf', NULL, 'Consolidated', 'Audited', NULL, 11, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(27, 2, 4, 'Interim Consolidated Financial Statements as of 30 September 2022', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2022/2022_LINK_LKTWIII_30_September.pdf', NULL, 'Interim', 'Unaudited', NULL, 12, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(28, 2, 4, 'Interim Consolidated Financial Statements as of 30 June 2022', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2022/LINK%20LKTWII%2030%20Juni%202022.pdf', NULL, 'Interim', 'Unaudited', NULL, 13, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(29, 2, 4, 'Interim Consolidated Financial Statements as of 31 March 2022', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2022/2022_LINK_LKTWI_31_Maret.pdf', NULL, 'Interim', 'Unaudited', NULL, 14, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(30, 2, 5, 'Consolidated Financial Statements for the Years Ended 31 Desember 2021 (Audited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2021/Consolidated%20Financial%20Statements%20for%20the%20Years%20Ended%2031%20Desember%202021%20(Audited)/LINK%20LKT%2031%20Desember%202021.pdf', NULL, 'Consolidated', 'Audited', NULL, 15, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(31, 2, 5, 'Interim Consolidated Financial Statements as of 30 September 2021', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2021/Interim%20Consolidated%20Financial%20Statements%20as%20of%2030%20September%202021/LINK%20LKTW3%2030%20September%202021.pdf', NULL, 'Interim', 'Unaudited', NULL, 16, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(32, 2, 5, 'Interim Consolidated Financial Statements as of 30 June 2021', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2021/Interim%20Consolidated%20Financial%20Statements%20as%20of%2030%20June%202021/LINK_Lap%20Keu%20Interim%20(30%20Juni%2021)(Audited).pdf', NULL, 'Interim', 'Audited', NULL, 17, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(33, 2, 5, 'Interim Consolidated Financial Statements as of 31 March 2021 (Unaudited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2021/Interim%20Consolidated%20Financial%20Statements%20as%20of%2031%20March%202021%20(Unaudited)/LINK%20LKTWI%2031%20Maret%202021.pdf', NULL, 'Interim', 'Unaudited', NULL, 18, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(34, 2, 6, 'Consolidated Financial Statements for the Years Ended 31 December 2020 (Audited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2020/Consolidated%20Financial%20Statements%20for%20the%20Years%20Ended%2031%20December%202020%20(Audited)/LINK%20LKT%2031%20Desember%202020.pdf', NULL, 'Consolidated', 'Audited', NULL, 19, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(35, 2, 6, 'Interim Consolidated Financial Statements as of 30 September 2020 (Unaudited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2020/Interim%20Consolidated%20Financial%20Statements%20as%20of%2030%20September%202020%20(Unaudited)/fa23054d9ccaf31b29fff905994a5ca9607d045a.pdf', NULL, 'Interim', 'Unaudited', NULL, 20, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(36, 2, 6, 'Interim Consolidated Financial Statements as of 30 June 2020 (Unaudited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2020/Interim%20Consolidated%20Financial%20Statements%20as%20of%2030%20June%202020%20(Unaudited)/f0f9ccdb41a46256a448f4a6f2feb50068d07e30.pdf', NULL, 'Interim', 'Unaudited', NULL, 21, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(37, 2, 6, 'Interim Consolidated Financial Statements as of 31 March 2020 (Unaudited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2020/Interim%20Consolidated%20Financial%20Statements%20as%20of%2031%20March%202020%20(Unaudited)/1cef282ae2e90e699c324fc4dab06568ca3123d7.pdf', NULL, 'Interim', 'Unaudited', NULL, 22, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(38, 2, 7, 'Interim Consolidated Financial Statements as of 31 March 2019 (Unaudited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2019/%20Interim%20Consolidated%20Financial%20Statements%20as%20of%2031%20March%202019%20(Unaudited)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 23, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(39, 2, 7, 'Interim Consolidated Financial Statements as of 30 June 2019 (Unaudited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2019/%20Interim%20Consolidated%20Financial%20Statements%20as%20of%2030%20June%202019%20(Unaudited)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 24, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(40, 2, 7, 'Interim Consolidated Financial Statements as of 30 September 2019 (Unaudited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2019/%20Interim%20Consolidated%20Financial%20Statements%20as%20of%2030%20September%202019%20(Unaudited)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 25, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(41, 2, 7, 'Consolidated Financial Statements for the Years Ended 31 December 2019 (Audited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2019/Consolidated%20Financial%20Statements%20for%20the%20Years%20Ended%2031%20December%202019%20(Audited)%20.pdf', NULL, 'Consolidated', 'Audited', NULL, 26, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(42, 2, 8, 'Interim Consolidated Financial Statements as of 31 March 2018 (Unaudited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2018/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2031%20Maret%202018%20(Tidak%20Diaudit)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 27, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(43, 2, 8, 'Interim Consolidated Financial Statements as of 30 June 2018 (Unaudited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2018/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20Juni%202018%20(Tidak%20Diaudit)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 28, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(44, 2, 8, 'Interim Consolidated Financial Statements as of 30 September 2018 (Unaudited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2018/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20September%202018%20(Tidak%20Diaudit)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 29, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(45, 2, 8, 'Consolidated Financial Statements For the Years Ended 31 December 2018 (Audited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2018/Laporan%20Keuangan%20Konsolidasian%20Untuk%20Tahun-tahun%20yang%20Berakhir%20Pada%20Tanggal%2031%20Desember%202018%20(Diaudit)%20.pdf', NULL, 'Consolidated', 'Audited', NULL, 30, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(46, 2, 9, 'Interim Consolidated Financial Statements as of 31 March 2017 (Unaudited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2017/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2031%20Maret%202017%20(Tidak%20Diaudit)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 31, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(47, 2, 9, 'Interim Consolidated Financial Statements as of 30 June 2017 (Unaudited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2017/Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20Juni%202017%20(Tidak%20Diaudit)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 32, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(48, 2, 9, 'Interim Consolidated Financial Statements as of 30 September 2017 (Unaudited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2017/Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20September%202017%20(Tidak%20Diaudit)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 33, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(49, 2, 9, 'Consolidated Financial Statements For the Years Ended 31 December 2017 (Audited)', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2017/Laporan%20Keuangan%20Konsolidasian%20Untuk%20Tahun-tahun%20yang%20Berakhir%20Pada%20Tanggal%2031%20Desember%202017%20(Diaudit)%20.pdf', NULL, 'Consolidated', 'Audited', NULL, 34, 1, '2025-10-21 17:05:50', '2025-10-21 17:05:50', NULL),
(50, 2, 10, 'Interim Consolidated Financial Statements as of 31 March 2016', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2016/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2031%20Maret%202016%20(Tidak%20Diaudit)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 35, 1, '2025-10-21 17:06:49', '2025-10-21 17:06:49', NULL),
(51, 2, 10, 'Interim Consolidated Financial Statements as of 30 June 2016', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2016/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20Juni%202016%20(Tidak%20Diaudit)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 36, 1, '2025-10-21 17:06:49', '2025-10-21 17:06:49', NULL),
(52, 2, 10, 'Interim Consolidated Financial Statements as of 30 September 2016', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2016/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20September%202016%20(Tidak%20Diaudit)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 37, 1, '2025-10-21 17:06:49', '2025-10-21 17:06:49', NULL),
(53, 2, 10, 'Consolidated Financial Statements For the Years Ended 31 December 2016', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2016/Laporan%20Keuangan%20Konsolidasian%20Untuk%20Tahun-tahun%20yang%20Berakhir%20Pada%20Tanggal%2031%20Desember%202016%20(Diaudit)%20.pdf', NULL, 'Consolidated', 'Audited', NULL, 38, 1, '2025-10-21 17:06:49', '2025-10-21 17:06:49', NULL),
(54, 2, 11, 'Interim Consolidated Financial Statements as of 31 March 2015', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2015/Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2031%20Maret%202015%20(Tidak%20Diaudit)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 39, 1, '2025-10-21 17:06:49', '2025-10-21 17:06:49', NULL),
(55, 2, 11, 'Interim Consolidated Financial Statements as of 30 June 2015', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2015/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20Juni%202015%20(Tidak%20Diaudit)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 40, 1, '2025-10-21 17:06:49', '2025-10-21 17:06:49', NULL),
(56, 2, 11, 'Interim Consolidated Financial Statements as of 30 September 2015', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2015/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20September%202015%20(Tidak%20Diaudit)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 41, 1, '2025-10-21 17:06:49', '2025-10-21 17:06:49', NULL),
(57, 2, 11, 'Consolidated Financial Statements For the Years Ended 31 December 2015', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2015/Laporan%20Keuangan%20Konsolidasian%20Untuk%20Tahun-tahun%20yang%20Berakhir%20Pada%20Tanggal%2031%20Desember%202015%20(Diaudit)%20.pdf', NULL, 'Consolidated', 'Audited', NULL, 42, 1, '2025-10-21 17:06:49', '2025-10-21 17:06:49', NULL),
(58, 2, 12, 'Interim Consolidated Financial Statements as of 30 June 2014', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2014/Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20Juni%202014%20(Diaudit)%20.pdf', NULL, 'Interim', 'Audited', NULL, 43, 1, '2025-10-21 17:06:49', '2025-10-21 17:06:49', NULL),
(59, 2, 12, 'Interim Consolidated Financial Statements as of 30 September 2014', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2014/Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20September%202014%20(Tidak%20Diaudit)%20.pdf', NULL, 'Interim', 'Unaudited', NULL, 44, 1, '2025-10-21 17:06:49', '2025-10-21 17:06:49', NULL),
(60, 2, 12, 'Consolidated Financial Statements For the Years Ended 31 December 2014', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2014/Laporan%20Keuangan%20Konsolidasian%20Untuk%20Tahun-tahun%20yang%20Berakhir%20Pada%20Tanggal%2031%20Desember%202014%20(Diaudit)%20.pdf', NULL, 'Consolidated', 'Audited', NULL, 45, 1, '2025-10-21 17:06:49', '2025-10-21 17:06:49', NULL),
(61, NULL, 1, 'Interim Consolidated Financial Statements as of 30 September 2025', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2025/LINK LKTWIII 30 SEPTEMBER 2025 [Audited].pdf', NULL, NULL, 'Audited', NULL, 2, 1, '2025-12-29 09:04:41', '2026-02-16 08:26:01', NULL),
(62, NULL, 1, 'Consolidated Financial Statements for the year ended 31 December 2025', NULL, 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2025/LINK_LKFS Audited 31 December 2025.pdf', NULL, 'Consolidated', 'Audited', NULL, 1, 1, '2026-02-16 07:15:16', '2026-02-16 08:26:01', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `report_sections`
--

CREATE TABLE `report_sections` (
  `id` bigint UNSIGNED NOT NULL,
  `report_type_id` bigint UNSIGNED NOT NULL,
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `report_year` int DEFAULT NULL,
  `cta_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `cta_text` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cta_url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `report_sections`
--

INSERT INTO `report_sections` (`id`, `report_type_id`, `title`, `description`, `report_year`, `cta_enabled`, `cta_text`, `cta_url`, `sort_order`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 2, 'Financial Statements 2025', NULL, 2025, 0, NULL, NULL, 1, 1, '2025-10-21 16:51:29', '2025-10-21 16:51:29', NULL),
(2, 2, 'Financial Statements 2024', NULL, 2024, 0, NULL, NULL, 2, 1, '2025-10-21 16:51:29', '2025-10-21 16:51:29', NULL),
(3, 2, 'Financial Statements 2023', NULL, 2023, 0, NULL, NULL, 3, 1, '2025-10-21 16:51:29', '2025-10-21 16:51:29', NULL),
(4, 2, 'Financial Statement 2022', NULL, 2022, 0, NULL, NULL, 4, 1, '2025-10-21 16:51:29', '2025-10-21 16:51:29', NULL),
(5, 2, 'Financial Statement 2021', NULL, 2021, 0, NULL, NULL, 5, 1, '2025-10-21 16:51:29', '2025-10-21 16:51:29', NULL),
(6, 2, 'Financial Statement 2020', NULL, 2020, 0, NULL, NULL, 6, 1, '2025-10-21 16:51:29', '2025-10-21 16:51:29', NULL),
(7, 2, 'Financial Statement 2019', NULL, 2019, 0, NULL, NULL, 7, 1, '2025-10-21 16:51:29', '2025-10-21 16:51:29', NULL),
(8, 2, 'Financial Statement 2018', NULL, 2018, 0, NULL, NULL, 8, 1, '2025-10-21 16:51:29', '2025-10-21 16:51:29', NULL),
(9, 2, 'Financial Statement 2017', NULL, 2017, 0, NULL, NULL, 9, 1, '2025-10-21 16:51:29', '2025-10-21 16:51:29', NULL),
(10, 2, 'Financial Statement 2016', NULL, 2016, 0, NULL, NULL, 10, 1, '2025-10-21 16:51:29', '2025-10-21 16:51:29', NULL),
(11, 2, 'Financial Statement 2015', NULL, 2015, 0, NULL, NULL, 11, 1, '2025-10-21 16:51:29', '2025-10-21 16:51:29', NULL),
(12, 2, 'Financial Statement 2014', NULL, 2014, 0, NULL, NULL, 12, 1, '2025-10-21 16:51:29', '2025-10-21 16:51:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `report_types`
--

CREATE TABLE `report_types` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('Grid','List') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Grid',
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `report_types`
--

INSERT INTO `report_types` (`id`, `name`, `type`, `sort_order`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Annual Report', 'Grid', 1, 1, '2025-10-21 14:29:44', '2025-10-20 17:00:00', NULL),
(3, 'Sustainable Report', 'Grid', 3, 1, '2025-10-21 15:24:39', '2025-10-20 17:00:00', NULL),
(2, 'Financial Statement', 'List', 2, 1, '2025-10-19 17:00:00', '2025-10-20 09:32:26', NULL);