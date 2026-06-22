/**
 * Migration Script: Old MySQL data → New PostgreSQL (Prisma)
 * 
 * Source: data_report_lengkap.sql (MySQL dump)
 * Target: PostgreSQL via Prisma Client
 * 
 * Mapping:
 *   Old report_types (bigint id) → New report_types (UUID id)
 *   Old report_sections (bigint id) → New report_sections (UUID id)
 *   Old report_items (bigint id) → New reports (UUID id)
 * 
 * Run: cd backend && node scripts/migrate-report-data.js
 */

const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');

const prisma = new PrismaClient();

// ============================================
// OLD DATA FROM SQL DUMP
// ============================================

const OLD_REPORT_TYPES = [
  { id: 1, name: 'Annual Report', type: 'Grid', sort_order: 1, is_active: true, created_at: '2025-10-21 14:29:44', updated_at: '2025-10-20 17:00:00' },
  { id: 2, name: 'Financial Statement', type: 'List', sort_order: 2, is_active: true, created_at: '2025-10-19 17:00:00', updated_at: '2025-10-20 09:32:26' },
  { id: 3, name: 'Sustainable Report', type: 'Grid', sort_order: 3, is_active: true, created_at: '2025-10-21 15:24:39', updated_at: '2025-10-20 17:00:00' },
];

const OLD_REPORT_SECTIONS = [
  { id: 1, report_type_id: 2, title: 'Financial Statements 2025', report_year: 2025, sort_order: 1, is_active: true, created_at: '2025-10-21 16:51:29', updated_at: '2025-10-21 16:51:29' },
  { id: 2, report_type_id: 2, title: 'Financial Statements 2024', report_year: 2024, sort_order: 2, is_active: true, created_at: '2025-10-21 16:51:29', updated_at: '2025-10-21 16:51:29' },
  { id: 3, report_type_id: 2, title: 'Financial Statements 2023', report_year: 2023, sort_order: 3, is_active: true, created_at: '2025-10-21 16:51:29', updated_at: '2025-10-21 16:51:29' },
  { id: 4, report_type_id: 2, title: 'Financial Statement 2022', report_year: 2022, sort_order: 4, is_active: true, created_at: '2025-10-21 16:51:29', updated_at: '2025-10-21 16:51:29' },
  { id: 5, report_type_id: 2, title: 'Financial Statement 2021', report_year: 2021, sort_order: 5, is_active: true, created_at: '2025-10-21 16:51:29', updated_at: '2025-10-21 16:51:29' },
  { id: 6, report_type_id: 2, title: 'Financial Statement 2020', report_year: 2020, sort_order: 6, is_active: true, created_at: '2025-10-21 16:51:29', updated_at: '2025-10-21 16:51:29' },
  { id: 7, report_type_id: 2, title: 'Financial Statement 2019', report_year: 2019, sort_order: 7, is_active: true, created_at: '2025-10-21 16:51:29', updated_at: '2025-10-21 16:51:29' },
  { id: 8, report_type_id: 2, title: 'Financial Statement 2018', report_year: 2018, sort_order: 8, is_active: true, created_at: '2025-10-21 16:51:29', updated_at: '2025-10-21 16:51:29' },
  { id: 9, report_type_id: 2, title: 'Financial Statement 2017', report_year: 2017, sort_order: 9, is_active: true, created_at: '2025-10-21 16:51:29', updated_at: '2025-10-21 16:51:29' },
  { id: 10, report_type_id: 2, title: 'Financial Statement 2016', report_year: 2016, sort_order: 10, is_active: true, created_at: '2025-10-21 16:51:29', updated_at: '2025-10-21 16:51:29' },
  { id: 11, report_type_id: 2, title: 'Financial Statement 2015', report_year: 2015, sort_order: 11, is_active: true, created_at: '2025-10-21 16:51:29', updated_at: '2025-10-21 16:51:29' },
  { id: 12, report_type_id: 2, title: 'Financial Statement 2014', report_year: 2014, sort_order: 12, is_active: true, created_at: '2025-10-21 16:51:29', updated_at: '2025-10-21 16:51:29' },
];

