/**
 * Migration Script: MySQL → PostgreSQL
 * Migrates `pages` and `page_components` data from MySQL backup to PostgreSQL
 * 
 * Mapping:
 *   - MySQL id (integer) → UUID (generated deterministically from old id)
 *   - status 'draft'/'published' → 'DRAFT'/'PUBLISHED'
 *   - meta_thumbnail → og_image
 *   - sort_order → order (column name)
 *   - is_visible tinyint → boolean
 *   - createdById → existing admin user
 *   - template → 'DEFAULT'
 *   - seo_settings → dropped (no equivalent column)
 *   - Components for page_ids without matching pages are skipped
 *
 * Idempotent: uses ON CONFLICT (slug) DO NOTHING for pages,
 *             and checks existing data before inserting components.
 */

const { PrismaClient } = require('@prisma/client');
const { v5: uuidv5 } = require('uuid');

const prisma = new PrismaClient();

// Namespace for deterministic UUID generation (using URL namespace as base)
const NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

// Generate deterministic UUID from old MySQL integer ID + table prefix
function genUUID(prefix, oldId) {
  return uuidv5(`${prefix}-${oldId}`, NAMESPACE);
}

// Admin user to assign as creator
const ADMIN_USER_ID = '78ab53fb-7610-4ae7-9b58-c62347ca7b5c';

