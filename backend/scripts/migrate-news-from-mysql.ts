/**
 * Migration Script: News Data from MySQL Backup → PostgreSQL (Prisma)
 * 
 * Source: data_news_lengkap_tanpaviews.sql
 * Target tables: news_categories, news, news_highlights
 * 
 * Mapping:
 * - news_category → news_categories
 *   - category_name → name_en
 *   - data_status (1=active) → is_active (boolean)
 *   - data_order → position
 *   - slug → slug (unique)
 * 
 * - news_content → news
 *   - id_category → category_id (UUID FK via mapping)
 *   - data_status (1=published) → status (ContentStatus enum)
 *   - meta_keyword → meta_keywords
 *   - created_by_id → system user UUID (required FK)
 *   - view_count, view_count_unique → Int (default 0)
 * 
 * - news_highlight → news_highlights
 *   - id_news → news_id (UUID FK via mapping)
 *   - data_order → position (unique)
 * 
 * Usage: cd backend && npx ts-node scripts/migrate-news-from-mysql.ts
 */

import { PrismaClient, ContentStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// ============================================================
// SYSTEM USER (for required created_by_id FK on news table)
// ============================================================
const SYSTEM_USER_EMAIL = 'system@admin.com';
const SYSTEM_USER_USERNAME = 'system_admin';

async function getOrCreateSystemUser(): Promise<string> {
  let user = await prisma.user.findUnique({ where: { email: SYSTEM_USER_EMAIL } });
  if (user) return user.id;

  // Try by username
  user = await prisma.user.findUnique({ where: { username: SYSTEM_USER_USERNAME } });
  if (user) return user.id;

  // Create system user
  const newUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: SYSTEM_USER_EMAIL,
      username: SYSTEM_USER_USERNAME,
      password: '$2b$10$placeholder_hash_not_for_login', // not a real password
      firstName: 'System',
      lastName: 'Admin',
    },
  });
  console.log(`  Created system user: ${newUser.id}`);
  return newUser.id;
}

// ============================================================
// SOURCE DATA FROM MySQL BACKUP
// ============================================================