const OLD_REPORT_ITEMS = [
  { id: 1, report_type_id: 1, report_section_id: null, title: '2024', sub_description: 'Transform Your Connectivity for Better Life', pdf_file: 'https://www.linknet.co.id/storage/files/document/report/annual/id/2024/LINK%20AR2024%20Rev.pdf', cover_image: 'https://linknet.co.id/storage/files/1/files/report/cover/2024.webp', data_type: null, audit_status: null, file_size: null, sort_order: 1, is_active: true, created_at: '2025-10-21 15:18:39', updated_at: '2025-10-22 08:46:04' },
  { id: 2, report_type_id: 1, report_section_id: null, title: '2023', sub_description: 'Broadband Freedom', pdf_file: 'https://www.linknet.co.id/storage/files/document/report/annual/id/2023/LN%20AR%202023-Broadband%20Freedom.pdf', cover_image: 'https://linknet.co.id/storage/files/1/files/report/cover/2023.webp', data_type: null, audit_status: null, file_size: null, sort_order: 2, is_active: true, created_at: '2025-10-21 15:18:39', updated_at: '2025-10-22 09:42:54' },
  { id: 3, report_type_id: 1, report_section_id: null, title: '2022', sub_description: 'Empowering Nation To Lead Modern Community', pdf_file: 'https://www.linknet.co.id/storage/files/document/report/annual/id/2022/AR%20LINK%202022%20-%20Empowering%20Nation%20to%20Lead%20Modern%20Community.pdf', cover_image: 'https://linknet.co.id/storage/files/1/files/report/cover/2022.webp', data_type: null, audit_status: null, file_size: null, sort_order: 3, is_active: true, created_at: '2025-10-21 15:18:39', updated_at: '2025-10-22 09:43:02' },
  { id: 4, report_type_id: 1, report_section_id: null, title: '2021', sub_description: 'Value Creation Through New Identity', pdf_file: 'https://www.linknet.co.id/storage/files/document/report/annual/id/2021/AR%20LINK%2021%20Final%20Report.pdf', cover_image: 'https://linknet.co.id/storage/files/1/files/report/cover/2021.webp', data_type: null, audit_status: null, file_size: null, sort_order: 4, is_active: true, created_at: '2025-10-21 15:18:39', updated_at: '2025-10-22 09:46:04' },
  { id: 5, report_type_id: 1, report_section_id: null, title: '2020', sub_description: 'Enpowering The New Normal', pdf_file: 'https://www.linknet.co.id/storage/files/document/report/annual/id/2020/EMPOWERING%20THE%20NEW%20NORMAL%20%5BFULL%20VERSION%5D/ARLN%2020%20-%20All%20For%20One%20(compress).pdf', cover_image: 'https://linknet.co.id/storage/files/1/files/report/cover/2020.webp', data_type: null, audit_status: null, file_size: null, sort_order: 5, is_active: true, created_at: '2025-10-21 15:18:39', updated_at: '2025-10-22 09:47:22' },
  { id: 6, report_type_id: 1, report_section_id: null, title: '2019', sub_description: 'Building Remarkable Brand', pdf_file: 'https://linknet.co.id/storage/files/document/report/annual/id/2019/BUILDING%20REMARKABLE%20BRAND%20%5BFULL%20VERSION%5D/BUILDING%20REMARKABLE%20BRAND%20%5BFULL%20VERSION%5D.pdf', cover_image: 'https://linknet.co.id/storage/files/1/files/report/cover/2019.webp', data_type: null, audit_status: null, file_size: null, sort_order: 6, is_active: true, created_at: '2025-10-21 15:18:39', updated_at: '2025-10-22 09:47:46' },
  { id: 7, report_type_id: 1, report_section_id: null, title: '2018', sub_description: 'Beyond Connectivity', pdf_file: 'https://linknet.co.id/storage/files/document/report/annual/id/2018/LN_AR2018%20-%20Beyond%20Connectivity%20%5BFINAL%5D.pdf', cover_image: 'https://linknet.co.id/storage/files/1/files/report/cover/2018.webp', data_type: null, audit_status: null, file_size: null, sort_order: 7, is_active: true, created_at: '2025-10-21 15:20:53', updated_at: '2025-10-22 09:46:31' },
  { id: 8, report_type_id: 1, report_section_id: null, title: '2017', sub_description: 'Powering Broadband Momentum', pdf_file: 'https://linknet.co.id/storage/files/document/report/annual/id/2017/FINAL%20AR%20Link%20Net%202017_Combine.pdf', cover_image: 'https://linknet.co.id/storage/files/1/files/report/cover/2017.webp', data_type: null, audit_status: null, file_size: null, sort_order: 8, is_active: true, created_at: '2025-10-21 15:20:53', updated_at: '2025-10-22 09:46:47' },
  { id: 9, report_type_id: 1, report_section_id: null, title: '2016', sub_description: 'English Version', pdf_file: 'https://linknet.co.id/storage/files/document/report/annual/id/2016/English%20Version.pdf', cover_image: 'https://linknet.co.id/frontend/src/assets/img/main-image-4.jpg', data_type: null, audit_status: null, file_size: null, sort_order: 9, is_active: true, created_at: '2025-10-21 15:20:53', updated_at: '2025-10-21 15:20:53' },
  { id: 10, report_type_id: 1, report_section_id: null, title: '2015', sub_description: 'English Version', pdf_file: 'https://linknet.co.id/storage/files/document/report/annual/id/2015/English%20Version.pdf', cover_image: 'https://linknet.co.id/frontend/src/assets/img/main-image-4.jpg', data_type: null, audit_status: null, file_size: null, sort_order: 10, is_active: true, created_at: '2025-10-21 15:23:11', updated_at: '2025-10-21 15:23:11' },
  { id: 11, report_type_id: 1, report_section_id: null, title: '2014', sub_description: 'English Version', pdf_file: 'https://linknet.co.id/storage/files/document/report/annual/id/2014/English%20Version.pdf', cover_image: 'https://linknet.co.id/frontend/src/assets/img/main-image-4.jpg', data_type: null, audit_status: null, file_size: null, sort_order: 23, is_active: true, created_at: '2025-10-21 15:23:11', updated_at: '2025-10-21 15:23:11' },
  // Sustainable Reports (type_id=3)
  { id: 12, report_type_id: 3, report_section_id: null, title: '2024', sub_description: 'Empowering Connectivity for Sustainable Impact', pdf_file: 'https://www.linknet.co.id/storage/files/document/report/sustainable-report/LINK%202024SR%20Lowres.pdf', cover_image: 'https://linknet.co.id/storage/files/1/files/report/sustainability/cover/2024.webp', data_type: null, audit_status: null, file_size: null, sort_order: 1, is_active: true, created_at: '2025-10-21 15:25:50', updated_at: '2025-10-22 10:05:33' },
  { id: 13, report_type_id: 3, report_section_id: null, title: '2023', sub_description: 'Harmonization in Sustainable Connection', pdf_file: 'https://www.linknet.co.id/storage/files/document/report/sustainable-report/LN%20SR-2023-Harmonization%20in%20Sustainable%20Connection.pdf', cover_image: 'https://linknet.co.id/storage/files/1/files/report/sustainability/cover/2023.webp', data_type: null, audit_status: null, file_size: null, sort_order: 2, is_active: true, created_at: '2025-10-21 15:25:50', updated_at: '2025-10-22 10:05:39' },
  { id: 14, report_type_id: 3, report_section_id: null, title: '2022', sub_description: 'Growing Connection, Improving Lives', pdf_file: 'https://www.linknet.co.id/storage/files/document/report/sustainable-report/PT%20Link%20Net%20Tbk%20-%20FY2022%20Sustainability%20Report.pdf', cover_image: 'https://linknet.co.id/storage/files/1/files/report/sustainability/cover/2022.webp', data_type: null, audit_status: null, file_size: null, sort_order: 3, is_active: true, created_at: '2025-10-21 15:25:50', updated_at: '2025-10-22 10:05:46' },
  { id: 15, report_type_id: 3, report_section_id: null, title: '2021', sub_description: 'Sustaining Our Way Of Life', pdf_file: 'https://www.linknet.co.id/storage/files/document/report/sustainable-report/Final%20LinkNet%20SR2021%20Lores%20Pages%202.pdf', cover_image: 'https://linknet.co.id/storage/files/1/files/report/sustainability/cover/2021.webp', data_type: null, audit_status: null, file_size: null, sort_order: 4, is_active: true, created_at: '2025-10-21 15:25:50', updated_at: '2025-10-22 10:05:52' },
  // Financial Statement items (type_id=2, with section_id)
  { id: 16, report_type_id: 2, report_section_id: 1, title: 'Interim Consolidated Financial Statements as of 30 June 2025', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2025/LINK_TWII_LKFS%20Final%2030%20June%202025.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Audited', file_size: null, sort_order: 3, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2026-02-16 08:26:01' },
  { id: 17, report_type_id: 2, report_section_id: 1, title: 'Interim Consolidated Financial Statements 31 March 2025', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/NewFolder/LINK_TW%20I_LKFS%20Final%2031%20March%202025.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 4, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2026-02-16 08:26:01' },
  { id: 18, report_type_id: 2, report_section_id: 2, title: 'Consolidated Financial Statements for the year ended 31 December 2024', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2024/2024_LINK%20LKT%2031Dec2024_Audit.pdf', cover_image: null, data_type: 'Consolidated', audit_status: 'Audited', file_size: null, sort_order: 3, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 19, report_type_id: 2, report_section_id: 2, title: 'Interim Consolidated Financial Statements as of 31 Maret 2024', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2024/2024_LINK%20LKTWI%2031Mar2024_Limited%20Review.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 4, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 20, report_type_id: 2, report_section_id: 2, title: 'Interim Consolidated Financial Statements as of 30 June 2024', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2024/2024_LINK%20LKTT%20TWII%2030Jun2024_Audit.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Audited', file_size: null, sort_order: 5, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 21, report_type_id: 2, report_section_id: 2, title: 'Interim Consolidated Financial Statements as of 30 September 2024', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2024/2024_LINK%20LKTWIII%2030Sep2024_Audit.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Audited', file_size: null, sort_order: 6, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 22, report_type_id: 2, report_section_id: 3, title: 'Consolidated Financial Statements for the year ended 31 December 2023', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2023/2023_LINK%20LKT%2031%20Dec%202023_Audited.pdf', cover_image: null, data_type: 'Consolidated', audit_status: 'Audited', file_size: null, sort_order: 7, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 23, report_type_id: 2, report_section_id: 3, title: 'Interim Consolidation Financial Statements as of 30 September 2023', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2023/2023_LINK%20LKTWIII%2030Sep2023_Audited.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Audited', file_size: null, sort_order: 8, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 24, report_type_id: 2, report_section_id: 3, title: 'Interim Consolidation Financial Statements as of 30 June 2023', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2023/2023_LINK%20LKTWII%2030%20JUNE%202023%20%5Baudited%5D.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Audited', file_size: null, sort_order: 9, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 25, report_type_id: 2, report_section_id: 3, title: 'Interim Consolidated Financial Statements as of 31 March 2023', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2023/2023_LINK%20LKTWI%2031%20MARET%202023.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 10, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 26, report_type_id: 2, report_section_id: 4, title: 'Consolidated Financial Statements for the Years ended 31 December 2022', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2022/2022_LINK_LKT%2031Des2022.pdf', cover_image: null, data_type: 'Consolidated', audit_status: 'Audited', file_size: null, sort_order: 11, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 27, report_type_id: 2, report_section_id: 4, title: 'Interim Consolidated Financial Statements as of 30 September 2022', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2022/2022_LINK_LKTWIII_30_September.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 12, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 28, report_type_id: 2, report_section_id: 4, title: 'Interim Consolidated Financial Statements as of 30 June 2022', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2022/LINK%20LKTWII%2030%20Juni%202022.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 13, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 29, report_type_id: 2, report_section_id: 4, title: 'Interim Consolidated Financial Statements as of 31 March 2022', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2022/2022_LINK_LKTWI_31_Maret.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 14, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 30, report_type_id: 2, report_section_id: 5, title: 'Consolidated Financial Statements for the Years Ended 31 Desember 2021 (Audited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2021/Consolidated%20Financial%20Statements%20for%20the%20Years%20Ended%2031%20Desember%202021%20(Audited)/LINK%20LKT%2031%20Desember%202021.pdf', cover_image: null, data_type: 'Consolidated', audit_status: 'Audited', file_size: null, sort_order: 15, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 31, report_type_id: 2, report_section_id: 5, title: 'Interim Consolidated Financial Statements as of 30 September 2021', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2021/Interim%20Consolidated%20Financial%20Statements%20as%20of%2030%20September%202021/LINK%20LKTW3%2030%20September%202021.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 16, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 32, report_type_id: 2, report_section_id: 5, title: 'Interim Consolidated Financial Statements as of 30 June 2021', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2021/Interim%20Consolidated%20Financial%20Statements%20as%20of%2030%20June%202021/LINK_Lap%20Keu%20Interim%20(30%20Juni%2021)(Audited).pdf', cover_image: null, data_type: 'Interim', audit_status: 'Audited', file_size: null, sort_order: 17, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 33, report_type_id: 2, report_section_id: 5, title: 'Interim Consolidated Financial Statements as of 31 March 2021 (Unaudited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2021/Interim%20Consolidated%20Financial%20Statements%20as%20of%2031%20March%202021%20(Unaudited)/LINK%20LKTWI%2031%20Maret%202021.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 18, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 34, report_type_id: 2, report_section_id: 6, title: 'Consolidated Financial Statements for the Years Ended 31 December 2020 (Audited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2020/Consolidated%20Financial%20Statements%20for%20the%20Years%20Ended%2031%20December%202020%20(Audited)/LINK%20LKT%2031%20Desember%202020.pdf', cover_image: null, data_type: 'Consolidated', audit_status: 'Audited', file_size: null, sort_order: 19, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 35, report_type_id: 2, report_section_id: 6, title: 'Interim Consolidated Financial Statements as of 30 September 2020 (Unaudited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2020/Interim%20Consolidated%20Financial%20Statements%20as%20of%2030%20September%202020%20(Unaudited)/fa23054d9ccaf31b29fff905994a5ca9607d045a.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 20, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 36, report_type_id: 2, report_section_id: 6, title: 'Interim Consolidated Financial Statements as of 30 June 2020 (Unaudited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2020/Interim%20Consolidated%20Financial%20Statements%20as%20of%2030%20June%202020%20(Unaudited)/f0f9ccdb41a46256a448f4a6f2feb50068d07e30.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 21, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 37, report_type_id: 2, report_section_id: 6, title: 'Interim Consolidated Financial Statements as of 31 March 2020 (Unaudited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2020/Interim%20Consolidated%20Financial%20Statements%20as%20of%2031%20March%202020%20(Unaudited)/1cef282ae2e90e699c324fc4dab06568ca3123d7.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 22, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 38, report_type_id: 2, report_section_id: 7, title: 'Interim Consolidated Financial Statements as of 31 March 2019 (Unaudited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2019/%20Interim%20Consolidated%20Financial%20Statements%20as%20of%2031%20March%202019%20(Unaudited)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 23, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 39, report_type_id: 2, report_section_id: 7, title: 'Interim Consolidated Financial Statements as of 30 June 2019 (Unaudited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2019/%20Interim%20Consolidated%20Financial%20Statements%20as%20of%2030%20June%202019%20(Unaudited)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 24, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 40, report_type_id: 2, report_section_id: 7, title: 'Interim Consolidated Financial Statements as of 30 September 2019 (Unaudited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2019/%20Interim%20Consolidated%20Financial%20Statements%20as%20of%2030%20September%202019%20(Unaudited)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 25, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 41, report_type_id: 2, report_section_id: 7, title: 'Consolidated Financial Statements for the Years Ended 31 December 2019 (Audited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2019/Consolidated%20Financial%20Statements%20for%20the%20Years%20Ended%2031%20December%202019%20(Audited)%20.pdf', cover_image: null, data_type: 'Consolidated', audit_status: 'Audited', file_size: null, sort_order: 26, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 42, report_type_id: 2, report_section_id: 8, title: 'Interim Consolidated Financial Statements as of 31 March 2018 (Unaudited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2018/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2031%20Maret%202018%20(Tidak%20Diaudit)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 27, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 43, report_type_id: 2, report_section_id: 8, title: 'Interim Consolidated Financial Statements as of 30 June 2018 (Unaudited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2018/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20Juni%202018%20(Tidak%20Diaudit)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 28, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 44, report_type_id: 2, report_section_id: 8, title: 'Interim Consolidated Financial Statements as of 30 September 2018 (Unaudited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2018/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20September%202018%20(Tidak%20Diaudit)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 29, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 45, report_type_id: 2, report_section_id: 8, title: 'Consolidated Financial Statements For the Years Ended 31 December 2018 (Audited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2018/Laporan%20Keuangan%20Konsolidasian%20Untuk%20Tahun-tahun%20yang%20Berakhir%20Pada%20Tanggal%2031%20Desember%202018%20(Diaudit)%20.pdf', cover_image: null, data_type: 'Consolidated', audit_status: 'Audited', file_size: null, sort_order: 30, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 46, report_type_id: 2, report_section_id: 9, title: 'Interim Consolidated Financial Statements as of 31 March 2017 (Unaudited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2017/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2031%20Maret%202017%20(Tidak%20Diaudit)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 31, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 47, report_type_id: 2, report_section_id: 9, title: 'Interim Consolidated Financial Statements as of 30 June 2017 (Unaudited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2017/Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20Juni%202017%20(Tidak%20Diaudit)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 32, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 48, report_type_id: 2, report_section_id: 9, title: 'Interim Consolidated Financial Statements as of 30 September 2017 (Unaudited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2017/Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20September%202017%20(Tidak%20Diaudit)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 33, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 49, report_type_id: 2, report_section_id: 9, title: 'Consolidated Financial Statements For the Years Ended 31 December 2017 (Audited)', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2017/Laporan%20Keuangan%20Konsolidasian%20Untuk%20Tahun-tahun%20yang%20Berakhir%20Pada%20Tanggal%2031%20Desember%202017%20(Diaudit)%20.pdf', cover_image: null, data_type: 'Consolidated', audit_status: 'Audited', file_size: null, sort_order: 34, is_active: true, created_at: '2025-10-21 17:05:50', updated_at: '2025-10-21 17:05:50' },
  { id: 50, report_type_id: 2, report_section_id: 10, title: 'Interim Consolidated Financial Statements as of 31 March 2016', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2016/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2031%20Maret%202016%20(Tidak%20Diaudit)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 35, is_active: true, created_at: '2025-10-21 17:06:49', updated_at: '2025-10-21 17:06:49' },
  { id: 51, report_type_id: 2, report_section_id: 10, title: 'Interim Consolidated Financial Statements as of 30 June 2016', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2016/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20Juni%202016%20(Tidak%20Diaudit)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 36, is_active: true, created_at: '2025-10-21 17:06:49', updated_at: '2025-10-21 17:06:49' },
  { id: 52, report_type_id: 2, report_section_id: 10, title: 'Interim Consolidated Financial Statements as of 30 September 2016', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2016/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20September%202016%20(Tidak%20Diaudit)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 37, is_active: true, created_at: '2025-10-21 17:06:49', updated_at: '2025-10-21 17:06:49' },
  { id: 53, report_type_id: 2, report_section_id: 10, title: 'Consolidated Financial Statements For the Years Ended 31 December 2016', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2016/Laporan%20Keuangan%20Konsolidasian%20Untuk%20Tahun-tahun%20yang%20Berakhir%20Pada%20Tanggal%2031%20Desember%202016%20(Diaudit)%20.pdf', cover_image: null, data_type: 'Consolidated', audit_status: 'Audited', file_size: null, sort_order: 38, is_active: true, created_at: '2025-10-21 17:06:49', updated_at: '2025-10-21 17:06:49' },
  { id: 54, report_type_id: 2, report_section_id: 11, title: 'Interim Consolidated Financial Statements as of 31 March 2015', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2015/Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2031%20Maret%202015%20(Tidak%20Diaudit)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 39, is_active: true, created_at: '2025-10-21 17:06:49', updated_at: '2025-10-21 17:06:49' },
  { id: 55, report_type_id: 2, report_section_id: 11, title: 'Interim Consolidated Financial Statements as of 30 June 2015', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2015/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20Juni%202015%20(Tidak%20Diaudit)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 40, is_active: true, created_at: '2025-10-21 17:06:49', updated_at: '2025-10-21 17:06:49' },
  { id: 56, report_type_id: 2, report_section_id: 11, title: 'Interim Consolidated Financial Statements as of 30 September 2015', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2015/%20Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20September%202015%20(Tidak%20Diaudit)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 41, is_active: true, created_at: '2025-10-21 17:06:49', updated_at: '2025-10-21 17:06:49' },
  { id: 57, report_type_id: 2, report_section_id: 11, title: 'Consolidated Financial Statements For the Years Ended 31 December 2015', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2015/Laporan%20Keuangan%20Konsolidasian%20Untuk%20Tahun-tahun%20yang%20Berakhir%20Pada%20Tanggal%2031%20Desember%202015%20(Diaudit)%20.pdf', cover_image: null, data_type: 'Consolidated', audit_status: 'Audited', file_size: null, sort_order: 42, is_active: true, created_at: '2025-10-21 17:06:49', updated_at: '2025-10-21 17:06:49' },
  { id: 58, report_type_id: 2, report_section_id: 12, title: 'Interim Consolidated Financial Statements as of 30 June 2014', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2014/Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20Juni%202014%20(Diaudit)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Audited', file_size: null, sort_order: 43, is_active: true, created_at: '2025-10-21 17:06:49', updated_at: '2025-10-21 17:06:49' },
  { id: 59, report_type_id: 2, report_section_id: 12, title: 'Interim Consolidated Financial Statements as of 30 September 2014', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2014/Laporan%20Keuangan%20Konsolidasian%20Interim%20Pada%20Tanggal%2030%20September%202014%20(Tidak%20Diaudit)%20.pdf', cover_image: null, data_type: 'Interim', audit_status: 'Unaudited', file_size: null, sort_order: 44, is_active: true, created_at: '2025-10-21 17:06:49', updated_at: '2025-10-21 17:06:49' },
  { id: 60, report_type_id: 2, report_section_id: 12, title: 'Consolidated Financial Statements For the Years Ended 31 December 2014', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/id/2014/Laporan%20Keuangan%20Konsolidasian%20Untuk%20Tahun-tahun%20yang%20Berakhir%20Pada%20Tanggal%2031%20Desember%202014%20(Diaudit)%20.pdf', cover_image: null, data_type: 'Consolidated', audit_status: 'Audited', file_size: null, sort_order: 45, is_active: true, created_at: '2025-10-21 17:06:49', updated_at: '2025-10-21 17:06:49' },
  // Items 61-62: report_type_id is NULL, section_id=1 (Financial Statements 2025)
  { id: 61, report_type_id: null, report_section_id: 1, title: 'Interim Consolidated Financial Statements as of 30 September 2025', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2025/LINK LKTWIII 30 SEPTEMBER 2025 [Audited].pdf', cover_image: null, data_type: null, audit_status: 'Audited', file_size: null, sort_order: 2, is_active: true, created_at: '2025-12-29 09:04:41', updated_at: '2026-02-16 08:26:01' },
  { id: 62, report_type_id: null, report_section_id: 1, title: 'Consolidated Financial Statements for the year ended 31 December 2025', sub_description: null, pdf_file: 'https://www.linknet.co.id/storage/files/document/announcement/financial/en/2025/LINK_LKFS Audited 31 December 2025.pdf', cover_image: null, data_type: 'Consolidated', audit_status: 'Audited', file_size: null, sort_order: 1, is_active: true, created_at: '2026-02-16 07:15:16', updated_at: '2026-02-16 08:26:01' },
];

// ============================================
// ID MAPPING (old bigint → new UUID)
// ============================================

// Pre-generate stable UUIDs for types & sections so items can reference them
const typeIdMap = {};   // old_id → new_uuid
const sectionIdMap = {}; // old_id → new_uuid

// ============================================
// MAIN MIGRATION
// ============================================

async function main() {
  console.log('==========================================');
  console.log('Report Data Migration: MySQL → PostgreSQL');
  console.log('==========================================\n');

  // Step 0: Clear existing test data (reports first due to FK, then sections, then types)
  console.log('[Step 0] Clearing existing test/report data...');
  const delReports = await prisma.reports.deleteMany({});
  const delSections = await prisma.reportSection.deleteMany({});
  const delTypes = await prisma.reportType.deleteMany({});
  console.log(`  Deleted: ${delReports.count} reports, ${delSections.count} sections, ${delTypes.count} types\n`);

  // Step 1: Create Report Types
  console.log('[Step 1] Creating Report Types...');
  for (const oldType of OLD_REPORT_TYPES) {
    const newId = uuidv4();
    typeIdMap[oldType.id] = newId;

    const slug = slugify(oldType.name, { lower: true, strict: true });
    await prisma.reportType.create({
      data: {
        id: newId,
        name: oldType.name,
        slug,
        description: `Type: ${oldType.type}`,
        position: oldType.sort_order,
        isActive: oldType.is_active,
        createdAt: new Date(oldType.created_at),
        updatedAt: new Date(oldType.updated_at),
      },
    });
    console.log(`  ✓ Type: "${oldType.name}" (old:${oldType.id} → new:${newId})`);
  }
  console.log(`  Created ${OLD_REPORT_TYPES.length} types\n`);

  // Step 2: Create Report Sections
  console.log('[Step 2] Creating Report Sections...');
  for (const oldSection of OLD_REPORT_SECTIONS) {
    const newId = uuidv4();
    sectionIdMap[oldSection.id] = newId;

    const newTypeId = typeIdMap[oldSection.report_type_id];
    if (!newTypeId) {
      console.log(`  ⚠ Skipping section "${oldSection.title}" - no matching type for old id ${oldSection.report_type_id}`);
      continue;
    }

    const slug = slugify(oldSection.title, { lower: true, strict: true });
    await prisma.reportSection.create({
      data: {
        id: newId,
        type_id: newTypeId,
        name: oldSection.title,
        slug,
        description: oldSection.report_year ? `Year ${oldSection.report_year}` : null,
        position: oldSection.sort_order,
        isActive: oldSection.is_active,
        createdAt: new Date(oldSection.created_at),
        updatedAt: new Date(oldSection.updated_at),
      },
    });
    console.log(`  ✓ Section: "${oldSection.title}" (old:${oldSection.id} → new:${newId})`);
  }
  console.log(`  Created ${OLD_REPORT_SECTIONS.length} sections\n`);

  // Step 3: Create Report Items
  console.log('[Step 3] Creating Report Items...');
  let successCount = 0;
  let skipCount = 0;

  for (const oldItem of OLD_REPORT_ITEMS) {
    const newId = uuidv4();
    
    // Map type_id
    let newTypeId = null;
    if (oldItem.report_type_id) {
      newTypeId = typeIdMap[oldItem.report_type_id];
    }

    // Map section_id
    let newSectionId = null;
    if (oldItem.report_section_id) {
      newSectionId = sectionIdMap[oldItem.report_section_id];
    }

    // For items with section but no type (items 61-62), derive type from section
    if (!newTypeId && newSectionId) {
      // Section belongs to Financial Statement (type_id=2)
      const section = OLD_REPORT_SECTIONS.find(s => s.id === oldItem.report_section_id);
      if (section) {
        newTypeId = typeIdMap[section.report_type_id];
      }
    }

    // Validate: must have either type or section
    if (!newTypeId && !newSectionId) {
      console.log(`  ⚠ Skipping item "${oldItem.title}" (id:${oldItem.id}) - no valid type or section reference`);
      skipCount++;
      continue;
    }

    const slug = slugify(oldItem.title + (oldItem.sub_description ? '-' + oldItem.sub_description : ''), {
      lower: true,
      strict: true,
    });

    await prisma.reports.create({
      data: {
        id: newId,
        type_id: newTypeId,
        section_id: newSectionId,
        title: oldItem.title,
        slug,
        description: oldItem.sub_description || null,
        pdf_file: oldItem.pdf_file || null,
        cover_image: oldItem.cover_image || null,
        data_type: oldItem.data_type || null,
        audit_status: oldItem.audit_status || null,
        file_size: oldItem.file_size || null,
        sort_order: oldItem.sort_order,
        is_active: oldItem.is_active,
        status: 'PUBLISHED',
        created_at: new Date(oldItem.created_at),
        updated_at: new Date(oldItem.updated_at),
      },
    });
    successCount++;
  }
  console.log(`  Created ${successCount} items, skipped ${skipCount}\n`);

  // Step 4: Verification
  console.log('[Step 4] Verification...');
  const finalTypes = await prisma.reportType.count();
  const finalSections = await prisma.reportSection.count();
  const finalReports = await prisma.reports.count();
  console.log(`  Types: ${finalTypes} (expected: ${OLD_REPORT_TYPES.length})`);
  console.log(`  Sections: ${finalSections} (expected: ${OLD_REPORT_SECTIONS.length})`);
  console.log(`  Reports: ${finalReports} (expected: ${OLD_REPORT_ITEMS.length})`);

  // Show breakdown by type
  const types = await prisma.reportType.findMany({
    include: {
      _count: { select: { reports: true, report_sections: true } },
    },
    orderBy: { position: 'asc' },
  });
  console.log('\n  Breakdown:');
  for (const t of types) {
    console.log(`    ${t.name}: ${t._count.reports} direct items, ${t._count.report_sections} sections`);
  }

  console.log('\n==========================================');
  console.log('Migration completed successfully!');
  console.log('==========================================');
}

main()
  .catch((e) => {
    console.error('\n❌ Migration failed:', e.message);
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