// ============================================================
// PAGES DATA (from MySQL backup)
// ============================================================
const PAGES_DATA = [
  { id: 1, title: 'Homepage', slug: 'homepage', meta_title: 'PT Link Net Tbk - We LINK the nation for better lives', meta_description: 'PT Link Net Tbk is an established provider of cable television and high speed broadband internet services in Indonesia operating the high tech Hybrid Fiber Coaxial', meta_keywords: 'linknet, internet, isp, cable, broadband, hfc, indonesia', meta_thumbnail: null, status: 'published', created_at: '2025-10-03 23:37:36', updated_at: '2025-11-30 08:10:23' },
  { id: 6, title: 'Media', slug: 'news', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-12 21:04:28', updated_at: '2025-10-17 02:13:25' },
  { id: 7, title: 'Life at Linknet', slug: 'life-at-linknet', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-12 21:09:49', updated_at: '2025-10-14 08:50:04' },
  { id: 8, title: 'Awards', slug: 'about/awards', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: 'Awards Meta Images/Thumbnail', status: 'published', created_at: '2025-10-13 19:32:39', updated_at: '2025-10-14 09:29:36' },
  { id: 9, title: 'Management', slug: 'about/management', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: 'Management Meta Images/Thumbnail', status: 'published', created_at: '2025-10-13 19:56:23', updated_at: '2025-10-14 09:28:47' },
  { id: 10, title: 'Corporate Information', slug: 'about/corporate-information', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-13 23:16:05', updated_at: '2025-10-14 01:54:32' },
  { id: 11, title: 'Sustainability', slug: 'sustainability', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-13 23:28:19', updated_at: '2025-10-13 23:28:19' },
  { id: 12, title: 'Corporate Overview', slug: 'about/corporate-overview', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-14 02:43:06', updated_at: '2025-10-14 02:43:06' },
  { id: 13, title: 'Milestone', slug: 'about/milestone', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-14 03:15:07', updated_at: '2025-10-14 03:15:07' },
  { id: 14, title: 'Organization Structure', slug: 'corporate-governance/structure', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-14 03:18:34', updated_at: '2025-11-25 16:19:30' },
  { id: 15, title: 'Principle', slug: 'corporate-governance/principle', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-14 19:42:39', updated_at: '2025-10-14 19:51:40' },
  { id: 16, title: 'Corporate Governance Guidance', slug: 'corporate-governance/guidance', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-14 21:53:40', updated_at: '2025-10-14 21:53:40' },
  { id: 17, title: 'Article Of Association', slug: 'corporate-governance/association', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-14 21:54:10', updated_at: '2025-10-14 21:54:10' },
  { id: 18, title: 'Code of Conduct', slug: 'corporate-governance/code-of-conduct', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-14 21:54:39', updated_at: '2025-10-14 21:54:39' },
  { id: 20, title: 'Organization Structure', slug: 'corporate-governance/organization-structure', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-14 21:55:26', updated_at: '2025-10-14 21:55:26' },
  { id: 23, title: 'Whistleblowing System', slug: 'corporate-governance/whistleblowing-system', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-14 21:56:29', updated_at: '2025-10-14 21:56:29' },
  { id: 24, title: 'Whistleblowing Policy', slug: 'corporate-governance/whistleblowing-policy', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-14 21:56:45', updated_at: '2025-10-14 21:56:45' },
  { id: 29, title: 'Contact Us', slug: 'contact-us', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-18 23:47:04', updated_at: '2025-10-18 23:47:04' },
  { id: 30, title: 'GMS Announcement', slug: 'investor/gms-announcement', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-19 03:48:30', updated_at: '2025-10-19 03:48:30' },
  { id: 31, title: 'Public Expose Announcement', slug: 'investor/public-expose-announcement', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-19 04:53:15', updated_at: '2025-10-19 04:53:15' },
  { id: 32, title: 'Annual Report', slug: 'investor/annual-report', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-21 07:38:38', updated_at: '2025-10-21 07:39:53' },
  { id: 33, title: 'Emiten Announcement', slug: 'investor/emiten-announcement', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-21 09:22:20', updated_at: '2025-10-21 09:22:20' },
  { id: 34, title: 'Sustainable Report', slug: 'investor/sustainable-report', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-21 09:25:20', updated_at: '2025-10-21 09:25:20' },
  { id: 35, title: 'Financial Statement', slug: 'investor/financial-statement', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-21 09:30:55', updated_at: '2025-10-21 09:30:55' },
  { id: 36, title: 'Career list', slug: 'career', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-21 10:44:46', updated_at: '2025-10-21 10:44:46' },
  { id: 37, title: 'Data Privacy Policy', slug: 'corporate-governance/data-privacy-policy', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-21 10:58:00', updated_at: '2025-10-21 10:58:00' },
  { id: 38, title: 'Investor Relations', slug: 'investor-relations', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-26 20:41:10', updated_at: '2025-10-26 20:41:10' },
  { id: 39, title: 'Linknet Enterprise', slug: 'business/linknet-enterprise', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-26 20:58:40', updated_at: '2025-10-26 20:58:40' },
  { id: 40, title: 'Linknet Fiber', slug: 'business/linknet-fiber', meta_title: 'Linknet Fiber', meta_description: 'LinkNet Fiber sebagai penyedia serat optik terkemuka, menjunjung tinggi komitmen terhadap keandalan, kecepatan, dan inovasi dalam telekomunikasi.', meta_keywords: 'Fiber, Fiber Optik, Linknet, PT Link Net Tbk', meta_thumbnail: null, status: 'published', created_at: '2025-10-26 22:50:55', updated_at: '2025-11-30 16:53:19' },
  { id: 41, title: 'Linknet Media', slug: 'business/linknet-media', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-10-26 22:51:41', updated_at: '2025-10-27 09:03:26' },
  { id: 42, title: 'Summary of Standardization', slug: 'corporate-governance/summary-of-standardization', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-11-25 16:24:52', updated_at: '2025-11-25 16:24:52' },
  { id: 43, title: 'Linknet Policy', slug: 'corporate-governance/linknet-policy', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-11-25 16:30:21', updated_at: '2025-11-25 16:30:21' },
  { id: 44, title: 'Board & Committee Charters', slug: 'corporate-governance/board-committee-charters', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-11-25 16:34:43', updated_at: '2025-11-27 07:10:44' },
  { id: 45, title: 'Group Structures', slug: 'about/group-structures', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-11-26 01:51:28', updated_at: '2025-11-26 01:51:28' },
  { id: 47, title: 'Anti Bribery and Anti Corruption Policy', slug: 'corporate-governance/anti-bribery-and-corruption-policy', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-12-04 01:04:00', updated_at: '2025-12-04 01:06:00' },
  { id: 48, title: 'GIFTS, DONATIONS & SPONSORSHIPS POLICY', slug: 'corporate-governance/gifts-donations-sponsorships-policy', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-12-04 01:14:25', updated_at: '2025-12-04 01:14:25' },
  { id: 49, title: 'Anti Bribery and Anti Corruption Clause', slug: 'corporate-governance/anti-bribery-and-anti-corruption-clause', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-12-04 01:34:36', updated_at: '2025-12-04 01:36:14' },
  { id: 50, title: 'FAQ (Dummy)', slug: 'faq-dummy', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-12-10 07:49:46', updated_at: '2025-12-10 08:10:02' },
  { id: 54, title: 'GIFTS, DONATIONS & SPONSORSHIPS CLAUSE', slug: 'corporate-governance/anti-bribery-and-corruption-clause', meta_title: null, meta_description: null, meta_keywords: null, meta_thumbnail: null, status: 'published', created_at: '2025-12-19 09:08:36', updated_at: '2025-12-19 09:13:15' },
];

// Build set of valid page IDs for filtering orphaned components
const validPageIds = new Set(PAGES_DATA.map(p => p.id));

// ============================================================
// PAGE COMPONENTS DATA (from MySQL backup)
// Only include components whose page_id exists in PAGES_DATA
// ============================================================
const COMPONENTS_DATA = [
  { id: 72, page_id: 1, component_type: 'news_highlight', sort_order: 7, is_visible: 1, created_at: '2025-10-08 06:19:11', updated_at: '2025-12-19 09:43:20' },
  { id: 77, page_id: 1, component_type: 'business_tab', sort_order: 4, is_visible: 1, created_at: '2025-10-09 02:16:21', updated_at: '2025-12-19 09:22:54' },
  { id: 78, page_id: 1, component_type: 'interactive_maps', sort_order: 6, is_visible: 1, created_at: '2025-10-09 19:26:47', updated_at: '2025-12-19 09:25:29' },
  { id: 111, page_id: 1, component_type: 'sliders_hero', sort_order: 1, is_visible: 1, created_at: '2025-10-12 19:14:21', updated_at: '2025-12-08 17:40:38' },
  { id: 112, page_id: 1, component_type: 'usp_grid', sort_order: 2, is_visible: 1, created_at: '2025-10-12 19:30:11', updated_at: '2026-01-21 04:35:49' },
  { id: 114, page_id: 7, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-12 21:47:38', updated_at: '2025-11-29 01:04:19' },
  { id: 115, page_id: 7, component_type: 'about_with_marquee', sort_order: 2, is_visible: 1, created_at: '2025-10-12 21:49:24', updated_at: '2025-11-29 01:05:37' },
  { id: 116, page_id: 7, component_type: 'join_first_squad', sort_order: 3, is_visible: 1, created_at: '2025-10-12 23:43:47', updated_at: '2025-11-29 01:07:52' },
  { id: 117, page_id: 7, component_type: 'career_highlight', sort_order: 4, is_visible: 1, created_at: '2025-10-13 00:25:19', updated_at: '2025-11-29 01:08:18' },
  { id: 118, page_id: 8, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-13 19:36:35', updated_at: '2025-11-26 08:10:04' },
  { id: 119, page_id: 8, component_type: 'awards_list', sort_order: 2, is_visible: 1, created_at: '2025-10-13 19:54:11', updated_at: '2025-10-13 19:54:11' },
  { id: 120, page_id: 9, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-13 19:57:54', updated_at: '2025-11-26 08:09:42' },
  { id: 122, page_id: 6, component_type: 'news_highlight', sort_order: 1, is_visible: 1, created_at: '2025-10-13 20:39:54', updated_at: '2025-12-19 09:45:54' },
  { id: 123, page_id: 6, component_type: 'news_list', sort_order: 2, is_visible: 1, created_at: '2025-10-13 21:05:12', updated_at: '2025-12-18 15:54:51' },
  { id: 125, page_id: 11, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-13 23:32:29', updated_at: '2025-12-22 07:13:08' },
  { id: 126, page_id: 11, component_type: 'usp_grid', sort_order: 2, is_visible: 1, created_at: '2025-10-13 23:37:47', updated_at: '2025-12-22 07:12:55' },
  { id: 127, page_id: 11, component_type: 'key_highlight', sort_order: 3, is_visible: 1, created_at: '2025-10-13 23:51:09', updated_at: '2025-11-29 03:19:32' },
  { id: 128, page_id: 11, component_type: 'card_with_highlight_summary', sort_order: 4, is_visible: 1, created_at: '2025-10-13 23:52:36', updated_at: '2025-12-12 07:36:57' },
  { id: 129, page_id: 11, component_type: 'highlighting_real_initiatives', sort_order: 5, is_visible: 1, created_at: '2025-10-13 23:53:11', updated_at: '2025-12-19 09:27:47' },
  { id: 132, page_id: 10, component_type: 'information_list', sort_order: 2, is_visible: 1, created_at: '2025-10-14 00:49:00', updated_at: '2026-01-27 06:59:17' },
  { id: 133, page_id: 10, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-14 02:04:54', updated_at: '2025-11-26 07:38:20' },
  { id: 134, page_id: 12, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-14 02:43:14', updated_at: '2025-11-26 08:08:28' },
  { id: 135, page_id: 12, component_type: 'usp_grid', sort_order: 2, is_visible: 1, created_at: '2025-10-14 02:44:31', updated_at: '2026-02-24 05:27:17' },
  { id: 136, page_id: 12, component_type: 'information_list', sort_order: 3, is_visible: 1, created_at: '2025-10-14 02:44:50', updated_at: '2026-02-24 05:19:05' },
  { id: 138, page_id: 13, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-14 03:15:28', updated_at: '2025-10-14 03:16:09' },
  { id: 139, page_id: 13, component_type: 'information_list', sort_order: 2, is_visible: 1, created_at: '2025-10-14 03:16:09', updated_at: '2025-11-26 09:30:41' },
  { id: 140, page_id: 14, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-14 03:18:43', updated_at: '2025-11-26 08:11:45' },
  { id: 145, page_id: 15, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-14 19:43:01', updated_at: '2025-11-26 08:12:28' },
  { id: 147, page_id: 15, component_type: 'ckeditor', sort_order: 2, is_visible: 1, created_at: '2025-10-14 19:51:49', updated_at: '2025-11-26 10:04:53' },
  { id: 148, page_id: 16, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-14 12:43:01', updated_at: '2025-11-26 08:13:10' },
  { id: 149, page_id: 16, component_type: 'ckeditor', sort_order: 2, is_visible: 1, created_at: '2025-10-14 12:51:49', updated_at: '2025-11-28 02:55:35' },
  { id: 150, page_id: 17, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-14 12:43:01', updated_at: '2025-11-26 08:13:44' },
  { id: 151, page_id: 17, component_type: 'ckeditor', sort_order: 2, is_visible: 1, created_at: '2025-10-14 12:51:49', updated_at: '2025-11-27 07:35:54' },
  { id: 152, page_id: 18, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-14 12:43:01', updated_at: '2025-11-26 08:14:10' },
  { id: 153, page_id: 18, component_type: 'ckeditor', sort_order: 2, is_visible: 1, created_at: '2025-10-14 12:51:49', updated_at: '2025-11-28 02:56:58' },
  { id: 155, page_id: 20, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-14 12:43:01', updated_at: '2025-11-26 08:15:22' },
  { id: 158, page_id: 23, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-14 12:43:01', updated_at: '2025-11-27 08:00:58' },
  { id: 159, page_id: 24, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-14 12:43:01', updated_at: '2025-12-04 01:08:52' },
  { id: 164, page_id: 23, component_type: 'ckeditor', sort_order: 2, is_visible: 1, created_at: '2025-10-14 12:51:49', updated_at: '2025-12-16 01:34:36' },
  { id: 165, page_id: 24, component_type: 'ckeditor', sort_order: 2, is_visible: 1, created_at: '2025-10-14 12:51:49', updated_at: '2025-12-16 01:30:16' },
  { id: 167, page_id: 20, component_type: 'image', sort_order: 2, is_visible: 1, created_at: '2025-10-14 22:36:31', updated_at: '2025-10-14 22:36:52' },
  { id: 176, page_id: 29, component_type: 'contact_us', sort_order: 1, is_visible: 1, created_at: '2025-10-19 00:05:16', updated_at: '2025-10-19 00:05:17' },
  { id: 180, page_id: 31, component_type: 'announcement_list', sort_order: 2, is_visible: 1, created_at: '2025-10-19 04:53:41', updated_at: '2025-12-03 11:51:14' },
  { id: 181, page_id: 1, component_type: 'usp_grid_slider', sort_order: 3, is_visible: 0, created_at: '2025-10-19 07:51:56', updated_at: '2025-12-05 04:07:19' },
  { id: 183, page_id: 9, component_type: 'management_list', sort_order: 2, is_visible: 1, created_at: '2025-10-20 20:45:28', updated_at: '2025-10-20 20:45:29' },
  { id: 184, page_id: 30, component_type: 'announcement_list', sort_order: 2, is_visible: 1, created_at: '2025-10-20 23:57:41', updated_at: '2025-10-21 09:19:09' },
  { id: 185, page_id: 32, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-21 07:38:45', updated_at: '2025-11-26 10:25:00' },
  { id: 188, page_id: 32, component_type: 'report_list', sort_order: 2, is_visible: 1, created_at: '2025-10-21 07:51:37', updated_at: '2025-10-21 07:51:48' },
  { id: 189, page_id: 30, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-21 09:19:08', updated_at: '2025-11-29 10:30:25' },
  { id: 190, page_id: 31, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-21 09:20:53', updated_at: '2025-11-26 11:40:42' },
  { id: 191, page_id: 33, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-21 09:22:30', updated_at: '2025-12-09 04:03:46' },
  { id: 192, page_id: 33, component_type: 'announcement_list', sort_order: 2, is_visible: 1, created_at: '2025-10-21 09:22:42', updated_at: '2025-12-09 04:03:46' },
  { id: 193, page_id: 34, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-21 09:25:26', updated_at: '2025-12-19 07:34:22' },
  { id: 194, page_id: 34, component_type: 'report_list', sort_order: 2, is_visible: 1, created_at: '2025-10-21 09:25:34', updated_at: '2025-10-21 09:25:43' },
  { id: 195, page_id: 35, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-21 09:31:01', updated_at: '2025-11-26 10:23:10' },
  { id: 196, page_id: 35, component_type: 'report_list', sort_order: 2, is_visible: 1, created_at: '2025-10-21 09:31:09', updated_at: '2025-10-21 10:07:09' },
  { id: 197, page_id: 36, component_type: 'career_list', sort_order: 1, is_visible: 1, created_at: '2025-10-21 10:45:23', updated_at: '2025-11-28 18:08:07' },
  { id: 198, page_id: 37, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-21 10:58:53', updated_at: '2025-10-21 10:59:42' },
  { id: 199, page_id: 37, component_type: 'ckeditor', sort_order: 2, is_visible: 1, created_at: '2025-10-21 10:59:42', updated_at: '2025-11-27 08:12:29' },
  { id: 200, page_id: 38, component_type: 'tradingview_symbol_overview', sort_order: 1, is_visible: 1, created_at: '2025-10-26 20:41:28', updated_at: '2025-10-26 20:41:31' },
  { id: 201, page_id: 39, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-26 21:02:23', updated_at: '2025-11-26 09:46:11' },
  { id: 202, page_id: 39, component_type: 'usp_grid', sort_order: 2, is_visible: 1, created_at: '2025-10-26 21:06:29', updated_at: '2025-11-26 09:52:11' },
  { id: 203, page_id: 39, component_type: 'list_services', sort_order: 3, is_visible: 1, created_at: '2025-10-26 21:21:32', updated_at: '2025-10-26 21:59:36' },
  { id: 205, page_id: 39, component_type: 'info_contacts', sort_order: 4, is_visible: 1, created_at: '2025-10-26 21:55:12', updated_at: '2025-11-26 04:28:00' },
  { id: 206, page_id: 40, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-26 14:02:23', updated_at: '2025-11-30 16:55:27' },
  { id: 207, page_id: 40, component_type: 'usp_grid', sort_order: 2, is_visible: 1, created_at: '2025-10-26 14:06:29', updated_at: '2025-11-30 17:06:17' },
  { id: 208, page_id: 40, component_type: 'list_services', sort_order: 3, is_visible: 1, created_at: '2025-10-26 14:21:32', updated_at: '2026-01-14 07:37:09' },
  { id: 209, page_id: 40, component_type: 'info_contacts', sort_order: 4, is_visible: 1, created_at: '2025-10-26 14:55:12', updated_at: '2026-01-14 07:39:27' },
  { id: 210, page_id: 41, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-10-26 14:02:23', updated_at: '2025-11-30 07:48:06' },
  { id: 211, page_id: 41, component_type: 'usp_grid', sort_order: 2, is_visible: 1, created_at: '2025-10-26 14:06:29', updated_at: '2025-11-26 09:55:36' },
  { id: 212, page_id: 41, component_type: 'list_services', sort_order: 3, is_visible: 1, created_at: '2025-10-26 14:21:32', updated_at: '2026-01-14 07:41:19' },
  { id: 213, page_id: 41, component_type: 'info_contacts', sort_order: 4, is_visible: 1, created_at: '2025-10-26 14:55:12', updated_at: '2026-01-19 01:42:59' },
  { id: 214, page_id: 14, component_type: 'information_list', sort_order: 2, is_visible: 1, created_at: '2025-11-25 16:19:48', updated_at: '2025-12-04 00:54:21' },
  { id: 215, page_id: 42, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-11-25 16:25:01', updated_at: '2025-12-19 10:57:50' },
  { id: 216, page_id: 42, component_type: 'information_list', sort_order: 2, is_visible: 1, created_at: '2025-11-25 16:25:10', updated_at: '2025-12-19 07:34:57' },
  { id: 217, page_id: 43, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-11-25 16:30:26', updated_at: '2025-11-26 08:15:52' },
  { id: 218, page_id: 43, component_type: 'information_list', sort_order: 2, is_visible: 1, created_at: '2025-11-25 16:31:18', updated_at: '2025-12-19 08:06:28' },
  { id: 219, page_id: 44, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-11-25 16:34:50', updated_at: '2025-11-27 06:58:13' },
  { id: 222, page_id: 45, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-11-26 01:51:36', updated_at: '2025-11-29 12:21:40' },
  { id: 223, page_id: 45, component_type: 'image', sort_order: 2, is_visible: 1, created_at: '2025-11-26 01:51:39', updated_at: '2025-11-26 01:52:36' },
  { id: 224, page_id: 44, component_type: 'document_list', sort_order: 2, is_visible: 1, created_at: '2025-11-27 06:58:13', updated_at: '2026-01-09 01:07:25' },
  { id: 225, page_id: 47, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-12-04 01:04:25', updated_at: '2025-12-04 01:16:53' },
  { id: 226, page_id: 47, component_type: 'ckeditor', sort_order: 2, is_visible: 1, created_at: '2025-12-04 01:04:35', updated_at: '2025-12-04 01:28:12' },
  { id: 227, page_id: 48, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-12-04 01:14:35', updated_at: '2025-12-04 01:17:49' },
  { id: 228, page_id: 48, component_type: 'ckeditor', sort_order: 2, is_visible: 1, created_at: '2025-12-04 01:14:42', updated_at: '2025-12-04 01:29:14' },
  { id: 229, page_id: 49, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-12-04 01:34:49', updated_at: '2025-12-04 01:39:25' },
  { id: 230, page_id: 49, component_type: 'ckeditor', sort_order: 2, is_visible: 1, created_at: '2025-12-04 01:35:02', updated_at: '2025-12-04 01:38:50' },
  { id: 234, page_id: 50, component_type: 'accordion', sort_order: 1, is_visible: 1, created_at: '2025-12-10 08:10:14', updated_at: '2025-12-10 08:10:14' },
  { id: 239, page_id: 54, component_type: 'hero_section', sort_order: 1, is_visible: 1, created_at: '2025-12-04 08:14:35', updated_at: '2026-01-12 09:23:29' },
  { id: 240, page_id: 54, component_type: 'ckeditor', sort_order: 2, is_visible: 1, created_at: '2025-12-04 08:14:42', updated_at: '2026-01-12 09:23:59' },
];

// ============================================================
// COMPONENT DATA JSON (extracted from MySQL backup)
// Key: old MySQL component id → JSON data
// ============================================================
const COMPONENT_DATA_MAP = {};

async function loadComponentDataFromSQL() {
  // We'll read and parse the SQL file to extract component_data
  const fs = require('fs');
  const path = require('path');
  const sqlFile = path.join(__dirname, '..', 'daftar_pages_lengkap.sql');
  const content = fs.readFileSync(sqlFile, 'utf8');
  
  // Parse all INSERT lines for page_components
  // Each row: (id, page_id, 'component_type', 'json_data', sort_order, is_visible, 'created_at', 'updated_at')
  const regex = /\((\d+),\s*(\d+),\s*'([^']+)',\s*'((?:[^'\\]|\\.)*)'\s*,\s*(\d+),\s*(\d+),\s*'([^']+)',\s*'([^']+)'\)/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    const compId = parseInt(match[1]);
    const rawJson = match[4];
    
    // Unescape MySQL string escaping
    let unescaped = rawJson
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t');
    
    // Remove control characters that break JSON parsing
    unescaped = unescaped.replace(/[\x00-\x1F\x7F]/g, (ch) => {
      if (ch === '\n' || ch === '\r' || ch === '\t') return ch;
      return '';
    });
    
    try {
      const parsed = JSON.parse(unescaped);
      COMPONENT_DATA_MAP[compId] = parsed;
    } catch (e) {
      console.warn(`⚠ Failed to parse JSON for component id=${compId}: ${e.message}`);
      // Store as raw string fallback
      COMPONENT_DATA_MAP[compId] = { _raw: unescaped, _parseError: e.message };
    }
  }
  
  console.log(`✓ Parsed ${Object.keys(COMPONENT_DATA_MAP).length} component data entries from SQL`);
}

async function migrate() {
  console.log('=== MySQL → PostgreSQL Migration: Pages & Components ===\n');
  
  // Step 0: Load component data from SQL file
  await loadComponentDataFromSQL();
  
  // Step 1: Check if tables already have data (idempotency)
  const existingPages = await prisma.page.count();
  const existingComponents = await prisma.pageComponent.count();
  console.log(`Current state: ${existingPages} pages, ${existingComponents} components\n`);
  
  if (existingPages > 0) {
    console.log('⚠ Pages table already has data. Checking for slug conflicts...');
    const existingSlugs = await prisma.page.findMany({ select: { slug: true } });
    const slugSet = new Set(existingSlugs.map(p => p.slug));
    const newPages = PAGES_DATA.filter(p => !slugSet.has(p.slug));
    console.log(`  → ${PAGES_DATA.length - newPages.length} pages already exist (will be skipped)`);
    console.log(`  → ${newPages.length} new pages to insert\n`);
  }
  
  // Step 2: Build old ID → new UUID mapping for pages
  const pageIdMap = {};
  for (const page of PAGES_DATA) {
    pageIdMap[page.id] = genUUID('page', page.id);
  }
  
  // Step 3: Insert pages
  let pagesInserted = 0;
  let pagesSkipped = 0;
  
  for (const page of PAGES_DATA) {
    const newId = pageIdMap[page.id];
    const status = page.status === 'published' ? 'PUBLISHED' : 'DRAFT';
    
    try {
      await prisma.page.upsert({
        where: { slug: page.slug },
        create: {
          id: newId,
          title: page.title,
          slug: page.slug,
          template: 'DEFAULT',
          metaTitle: page.meta_title,
          metaDescription: page.meta_description,
          metaKeywords: page.meta_keywords,
          ogImage: page.meta_thumbnail,
          status: status,
          publishedAt: status === 'PUBLISHED' ? new Date(page.created_at) : null,
          createdById: ADMIN_USER_ID,
          createdAt: new Date(page.created_at),
          updatedAt: new Date(page.updated_at),
        },
        update: {}, // No update if exists (idempotent)
      });
      pagesInserted++;
    } catch (e) {
      console.warn(`⚠ Failed to insert page "${page.title}" (slug: ${page.slug}): ${e.message}`);
      pagesSkipped++;
    }
  }
  
  console.log(`✓ Pages: ${pagesInserted} inserted, ${pagesSkipped} skipped\n`);
  
  // Step 4: Rebuild pageIdMap from actual DB (for idempotent re-runs)
  const dbPages = await prisma.page.findMany({ select: { id: true, slug: true } });
  const slugToDbId = {};
  for (const p of dbPages) {
    slugToDbId[p.slug] = p.id;
  }
  
  // Rebuild mapping: old MySQL id → actual DB UUID
  for (const page of PAGES_DATA) {
    if (slugToDbId[page.slug]) {
      pageIdMap[page.id] = slugToDbId[page.slug];
    }
  }
  
  // Step 5: Insert components
  let compsInserted = 0;
  let compsSkipped = 0;
  let compsOrphaned = 0;
  
  for (const comp of COMPONENTS_DATA) {
    // Skip components for pages that don't exist
    if (!validPageIds.has(comp.page_id)) {
      compsOrphaned++;
      continue;
    }
    
    const pageUuid = pageIdMap[comp.page_id];
    if (!pageUuid) {
      console.warn(`⚠ No UUID mapping for page_id=${comp.page_id}, skipping component ${comp.id}`);
      compsOrphaned++;
      continue;
    }
    
    const compUuid = genUUID('comp', comp.id);
    const componentData = COMPONENT_DATA_MAP[comp.id] || {};
    
    try {
      // Check if component already exists
      const existing = await prisma.pageComponent.findFirst({
        where: {
          pageId: pageUuid,
          type: comp.component_type,
          order: comp.sort_order,
        }
      });
      
      if (existing) {
        compsSkipped++;
        continue;
      }
      
      await prisma.pageComponent.create({
        data: {
          id: compUuid,
          pageId: pageUuid,
          type: comp.component_type,
          data: componentData,
          order: comp.sort_order,
          isVisible: comp.is_visible === 1,
          createdAt: new Date(comp.created_at),
          updatedAt: new Date(comp.updated_at),
        }
      });
      compsInserted++;
    } catch (e) {
      console.warn(`⚠ Failed to insert component id=${comp.id} (type: ${comp.component_type}, page_id: ${comp.page_id}): ${e.message}`);
      compsSkipped++;
    }
  }
  
  console.log(`✓ Components: ${compsInserted} inserted, ${compsSkipped} skipped, ${compsOrphaned} orphaned (no parent page)\n`);
  
  // Step 6: Validation
  console.log('=== Validation ===');
  const finalPageCount = await prisma.page.count();
  const finalCompCount = await prisma.pageComponent.count();
  console.log(`Total pages in DB: ${finalPageCount}`);
  console.log(`Total components in DB: ${finalCompCount}`);
  
  // Validate component types
  const componentTypes = await prisma.$queryRaw`
    SELECT component_type, COUNT(*)::int as count 
    FROM page_components 
    GROUP BY component_type 
    ORDER BY count DESC
  `;
  console.log('\nComponent types distribution:');
  for (const ct of componentTypes) {
    console.log(`  ${ct.component_type}: ${ct.count}`);
  }
  
  // Validate page-component relationships
  const pagesWithComps = await prisma.$queryRaw`
    SELECT p.title, p.slug, COUNT(pc.id)::int as component_count
    FROM pages p
    LEFT JOIN page_components pc ON pc.page_id = p.id
    GROUP BY p.id, p.title, p.slug
    ORDER BY component_count DESC
  `;
  console.log('\nPages and their component counts:');
  for (const p of pagesWithComps) {
    console.log(`  ${p.title} (${p.slug}): ${p.component_count} components`);
  }
  
  console.log('\n✅ Migration complete!');
}

migrate()
  .catch(e => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