interface MysqlCategory {
  id: number;
  category_name: string;
  data_order: number | null;
  slug: string;
  data_status: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface MysqlNews {
  id: number;
  title_en: string;
  title_id: string | null;
  news_thumbnail: string | null;
  slug: string;
  excerpt_en: string | null;
  excerpt_id: string | null;
  author: string | null;
  content_en: string;
  content_id: string | null;
  data_status: number;
  meta_desc: string | null;
  meta_keyword: string | null;
  created_at: string | null;
  updated_at: string | null;
  news_date: string | null;
  created_by: string | null;
  updated_by: string | null;
  id_category: number | null;
  news_link: string | null;
  view_count: number | null;
  view_count_unique: number | null;
  custom_css: string | null;
  custom_js: string | null;
}

interface MysqlHighlight {
  id: number;
  id_news: number;
  data_order: number | null;
  created_by: string | null;
  created_at: string | null;
  updated_by: string | null;
  updated_at: string | null;
}

// ----- CATEGORIES (9 rows) -----
const CATEGORIES: MysqlCategory[] = [
  { id: 1, category_name: 'Uncategorized', data_order: null, slug: 'uncategorized', data_status: 2, created_by: 'admin@gmail.com', updated_by: 'admin@gmail.com', created_at: '2025-04-29 08:55:53', updated_at: '2025-04-29 08:55:53' },
  { id: 3, category_name: 'Press Release', data_order: 1, slug: 'press-release', data_status: 1, created_by: 'admin@gmail.com', updated_by: null, created_at: '2025-12-18 20:58:48', updated_at: '2025-12-18 20:58:51' },
  { id: 4, category_name: 'CSR Programs', data_order: 2, slug: 'csr', data_status: 1, created_by: 'admin@gmail.com', updated_by: null, created_at: '2025-12-18 20:58:48', updated_at: '2025-12-18 20:58:48' },
  { id: 7, category_name: 'Event', data_order: 3, slug: 'event', data_status: 1, created_by: 'admin@gmail.com', updated_by: null, created_at: '2025-12-18 20:58:48', updated_at: '2025-12-18 20:58:48' },
  { id: 8, category_name: 'News', data_order: 4, slug: 'news', data_status: 1, created_by: 'admin@gmail.com', updated_by: null, created_at: '2025-12-18 20:58:48', updated_at: '2025-12-18 20:58:48' },
  { id: 14, category_name: 'Category Example', data_order: 5, slug: 'category-example', data_status: 1, created_by: 'admin@gmail.com', updated_by: null, created_at: '2025-09-28 10:21:06', updated_at: '2025-09-28 10:21:06' },
  { id: 15, category_name: 'Company News', data_order: 6, slug: 'company-news', data_status: 1, created_by: 'admin@gmail.com', updated_by: null, created_at: '2025-10-03 06:21:15', updated_at: '2025-10-03 06:21:15' },
  { id: 16, category_name: 'Product Updates', data_order: 7, slug: 'product-updates', data_status: 1, created_by: 'admin@gmail.com', updated_by: null, created_at: '2025-10-03 06:21:15', updated_at: '2025-10-03 06:21:15' },
  { id: 17, category_name: 'Industry News', data_order: 8, slug: 'industry-news', data_status: 1, created_by: 'admin@gmail.com', updated_by: null, created_at: '2025-10-03 06:21:15', updated_at: '2025-10-03 06:21:15' },
];

// ----- NEWS CONTENT (30 rows) -----
const NEWS_CONTENT: MysqlNews[] = [
  { id: 1, title_en: 'Citranet Partners with Linknet to Expand Network Coverage in Yogyakarta and Banyumas', title_id: null, news_thumbnail: 'https://linknet.co.id/storage/files/1/news/main-image-1.jpg', slug: 'citranet-partners-with-linknet-to-expand-network-coverage-in-yogyakarta-and-banyumas', excerpt_en: null, excerpt_id: null, author: null, content_en: '<p>Linknet Corp has announced a major expansion of its network infrastructure across Indonesia, bringing high-speed internet connectivity to more remote areas of the archipelago.</p><p>This expansion includes the deployment of fiber optic cables, new data centers, and advanced networking equipment to ensure reliable and fast internet access for both residential and business customers.</p><p>The project is expected to be completed by the end of 2025 and will significantly improve digital connectivity in underserved regions.</p>', content_id: null, data_status: 1, meta_desc: null, meta_keyword: 'linknet, network expansion, fiber optic, indonesia, internet infrastructure', created_at: '2025-10-03 06:37:37', updated_at: '2026-03-12 22:31:51', news_date: '2025-10-02', created_by: 'admin@linknet.id', updated_by: 'admin@gmail.com', id_category: 15, news_link: null, view_count: 1023, view_count_unique: 654, custom_css: null, custom_js: null },
  { id: 2, title_en: 'PT Link Net Tbk Rayakan Ulang Tahun ke-25 dengan Berbagi Kebahagiaan di Bulan Ramadan', title_id: null, news_thumbnail: 'https://linknet.co.id/storage/files/1/news/main-image-10.jpg', slug: 'pt-link-net-tbk-rayakan-ulang-tahun-ke-25-dengan-berbagi-kebahagiaan-di-bulan-ramadan', excerpt_en: null, excerpt_id: null, author: null, content_en: '<p>Linknet Corp is proud to announce the launch of our new cloud services platform specifically designed for enterprise clients seeking scalable and secure cloud solutions.</p><p>The platform features:</p><ul><li>99.9% uptime guarantee</li><li>Advanced security protocols</li><li>24/7 technical support</li><li>Flexible scaling options</li><li>Cost-effective pricing models</li></ul><p>Enterprise clients can now migrate their workloads seamlessly and take advantage of our robust cloud infrastructure.</p>', content_id: null, data_status: 1, meta_desc: null, meta_keyword: 'cloud services, enterprise, linknet, platform, security, uptime', created_at: '2025-10-03 06:37:37', updated_at: '2026-03-13 03:12:36', news_date: '2025-09-30', created_by: 'admin@linknet.id', updated_by: 'admin@gmail.com', id_category: 16, news_link: null, view_count: 1216, view_count_unique: 699, custom_css: null, custom_js: null },
  { id: 3, title_en: 'Centratama Group and Linknet to Enhance Broadband Connectivity Across Indonesia', title_id: null, news_thumbnail: 'https://linknet.co.id/storage/files/1/news/main-image-8.jpg', slug: 'centratama-group-and-linknet-to-enhance-broadband-connectivity-across-indonesia', excerpt_en: null, excerpt_id: null, author: null, content_en: '<p>According to the latest industry reports, Indonesia is leading Southeast Asia in digital transformation initiatives, with significant investments in telecommunications infrastructure and digital services.</p><p>Key highlights include:</p><ul><li>40% increase in fiber optic coverage</li><li>Growing adoption of cloud services</li><li>Government support for digital initiatives</li><li>Rising demand for high-speed internet</li></ul><p>This trend presents opportunities for telecommunications companies like Linknet Corp to expand their services and support the nation\'s digital growth.</p>', content_id: null, data_status: 1, meta_desc: null, meta_keyword: 'indonesia, digital transformation, southeast asia, telecommunications, fiber optic', created_at: '2025-10-03 06:37:37', updated_at: '2026-03-12 10:29:58', news_date: '2025-09-28', created_by: 'admin@linknet.id', updated_by: 'admin@gmail.com', id_category: 17, news_link: null, view_count: 832, view_count_unique: 552, custom_css: null, custom_js: null },
  { id: 4, title_en: 'Linknet and Nexa Sign Memorandum of Understanding on ICT Network Infrastructure Cooperation', title_id: 'Linknet dan Nexa Teken Nota Kesepahaman Kerja Sama Infrastruktur Jaringan ICT', news_thumbnail: 'https://linknet.co.id/storage/files/1/news/main-image-7.jpg', slug: 'linknet-and-nexa-sign-memorandum-of-understanding-on-ict-network-infrastructure-cooperation', excerpt_en: 'PT Link Net Tbk ("Linknet", Issuer Code: LINK) and PT Internet Mulia Untuk Negeri (NEXA) officially signed a Memorandum of Understanding on Strategic Cooperation in Providing Information, Communication & Technology (ICT) Infrastructure Solutions', excerpt_id: 'PT Link Net Tbk ("Linknet", Kode Emiten: LINK) dan PT Internet Mulia Untuk Negeri (NEXA) resmi menandatangani Nota Kesepahaman tentang Kerja Sama Strategis dalam Penyediaan Solusi Infrastruktur Information, Communication & Technology (ICT)', author: null, content_en: '<p>Jakarta, 15 Juli 2025 — PT Link Net Tbk and PT Internet Mulia Untuk Negeri (NEXA) signed a Memorandum of Understanding on Strategic Cooperation in ICT Infrastructure Solutions.</p>', content_id: null, data_status: 1, meta_desc: null, meta_keyword: 'linknet, award, best isp, 2024, telecommunications, indonesia', created_at: '2025-10-03 06:37:37', updated_at: '2026-03-13 03:39:24', news_date: '2025-09-26', created_by: 'admin@linknet.id', updated_by: 'admin@gmail.com', id_category: 15, news_link: null, view_count: 1828, view_count_unique: 1204, custom_css: null, custom_js: null },
  { id: 5, title_en: 'Enhanced Security Features Now Available for All Plans', title_id: null, news_thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop', slug: 'enhanced-security-features-now-available-for-all-plans', excerpt_en: null, excerpt_id: null, author: null, content_en: '<p>Linknet Corp has rolled out enhanced security features across all internet plans, providing our customers with advanced protection against cyber threats.</p>', content_id: null, data_status: 1, meta_desc: null, meta_keyword: 'security features, ddos protection, firewall, linknet, cyber security, internet safety', created_at: '2025-10-03 06:37:37', updated_at: '2026-03-12 19:55:49', news_date: '2025-09-23', created_by: 'admin@linknet.id', updated_by: 'admin@linknet.id', id_category: 16, news_link: null, view_count: 684, view_count_unique: 400, custom_css: null, custom_js: null },
  { id: 6, title_en: '5G Network Deployment Accelerates Across Indonesia', title_id: null, news_thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop', slug: '5g-network-deployment-accelerates-across-indonesia', excerpt_en: null, excerpt_id: null, author: null, content_en: '<p>The deployment of 5G networks across Indonesia is accelerating, with major cities now experiencing significantly improved mobile connectivity and internet speeds.</p>', content_id: null, data_status: 1, meta_desc: null, meta_keyword: '5g network, indonesia, telecommunications, mobile connectivity, internet speed', created_at: '2025-10-03 06:37:37', updated_at: '2026-03-12 17:33:01', news_date: '2025-09-21', created_by: 'admin@linknet.id', updated_by: 'admin@linknet.id', id_category: 17, news_link: null, view_count: 885, view_count_unique: 554, custom_css: null, custom_js: null },
  { id: 10, title_en: 'Launching The High Speed Broadband Internet Up To 100mbps For Bandung Family', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/csr/LAUNCHING%20THE%20HIGH%20SPEED%20BROADBAND%20INTERNET%20UP%20TO%20100MBPS%20FOR%20BANDUNG%20FAMILY.jpg', slug: 'launching-the-high-speed-broadband-internet-up-to-100mbps-for-bandung-family', excerpt_en: 'Launching The High Speed Broadband Internet Up To 100mbps For Bandung Family', excerpt_id: null, author: 'admin', content_en: '<p><strong>Bandung, 18 Desember 2013</strong> – First Media broadband internet launch in Bandung.</p>', content_id: null, data_status: 1, meta_desc: 'Dewasa ini, kebutuhan internet bagi kaum urban di Indonesia terus meningkat.', meta_keyword: 'csr, linknet, first media', created_at: '2021-11-29 18:17:55', updated_at: '2026-03-12 22:24:00', news_date: '2013-12-18', created_by: 'admin@gmail.com', updated_by: 'admin@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 11, title_en: 'Successful Launching Their Newest Services "Tv Anywhere" For Mobile Device', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/csr/Successful%20Launching%20Their%20Newest%20Services.jpg', slug: 'successful-launching-their-newest-services-tv-anywhere-for-mobile-device', excerpt_en: 'Successful Launching Their Newest Services "Tv Anywhere" For Mobile Device', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>Jakarta, 28 Februari, 2014 – First Media GO launch.</p>', content_id: null, data_status: 1, meta_desc: 'Successful Launching Their Newest Services "Tv Anywhere" For Mobile Device', meta_keyword: 'tv anywhere, mobile device, launching, link net', created_at: '2021-11-29 18:24:30', updated_at: '2026-03-12 18:30:56', news_date: '2014-02-28', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 12, title_en: 'Link Net Successfully Completed IPO On The Indonesia Stock Exchange (IDX)', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/csr/linknet-ipo-listing.webp', slug: 'link-net-successfully-completed-ipo-on-the-indonesia-stock-exchange-idx', excerpt_en: 'Link Net Successfully Completed IPO On The Indonesia Stock Exchange (IDX)', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>Jakarta, Indonesia – Jumat, 2 Juni 2014 – PT LINK NET Tbk. IPO on IDX.</p>', content_id: null, data_status: 1, meta_desc: 'Link Net Successfully Completed IPO On The Indonesia Stock Exchange (IDX)', meta_keyword: 'IPO, Link Net, Indonesia Stock Exchange, IDX', created_at: '2021-11-29 18:27:55', updated_at: '2026-03-13 02:49:09', news_date: '2014-06-02', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 13, title_en: 'Link Net Reports Strong Results In 2014, With A 54.0% Increase In Net Income', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/linknet-default-old.png', slug: 'link-net-reports-strong-results-in-2014-with-a-54-0-increase-in-net-income', excerpt_en: 'Link Net Reports Strong Results In 2014, With A 54.0% Increase In Net Income', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>FY 2014 Highlights: Revenue up 28.3% to Rp 2,136.0 billion.</p>', content_id: null, data_status: 1, meta_desc: 'PT Link Net Tbk reported strong full year 2014 results.', meta_keyword: null, created_at: '2021-11-29 18:37:55', updated_at: '2026-03-09 11:44:44', news_date: '2015-03-17', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 14, title_en: 'Link Net Reports Continued Growth in Q1 2015. Total Revenue Up 22% and EBITDA 26%', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/linknet-default-old.png', slug: 'link-net-reports-continued-growth-in-q1-2015-total-revenue-up-22-and-ebitda-26', excerpt_en: 'Link Net Reports Continued Growth in Q1 2015. Total Revenue Up 22% and EBITDA 26%', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>Jakarta, 29 April 2015 – Q1 2015 Key Highlights.</p>', content_id: null, data_status: 1, meta_desc: 'PT Link Net Tbk reported a strong start to the new financial year.', meta_keyword: null, created_at: '2021-11-29 18:39:35', updated_at: '2026-03-12 04:18:49', news_date: '2015-04-29', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 15, title_en: 'Link Net Registers Steady Growth in H1 2015, Achieving Over 1.55 Million Homes Passed', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/linknet-default-old.png', slug: 'link-net-registers-steady-growth-in-h1-2015-achieving-over-1-55-million-homes-passed', excerpt_en: 'Link Net Registers Steady Growth in H1 2015, Achieving Over 1.55 Million Homes Passed', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>Jakarta, August 3, 2015 – H1 2015 results.</p>', content_id: null, data_status: 1, meta_desc: 'PT Link Net Tbk reported robust set of results for the first half of 2015.', meta_keyword: null, created_at: '2021-11-29 18:42:03', updated_at: '2026-03-12 13:47:41', news_date: '2015-08-03', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 16, title_en: 'Link Net Registers Steady Growth in 9M 2015, Nudging Past 1.6 Million Homes Passed Mark', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/linknet-default-old.png', slug: 'link-net-registers-steady-growth-in-9m-2015-nudging-past-1-6-million-homes-passed-mark', excerpt_en: 'Link Net Registers Steady Growth in 9M 2015, Nudging Past 1.6 Million Homes Passed Mark', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>Jakarta, October 29, 2015 – 9M 2015 Results.</p>', content_id: null, data_status: 1, meta_desc: 'PT Link Net Tbk reported its results for the third quarter of 2015.', meta_keyword: null, created_at: '2021-11-29 18:43:53', updated_at: '2026-03-12 07:14:51', news_date: '2015-10-29', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 17, title_en: 'Link Net Reports 20% Growth in Revenues and 15% Growth in Net Profit', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/linknet-default-old.png', slug: 'link-net-reports-20-growth-in-revenues-and-15-growth-in-net-profit', excerpt_en: 'Link Net Reports 20% Growth in Revenues and 15% Growth in Net Profit', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>Jakarta, March 21 2016 – Full year 2015 consolidated financial statement.</p>', content_id: null, data_status: 1, meta_desc: 'PT Link Net Tbk today reported the full year 2015 consolidated financial statement.', meta_keyword: null, created_at: '2021-11-29 18:50:04', updated_at: '2026-03-13 00:49:01', news_date: '2016-03-21', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 19, title_en: 'Link Net Reports Continued Growth in Q1 2016. Revenue Up 12% and Net Profit Up 29%', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/linknet-default-old.png', slug: 'link-net-reports-continued-growth-in-q1-2016-revenue-up-12-and-net-profit-up-29', excerpt_en: 'Link Net Reports Continued Growth in Q1 2016. Revenue Up 12% and Net Profit Up 29%', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>Jakarta May 2, 2016 – Q1 2016 results.</p>', content_id: null, data_status: 1, meta_desc: 'PT Link Net Tbk reported continued growth during the first quarter of 2016.', meta_keyword: null, created_at: '2021-11-29 18:53:53', updated_at: '2026-03-12 04:17:50', news_date: '2016-05-02', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 21, title_en: 'Link Net Reports 26% Growth in Net Profit', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/linknet-default-old.png', slug: 'link-net-reports-26-growth-in-net-profit', excerpt_en: 'Link Net Reports 26% Growth in Net Profit', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>August 3, 2016 – H1 2016 results.</p>', content_id: null, data_status: 1, meta_desc: null, meta_keyword: null, created_at: '2021-11-29 18:55:46', updated_at: '2026-03-12 14:44:05', news_date: '2016-08-03', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 23, title_en: 'Link Net Announces New Chief Financial Officer', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/linknet-default-old.png', slug: 'link-net-announces-new-chief-financial-officer', excerpt_en: 'Link Net Announces New Chief Financial Officer', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>August 22, 2016 – Appointment of Timotius Max Sulaiman as new CFO.</p>', content_id: null, data_status: 1, meta_desc: 'PT Link Net Tbk announced the appointment of Timotius Max Sulaiman as new CFO.', meta_keyword: null, created_at: '2021-11-29 18:57:19', updated_at: '2026-03-12 07:47:22', news_date: '2016-08-22', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 24, title_en: 'Link Net Reports 14% Revenue Growth and 31% Net Profit Growth. Homes Passed Closing into ~1.8 Million and Revenue Generating Broadband and Cable TV Subscribers ~1 Million', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/banner_up.jpg', slug: 'link-net-reports-14-revenue-growth-and-31-net-profit-growth-homes-passed-closing-into-1-8-million-and-revenue-generating-broadband-and-cable-tv-subscribers-1-million', excerpt_en: 'Link Net Reports 14% Revenue Growth and 31% Net Profit Growth.', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>November 2, 2016 – 9M 2016 results.</p>', content_id: null, data_status: 1, meta_desc: null, meta_keyword: null, created_at: '2021-11-29 19:03:22', updated_at: '2026-03-12 19:39:09', news_date: '2016-11-01', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 25, title_en: 'Link Net Reported Solid Revenue Growth Up By 15%; Operational Profit Up By 20%; Net Profit Up By 28%', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/banner_up.jpg', slug: 'link-net-reported-solid-revenue-growth-up-by-15-operational-profit-up-by-20-net-profit-up-by-28', excerpt_en: 'Link Net Reported Solid Revenue Growth Up By 15%.', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>March 17, 2017 – Full year 2016 consolidated financial statement.</p>', content_id: null, data_status: 1, meta_desc: 'PT Link Net Tbk today reported full year audited consolidated financial statement for 2016.', meta_keyword: null, created_at: '2021-11-29 19:05:28', updated_at: '2026-03-12 19:39:09', news_date: null, created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 26, title_en: 'Link Net Reported Another Round Of Solid Results In Q1 2017: Revenue Up 20%; Operational Profit Up 25%; Net Profit Up 26%', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/381c5382acbb747c37d5bb10637e6e6745ccd6e2.jpg', slug: 'link-net-reported-another-round-of-solid-results-in-q1-2017-revenue-up-20-operational-profit-up-25-net-profit-up-26', excerpt_en: 'Link Net Reported Another Round Of Solid Results In Q1 2017.', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>Jakarta, May 2, 2017 – Q1 2017 results.</p>', content_id: null, data_status: 1, meta_desc: 'PT Link Net Tbk today reported another round of solid results during Q1 2017.', meta_keyword: null, created_at: '2021-11-29 19:11:27', updated_at: '2026-03-13 02:24:32', news_date: '2017-05-17', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 27, title_en: 'Link Net Reports Record High Revenue, Operating Profit & Net Profit Numbers In 1h 2017', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/381c5382acbb747c37d5bb10637e6e6745ccd6e2.jpg', slug: 'link-net-reports-record-high-revenue-operating-profit-net-profit-numbers-in-1h-2017', excerpt_en: 'Link Net Reports Record High Revenue, Operating Profit & Net Profit Numbers In 1h 2017', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>July 31, 2017 – 1H 2017 Results.</p>', content_id: null, data_status: 1, meta_desc: 'PT Link Net Tbk continued on a strong growth trajectory in 2Q 2017.', meta_keyword: null, created_at: '2021-11-29 19:14:59', updated_at: '2026-03-12 04:17:49', news_date: null, created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 28, title_en: 'Link Net Reports Year On Year (YOY) Revenue Up', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/381c5382acbb747c37d5bb10637e6e6745ccd6e2.jpg', slug: 'link-net-reports-year-on-year-yoy-revenue-up', excerpt_en: 'Link Net Reports Year On Year (YOY) Revenue Up', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>October 30, 2017 – 9M17 Results.</p>', content_id: null, data_status: 1, meta_desc: 'PT Link Net Tbk has delivered results above the company\'s full year growth guidance.', meta_keyword: null, created_at: '2021-11-29 19:38:30', updated_at: '2026-03-12 19:39:09', news_date: '2017-10-31', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 29, title_en: 'Siaran Pers - PT Link Net Tbk Dengan Merek First Media Terus Konsisten Menyediakan Layanan Yang Terbaik Kepada Pelanggan', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/linknet-default-old.png', slug: 'siaran-pers-pt-link-net-tbk-dengan-merek-first-media-terus-konsisten-menyediakan-layanan-yang-terbaik-kepada-pelanggan', excerpt_en: 'Siaran Pers - Pt Link Net Tbk Dengan Merek First Media Terus Konsisten.', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>Jakarta, 9 November 2018 – PT Link Net Tbk (LINK) with the First Media brand continues to provide quality services.</p>', content_id: null, data_status: 1, meta_desc: 'PT Link Net Tbk (LINK) dengan merek First Media terus konsisten menyediakan layanan berkualitas.', meta_keyword: null, created_at: '2021-11-29 19:40:46', updated_at: '2026-03-12 19:39:09', news_date: '2018-11-10', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 31, title_en: 'Link Net Achieves 2 Million Homes Passed And Shareholders Approve Share Buy Back', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/Link-Net-Achieves-2-Million-Homes-Passed-And-Shareholders-Approve-Share-Buy-Back-_1_.webp', slug: 'link-net-achieves-2-million-homes-passed-and-shareholders-approve-share-buy-back', excerpt_en: 'Link Net Achieves 2 Million Homes Passed And Shareholders Approve Share Buy Back', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>Jakarta, January 15, 2018 – Link Net achieved 2 million total homes passed.</p>', content_id: null, data_status: 1, meta_desc: null, meta_keyword: null, created_at: '2021-12-02 01:05:34', updated_at: '2026-03-12 19:39:09', news_date: '2018-01-16', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 33, title_en: "Link Net Shareholders Approve Appointment Of Directors, Approve Reduction In Issued And Paid Up Capital & Approve Increasing The Maximum Number Of Shares That Can Be Purchased Via The Company's Share Buyback Plan", title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/LINK-NET-SHAREHOLDERS-APPROVE-APPOINTMENT-OF-DIRECTORS_-APPROVE-REDUCTION-IN-ISSUED-AND-PAID-UP-CAPI.webp', slug: "link-net-shareholders-approve-appointment-of-directors-approve-reduction-in-issued-and-paid-up-capital-approve-increasing-the-maximum-number-of-shares-that-can-be-purcahsed-via-the-company\u2019s-share-buyback-plan", excerpt_en: "Link Net Shareholders Approve Appointment Of Directors.", excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>Jakarta, December 20, 2018 – Link Net EGM results.</p>', content_id: null, data_status: 1, meta_desc: 'Link Net Shareholders have approved the appointment of directors.', meta_keyword: null, created_at: '2021-12-02 01:29:13', updated_at: '2026-03-12 22:52:26', news_date: '2018-12-21', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 34, title_en: 'Link Net Concludes Annual General Meeting Of Shareholders--shareholders Approve Record Dividend Payment Of Rp674 Billion', title_id: null, news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/Link%20Net%20Concludes%20Annual%20General%20Meeting%20Of%20Shareholders-2019.jpeg', slug: 'link-net-concludes-annual-general-meeting-of-shareholders-shareholders-approve-record-dividend-payment-of-rp674-billion-a-60-dividend-payout-ratio-of-normalized-net-earnings-shareholders-approve-appointment-of-new-director-and-new-commissioner', excerpt_en: 'Link Net Concludes Annual General Meeting Of Shareholders.', excerpt_id: null, author: 'Muhammad Daffa Prayodi', content_en: '<p>April 26, 2019 – AGMS results.</p>', content_id: null, data_status: 1, meta_desc: 'PT Link Net Tbk has successfully concluded its annual general meeting of shareholders.', meta_keyword: null, created_at: '2021-12-02 01:32:26', updated_at: '2026-03-13 00:41:59', news_date: '2019-04-27', created_by: 'daffaprayodi@gmail.com', updated_by: 'daffaprayodi@gmail.com', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 35, title_en: 'Link Net Dukung Peningkatan Layanan Kesehatan di Nusa Tenggara Timur (NTT)', title_id: 'Link Net Dukung Peningkatan Layanan Kesehatan di Nusa Tenggara Timur (NTT)', news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/csr/csr-peduli-3.png', slug: 'link-net-dukung-peningkatan-layanan-kesehatan-di-nusa-tenggara-timur-ntt', excerpt_en: 'In order to carry out corporate social responsibility, the Company gave an ambulance to the St. Antonius Jopu, Ende - NTT.', excerpt_id: 'Dalam rangka kegiatan tanggung jawab sosial perusahaan Perseroan memberikan satu unit ambulans.', author: 'Aditya Firmansyah', content_en: '<p><strong>18 Nov 2019</strong> - The Company gave an ambulance to NTT.</p>', content_id: '<p><strong>18 Nov 2019</strong> - Perseroan memberikan ambulans kepada RS di NTT.</p>', data_status: 1, meta_desc: null, meta_keyword: null, created_at: '2022-01-13 18:54:45', updated_at: '2026-03-12 11:40:44', news_date: '2019-11-18', created_by: 'aditya.firmansyah@biz.linknet.co.id', updated_by: 'aditya.firmansyah@biz.linknet.co.id', id_category: 4, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 36, title_en: 'Link Net Collaborates with BenihBaik.com to Provide Free Internet Network for Schools', title_id: 'Link Net Gandeng BenihBaik.com Untuk Memberikan Jaringan Internet Gratis bagi Sekolah-Sekolah', news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/csr/csr-peduli-1.jpg', slug: 'link-net-gandeng-benihbaik-com-untuk-memberikan-jaringan-internet-gratis-bagi-sekolah-sekolah', excerpt_en: 'The Company cooperates with the BenihBaik Foundation.', excerpt_id: 'Demi Meningkatkan Kualitas Pendidikan, Perseroan melakukan kerjasama dengan Yayasan BenihBaik.', author: 'Aditya Firmansyah', content_en: '<p><strong>December 6, 2019</strong> - Free internet for schools via BenihBaik.</p>', content_id: '<p><strong>6 Desember 2019</strong> - Internet gratis untuk sekolah via BenihBaik.</p>', data_status: 1, meta_desc: null, meta_keyword: null, created_at: '2022-01-13 19:09:50', updated_at: '2026-03-13 00:48:43', news_date: '2019-12-06', created_by: 'aditya.firmansyah@biz.linknet.co.id', updated_by: 'aditya.firmansyah@biz.linknet.co.id', id_category: 4, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 37, title_en: 'Multivitamin & Personal Protective Equipment Donations', title_id: 'Donasi Multivitamin & Alat Pelindung Diri', news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/csr/csr-peduli-2.jpg', slug: 'donasi-multivitamin-alat-pelindung-diri', excerpt_en: 'As a step of concern for medical personnel handling the Covid-19 pandemic.', excerpt_id: 'Sebagai langkah kepedulian terhadap para tenaga medis.', author: 'Aditya Firmansyah', content_en: '<p><b>April 19, 2020 -</b> Donated multivitamins and PPE to COVID-19 referral hospitals.</p>', content_id: '<p><strong>19 April 2020</strong> - Donasi multivitamin dan APD ke rumah sakit COVID-19.</p>', data_status: 1, meta_desc: null, meta_keyword: null, created_at: '2022-01-13 19:23:12', updated_at: '2026-03-12 22:45:35', news_date: '2020-04-19', created_by: 'aditya.firmansyah@biz.linknet.co.id', updated_by: 'aditya.firmansyah@biz.linknet.co.id', id_category: 4, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 38, title_en: 'Link Net Supports West Java Community Health and Economic Recovery', title_id: 'Link Net Dukung Kesehatan dan Pemulihan Ekonomi Masyarakat Jawa Barat', news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/csr/Link-Net-Dukung-Kesehatan-dan-Pemulihan-Ekonomi-Masyarakat-Jawa-Barat.jpg', slug: 'link-net-dukung-kesehatan-dan-pemulihan-ekonomi-masyarakat-jawa-barat', excerpt_en: 'PT Link Net Tbk with the First Media brand together with Bandung City held a Covid-19 vaccination.', excerpt_id: 'PT Link Net Tbk dengan brand First Media bersama Diskominfo Kota Bandung menggelar vaksinasi.', author: 'Aditya Firmansyah', content_en: '<p><strong>November 19, 2021 -</strong> Covid-19 vaccination support in Bandung.</p>', content_id: '<p><strong>19 November 2021 -</strong> Dukungan vaksinasi Covid-19 di Bandung.</p>', data_status: 1, meta_desc: null, meta_keyword: null, created_at: '2022-01-13 19:58:27', updated_at: '2026-03-12 13:46:01', news_date: '2021-11-19', created_by: 'aditya.firmansyah@biz.linknet.co.id', updated_by: 'aditya.firmansyah@biz.linknet.co.id', id_category: 4, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 40, title_en: 'ZTE Collaborates with Link Net\'s First Media to Boost Network Services for Information Superhighway in Jayabaya Project', title_id: 'Kolaborasi ZTE dengan Link Net Tingkatkan Layanan Jaringan Proyek Information Superhighway Jayabaya', news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/2022/press-release/Kolaborasi-PT-Link-Net-Tbk-dan-ZTE.webp', slug: 'kolaborasi-zte-dengan-link-net-tingkatkan-layanan-jaringan-proyek-information-superhighway-jayabaya', excerpt_en: 'ZTE continues to collaborate with PT Link Net Tbk.', excerpt_id: 'ZTE melanjutkan kolaborasi dengan PT Link Net Tbk.', author: 'Aditya Firmansyah', content_en: '<p>Jakarta, 27 April 2022 – ZTE and Link Net collaboration on Jayabaya Project.</p>', content_id: '<p>Jakarta, 27 April 2022 – Kolaborasi ZTE dan Link Net pada Proyek Jayabaya.</p>', data_status: 1, meta_desc: 'Kolaborasi ZTE dengan Link Net Tingkatkan Layanan Jaringan Proyek Information Superhighway Jayabaya', meta_keyword: 'First Media, Linknet Enterprise, Kerja sama ZTE dengan PT Link Net, Tbk', created_at: '2022-05-05 17:23:41', updated_at: '2026-03-12 23:56:18', news_date: '2022-04-27', created_by: 'aditya.firmansyah@biz.linknet.co.id', updated_by: 'aditya.firmansyah@biz.linknet.co.id', id_category: 8, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
  { id: 41, title_en: 'Link Net FY2021 Financial and Operational Results', title_id: 'Hasil Pencapaian Finansial dan Operasional Link Net FY2021', news_thumbnail: 'https://www.linknet.co.id/storage/files/images/media_activities/2022/press-release/pencapaian-linknet-2021.webp', slug: 'hasil-pencapaian-finansial-dan-operasional-link-net-2021', excerpt_en: 'Link Net booked revenue of Rp4.5tn in FY2021.', excerpt_id: 'Link Net membukukan pendapatan sebesar Rp4,5 triliun pada FY2021.', author: 'Aditya Firmansyah', content_en: '<p>Link Net FY2021 Financial and Operational Results.</p>', content_id: '<p>Hasil Pencapaian Finansial dan Operasional Link Net FY2021.</p>', data_status: 1, meta_desc: 'Link Net membukukan pendapatan sebesar Rp4,5 triliun pada FY2021.', meta_keyword: 'Annual Report PT Link Net, Tbk, Pencapaian PT Link Net, Tbk 2021', created_at: '2022-05-05 18:42:56', updated_at: '2026-03-13 00:31:52', news_date: '2022-04-01', created_by: 'aditya.firmansyah@biz.linknet.co.id', updated_by: 'aditya.firmansyah@biz.linknet.co.id', id_category: 3, news_link: null, view_count: null, view_count_unique: null, custom_css: null, custom_js: null },
];

// ----- HIGHLIGHTS (3 rows) -----
const HIGHLIGHTS: MysqlHighlight[] = [
  { id: 1, id_news: 1, data_order: 1, created_by: 'admin@gmail.com', created_at: '2025-10-08 13:20:22', updated_by: null, updated_at: '2025-10-08 13:20:22' },
  { id: 2, id_news: 2, data_order: 2, created_by: 'admin@gmail.com', created_at: '2025-10-08 13:20:24', updated_by: null, updated_at: '2025-10-08 13:20:24' },
  { id: 3, id_news: 4, data_order: 3, created_by: 'admin@gmail.com', created_at: '2025-10-08 13:20:31', updated_by: null, updated_at: '2025-10-08 13:20:31' },
];

// ============================================================
// ID MAPPING DICTIONARIES (old bigint → new UUID)
// ============================================================
const categoryIdMap = new Map<number, string>();
const newsIdMap = new Map<number, string>();

// ============================================================
// HELPER
// ============================================================
function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function parseDateOnly(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  // news_date is "YYYY-MM-DD" format
  const d = new Date(dateStr + 'T00:00:00Z');
  return isNaN(d.getTime()) ? null : d;
}

// ============================================================
// PHASE 1: Migrate Categories
// ============================================================
async function migrateCategories() {
  console.log('\n=== Phase 1: Migrating News Categories ===');
  let created = 0;
  let skipped = 0;

  for (const cat of CATEGORIES) {
    // Check if slug already exists (idempotent)
    const existing = await prisma.news_categories.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      categoryIdMap.set(cat.id, existing.id);
      console.log(`  SKIP category "${cat.category_name}" (slug exists: ${cat.slug})`);
      skipped++;
      continue;
    }

    const newId = randomUUID();
    categoryIdMap.set(cat.id, newId);

    await prisma.news_categories.create({
      data: {
        id: newId,
        name_en: cat.category_name,
        name_id: null,
        slug: cat.slug,
        description: null,
        position: cat.data_order ?? 0,
        is_active: cat.data_status === 1,
        created_by: cat.created_by,
        updated_by: cat.updated_by,
        created_at: parseDate(cat.created_at) ?? new Date(),
        updated_at: parseDate(cat.updated_at) ?? new Date(),
      },
    });
    console.log(`  OK  category "${cat.category_name}" → ${newId}`);
    created++;
  }

  console.log(`  Categories: ${created} created, ${skipped} skipped`);
}

// ============================================================
// PHASE 2: Migrate News
// ============================================================
async function migrateNews(systemUserId: string) {
  console.log('\n=== Phase 2: Migrating News Content ===');
  let created = 0;
  let skipped = 0;

  for (const n of NEWS_CONTENT) {
    // Check if slug already exists (idempotent)
    const existing = await prisma.news.findUnique({ where: { slug: n.slug } });
    if (existing) {
      newsIdMap.set(n.id, existing.id);
      console.log(`  SKIP news #${n.id} "${n.title_en.substring(0, 60)}..." (slug exists)`);
      skipped++;
      continue;
    }

    const newId = randomUUID();
    newsIdMap.set(n.id, newId);

    // Resolve category UUID (category_id is required in schema)
    // Fallback to 'Uncategorized' category if mapping not found
    const uncategorizedId = categoryIdMap.get(1)!; // old ID 1 = Uncategorized
    let categoryId = n.id_category ? categoryIdMap.get(n.id_category) : uncategorizedId;
    if (!categoryId) {
      console.warn(`  WARN news #${n.id}: category ${n.id_category} not found, using Uncategorized`);
      categoryId = uncategorizedId;
    }

    // Map status
    const status: ContentStatus = n.data_status === 1 ? 'PUBLISHED' : 'DRAFT';

    // Determine published_at
    const createdAt = parseDate(n.created_at) ?? new Date();
    const updatedAt = parseDate(n.updated_at) ?? new Date();
    const newsDate = parseDateOnly(n.news_date);
    const publishedAt = status === 'PUBLISHED' ? (newsDate ?? createdAt) : null;

    await prisma.news.create({
      data: {
        id: newId,
        title_en: n.title_en,
        title_id: n.title_id,
        slug: n.slug,
        news_date: newsDate ?? createdAt,
        news_thumbnail: n.news_thumbnail,
        excerpt_en: n.excerpt_en,
        excerpt_id: n.excerpt_id,
        content_en: n.content_en,
        content_id: n.content_id,
        news_link: n.news_link,
        author: n.author,
        meta_desc: n.meta_desc,
        meta_keywords: n.meta_keyword, // field name change
        custom_css: n.custom_css,
        custom_js: n.custom_js,
        view_count: n.view_count ?? 0,
        view_count_unique: n.view_count_unique ?? 0,
        status,
        published_at: publishedAt,
        category_id: categoryId,
        created_by_id: systemUserId, // required FK
        updated_by_id: null,
        created_at: createdAt,
        updated_at: updatedAt,
      },
    });
    console.log(`  OK  news #${n.id} "${n.title_en.substring(0, 60)}..." → ${newId}`);
    created++;
  }

  console.log(`  News: ${created} created, ${skipped} skipped`);
}

// ============================================================
// PHASE 3: Migrate Highlights
// ============================================================
async function migrateHighlights() {
  console.log('\n=== Phase 3: Migrating News Highlights ===');
  let created = 0;
  let skipped = 0;

  for (const h of HIGHLIGHTS) {
    const newsUuid = newsIdMap.get(h.id_news);
    if (!newsUuid) {
      console.warn(`  WARN highlight: news_id mapping not found for old id_news=${h.id_news}, skipping`);
      skipped++;
      continue;
    }

    // Check if news_id already has a highlight (unique constraint)
    const existingByNews = await prisma.news_highlights.findUnique({ where: { news_id: newsUuid } });
    if (existingByNews) {
      console.log(`  SKIP highlight for news_id=${h.id_news} (already exists)`);
      skipped++;
      continue;
    }

    // Check if position already taken (unique constraint)
    const existingByPos = await prisma.news_highlights.findUnique({ where: { position: h.data_order ?? 0 } });
    if (existingByPos) {
      console.log(`  SKIP highlight position=${h.data_order} (already taken)`);
      skipped++;
      continue;
    }

    const newId = randomUUID();
    await prisma.news_highlights.create({
      data: {
        id: newId,
        news_id: newsUuid,
        position: h.data_order ?? 0,
        created_by: h.created_by,
        updated_by: h.updated_by,
        created_at: parseDate(h.created_at) ?? new Date(),
        updated_at: parseDate(h.updated_at) ?? new Date(),
      },
    });
    console.log(`  OK  highlight news_id=${h.id_news} position=${h.data_order} → ${newId}`);
    created++;
  }

  console.log(`  Highlights: ${created} created, ${skipped} skipped`);
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('========================================');
  console.log('News Migration: MySQL → PostgreSQL');
  console.log('========================================');

  // Step 0: Get or create system user
  console.log('\n--- Getting/creating system user ---');
  const systemUserId = await getOrCreateSystemUser();
  console.log(`  System user ID: ${systemUserId}`);

  // Step 1: Categories first (news depends on them)
  await migrateCategories();

  // Step 2: News content (highlights depend on them)
  await migrateNews(systemUserId);

  // Step 3: Highlights
  await migrateHighlights();

  // Summary
  console.log('\n========================================');
  console.log('Migration Complete!');
  console.log(`  Categories mapped: ${categoryIdMap.size}`);
  console.log(`  News mapped: ${newsIdMap.size}`);
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
