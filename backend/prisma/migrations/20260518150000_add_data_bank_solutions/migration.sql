CREATE TYPE "DataBankSolutionCategoryType" AS ENUM ('INDUSTRY', 'BUSINESS_SCALE', 'BUSINESS_NEED');

CREATE TABLE "data_bank_solutions" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "title_id" TEXT,
  "title_en" TEXT,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "description_id" TEXT,
  "description_en" TEXT,
  "image" TEXT,
  "banner_image" TEXT,
  "cta_list" JSONB NOT NULL DEFAULT '[]',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "published_at" TIMESTAMP(3),
  "created_by" TEXT,
  "updated_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "data_bank_solutions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "data_bank_solution_categories" (
  "id" TEXT NOT NULL,
  "type" "DataBankSolutionCategoryType" NOT NULL,
  "name" TEXT NOT NULL,
  "name_id" TEXT,
  "name_en" TEXT,
  "slug" TEXT NOT NULL,
  "icon" TEXT,
  "description" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "data_bank_solution_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "data_bank_solution_category_relations" (
  "id" TEXT NOT NULL,
  "solution_id" TEXT NOT NULL,
  "category_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "data_bank_solution_category_relations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "data_bank_solutions_slug_key" ON "data_bank_solutions"("slug");
CREATE INDEX "data_bank_solutions_slug_idx" ON "data_bank_solutions"("slug");
CREATE INDEX "data_bank_solutions_sort_order_idx" ON "data_bank_solutions"("sort_order");
CREATE INDEX "data_bank_solutions_status_idx" ON "data_bank_solutions"("status");
CREATE INDEX "data_bank_solutions_published_at_idx" ON "data_bank_solutions"("published_at");
CREATE INDEX "data_bank_solutions_deleted_at_idx" ON "data_bank_solutions"("deleted_at");

CREATE UNIQUE INDEX "data_bank_solution_categories_type_slug_key" ON "data_bank_solution_categories"("type", "slug");
CREATE INDEX "data_bank_solution_categories_type_idx" ON "data_bank_solution_categories"("type");
CREATE INDEX "data_bank_solution_categories_sort_order_idx" ON "data_bank_solution_categories"("sort_order");
CREATE INDEX "data_bank_solution_categories_is_active_idx" ON "data_bank_solution_categories"("is_active");
CREATE INDEX "data_bank_solution_categories_deleted_at_idx" ON "data_bank_solution_categories"("deleted_at");

CREATE UNIQUE INDEX "data_bank_solution_category_relations_solution_id_category_id_key" ON "data_bank_solution_category_relations"("solution_id", "category_id");
CREATE INDEX "data_bank_solution_category_relations_solution_id_idx" ON "data_bank_solution_category_relations"("solution_id");
CREATE INDEX "data_bank_solution_category_relations_category_id_idx" ON "data_bank_solution_category_relations"("category_id");

ALTER TABLE "data_bank_solution_category_relations"
  ADD CONSTRAINT "data_bank_solution_category_relations_solution_id_fkey"
  FOREIGN KEY ("solution_id") REFERENCES "data_bank_solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "data_bank_solution_category_relations"
  ADD CONSTRAINT "data_bank_solution_category_relations_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "data_bank_solution_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "data_bank_solution_categories" ("id", "type", "name", "name_id", "name_en", "slug", "icon", "sort_order")
VALUES
  ('industry-connectivity', 'INDUSTRY', 'Connectivity', 'Connectivity', 'Connectivity', 'connectivity', '/assets/icons/wifi.svg', 10),
  ('industry-ict-solutions', 'INDUSTRY', 'ICT Solutions', 'ICT Solutions', 'ICT Solutions', 'ict-solutions', '/assets/icons/monitor.svg', 20),
  ('industry-cloud', 'INDUSTRY', 'Cloud', 'Cloud', 'Cloud', 'cloud', '/assets/icons/cloud.svg', 30),
  ('industry-professional-service', 'INDUSTRY', 'Professional Service', 'Professional Service', 'Professional Service', 'professional-service', '/assets/icons/briefcase.svg', 40),
  ('scale-enterprise', 'BUSINESS_SCALE', 'Enterprise', 'Enterprise', 'Enterprise', 'enterprise', NULL, 10),
  ('scale-sme', 'BUSINESS_SCALE', 'SME', 'SME', 'SME', 'sme', NULL, 20),
  ('need-internet', 'BUSINESS_NEED', 'Internet', 'Internet', 'Internet', 'internet', NULL, 10),
  ('need-proteksi-bisnis', 'BUSINESS_NEED', 'Proteksi Bisnis', 'Proteksi Bisnis', 'Business Protection', 'proteksi-bisnis', NULL, 20),
  ('need-koneksi-yang-handal', 'BUSINESS_NEED', 'Koneksi yang Handal', 'Koneksi yang Handal', 'Reliable Connection', 'koneksi-yang-handal', NULL, 30),
  ('need-jalin-komunikasi-efektif', 'BUSINESS_NEED', 'Jalin Komunikasi Efektif', 'Jalin Komunikasi Efektif', 'Effective Communication', 'jalin-komunikasi-efektif', NULL, 40),
  ('need-sistem-terintegrasi', 'BUSINESS_NEED', 'Sistem Terintegrasi', 'Sistem Terintegrasi', 'Integrated System', 'sistem-terintegrasi', NULL, 50),
  ('need-transformasi-digital', 'BUSINESS_NEED', 'Transformasi Digital', 'Transformasi Digital', 'Digital Transformation', 'transformasi-digital', NULL, 60),
  ('need-keamanan-data', 'BUSINESS_NEED', 'Keamanan Data', 'Keamanan Data', 'Data Security', 'keamanan-data', NULL, 70);

INSERT INTO "data_bank_solutions" ("id", "title", "title_id", "title_en", "slug", "description", "description_id", "description_en", "image", "banner_image", "cta_list", "sort_order", "status", "published_at")
VALUES
  ('dedicated-internet-access', 'Dedicated Internet Access', 'Dedicated Internet Access', 'Dedicated Internet Access', 'dedicated-internet-access', 'Fully support your every step with fast and reliable internet service throughout your business operations.', 'Fully support your every step with fast and reliable internet service throughout your business operations.', 'Fully support your every step with fast and reliable internet service throughout your business operations.', '/assets/bg/dedicated-internet.jpg', '/assets/bg/dedicated-internet.jpg', '[{"label":{"en":"Learn More","id":"Selengkapnya"},"href":"/solutions/dedicated-internet-access","variant":"secondary-plain","size":"md","link_type":"url","iconRight":"chevron-right"}]', 10, 'PUBLISHED', CURRENT_TIMESTAMP),
  ('datacomm', 'Datacomm', 'Datacomm', 'Datacomm', 'datacomm', 'Berikan kelancaran transaksi data antar kantor cabang secara aman, cepat, dan andal untuk mendukung operasional bisnis Anda.', 'Berikan kelancaran transaksi data antar kantor cabang secara aman, cepat, dan andal untuk mendukung operasional bisnis Anda.', 'Secure, fast, and reliable data transactions between branch offices to support your business operations.', '/assets/bg/onestreamheroimage.jpg', '/assets/bg/onestreamheroimage.jpg', '[{"label":{"en":"Learn More","id":"Selengkapnya"},"href":"/solutions/datacomm","variant":"secondary-plain","size":"md","link_type":"url","iconRight":"chevron-right"}]', 20, 'PUBLISHED', CURRENT_TIMESTAMP),
  ('vsat', 'VSAT', 'VSAT', 'VSAT', 'vsat', 'Long-distance communication solutions via satellite to stay securely connected wherever your business operates.', 'Solusi komunikasi jarak jauh melalui satelit agar bisnis tetap terhubung aman di mana pun beroperasi.', 'Long-distance communication solutions via satellite to stay securely connected wherever your business operates.', '/assets/bg/vsat.jpg', '/assets/bg/vsat.jpg', '[{"label":{"en":"Learn More","id":"Selengkapnya"},"href":"/solutions/vsat","variant":"secondary-plain","size":"md","link_type":"url","iconRight":"chevron-right"}]', 30, 'PUBLISHED', CURRENT_TIMESTAMP),
  ('metro-ethernet', 'Metro Ethernet', 'Metro Ethernet', 'Metro Ethernet', 'metro-ethernet', 'Solusi jaringan berbasis fiber optik berkecepatan tinggi untuk menghubungkan multi-site bisnis Anda di area metropolitan.', 'Solusi jaringan berbasis fiber optik berkecepatan tinggi untuk menghubungkan multi-site bisnis Anda di area metropolitan.', 'High-speed fiber optic network solution to connect your multi-site business across metropolitan areas.', '/assets/bg/metro-ethernet.jpg', '/assets/bg/metro-ethernet.jpg', '[{"label":{"en":"Learn More","id":"Selengkapnya"},"href":"/solutions/metro-ethernet","variant":"secondary-plain","size":"md","link_type":"url","iconRight":"chevron-right"}]', 40, 'PUBLISHED', CURRENT_TIMESTAMP),
  ('ict-solutions', 'ICT Solutions', 'ICT Solutions', 'ICT Solutions', 'ict-solutions', 'Tingkatkan efisiensi bisnis Anda dengan solusi teknologi informasi dan komunikasi terpadu yang dirancang untuk kebutuhan enterprise.', 'Tingkatkan efisiensi bisnis Anda dengan solusi teknologi informasi dan komunikasi terpadu yang dirancang untuk kebutuhan enterprise.', 'Improve business efficiency with integrated information and communication technology solutions designed for enterprise needs.', '/assets/bg/ict-solutions.jpg', '/assets/bg/ict-solutions.jpg', '[{"label":{"en":"Learn More","id":"Selengkapnya"},"href":"/solutions/ict-solutions","variant":"secondary-plain","size":"md","link_type":"url","iconRight":"chevron-right"}]', 50, 'PUBLISHED', CURRENT_TIMESTAMP),
  ('cybersecurity', 'Cybersecurity', 'Cybersecurity', 'Cybersecurity', 'cybersecurity', 'Lindungi aset digital dan data sensitif perusahaan Anda dari ancaman siber dengan solusi keamanan berlapis.', 'Lindungi aset digital dan data sensitif perusahaan Anda dari ancaman siber dengan solusi keamanan berlapis.', 'Protect your digital assets and sensitive company data from cyber threats with layered security solutions.', '/assets/bg/cybersecurity.jpg', '/assets/bg/cybersecurity.jpg', '[{"label":{"en":"Learn More","id":"Selengkapnya"},"href":"/solutions/cybersecurity","variant":"secondary-plain","size":"md","link_type":"url","iconRight":"chevron-right"}]', 60, 'PUBLISHED', CURRENT_TIMESTAMP),
  ('colocation', 'Colocation', 'Colocation', 'Colocation', 'colocation', 'Tempatkan server dan perangkat IT Anda di data center kami yang berstandar tinggi dengan uptime terjamin.', 'Tempatkan server dan perangkat IT Anda di data center kami yang berstandar tinggi dengan uptime terjamin.', 'Place your servers and IT equipment in our high-standard data center with reliable uptime.', '/assets/bg/colocation.jpg', '/assets/bg/colocation.jpg', '[{"label":{"en":"Learn More","id":"Selengkapnya"},"href":"/solutions/colocation","variant":"secondary-plain","size":"md","link_type":"url","iconRight":"chevron-right"}]', 70, 'PUBLISHED', CURRENT_TIMESTAMP),
  ('cloud-computing', 'Cloud Computing', 'Cloud Computing', 'Cloud Computing', 'cloud-computing', 'Skalakan infrastruktur IT bisnis Anda secara fleksibel dengan layanan cloud yang aman, andal, dan hemat biaya.', 'Skalakan infrastruktur IT bisnis Anda secara fleksibel dengan layanan cloud yang aman, andal, dan hemat biaya.', 'Scale your business IT infrastructure flexibly with secure, reliable, and cost-efficient cloud services.', '/assets/bg/cloud-computing.jpg', '/assets/bg/cloud-computing.jpg', '[{"label":{"en":"Learn More","id":"Selengkapnya"},"href":"/solutions/cloud-computing","variant":"secondary-plain","size":"md","link_type":"url","iconRight":"chevron-right"}]', 80, 'PUBLISHED', CURRENT_TIMESTAMP),
  ('cloud-backup', 'Cloud Backup', 'Cloud Backup', 'Cloud Backup', 'cloud-backup', 'Amankan data bisnis Anda secara otomatis dengan layanan backup berbasis cloud yang andal dan mudah dipulihkan kapan saja.', 'Amankan data bisnis Anda secara otomatis dengan layanan backup berbasis cloud yang andal dan mudah dipulihkan kapan saja.', 'Automatically secure your business data with reliable cloud backup that is easy to restore anytime.', '/assets/bg/cloud-backup.jpg', '/assets/bg/cloud-backup.jpg', '[{"label":{"en":"Learn More","id":"Selengkapnya"},"href":"/solutions/cloud-backup","variant":"secondary-plain","size":"md","link_type":"url","iconRight":"chevron-right"}]', 90, 'PUBLISHED', CURRENT_TIMESTAMP),
  ('disaster-recovery', 'Disaster Recovery', 'Disaster Recovery', 'Disaster Recovery', 'disaster-recovery', 'Pastikan kelangsungan bisnis Anda dengan solusi pemulihan bencana yang cepat dan terpercaya saat terjadi gangguan sistem.', 'Pastikan kelangsungan bisnis Anda dengan solusi pemulihan bencana yang cepat dan terpercaya saat terjadi gangguan sistem.', 'Ensure business continuity with fast and trusted disaster recovery when system disruptions occur.', '/assets/bg/disaster-recovery.jpg', '/assets/bg/disaster-recovery.jpg', '[{"label":{"en":"Learn More","id":"Selengkapnya"},"href":"/solutions/disaster-recovery","variant":"secondary-plain","size":"md","link_type":"url","iconRight":"chevron-right"}]', 100, 'PUBLISHED', CURRENT_TIMESTAMP),
  ('professional-service', 'Professional Service', 'Professional Service', 'Professional Service', 'professional-service', 'Solusi yang menjamin efisiensi dan keandalan infrastruktur IT, membantu bisnis beroperasi tanpa hambatan.', 'Solusi yang menjamin efisiensi dan keandalan infrastruktur IT, membantu bisnis beroperasi tanpa hambatan.', 'Solutions that ensure IT infrastructure efficiency and reliability, helping businesses operate smoothly.', '/assets/bg/professional-service.jpg', '/assets/bg/professional-service.jpg', '[{"label":{"en":"Learn More","id":"Selengkapnya"},"href":"/solutions/professional-service","variant":"secondary-plain","size":"md","link_type":"url","iconRight":"chevron-right"}]', 110, 'PUBLISHED', CURRENT_TIMESTAMP),
  ('managed-service', 'Managed Service', 'Managed Service', 'Managed Service', 'managed-service', 'Optimalkan konektivitas & ICT Solution secara efisien melalui layanan pengelolaan IT menyeluruh dari tim ahli kami.', 'Optimalkan konektivitas & ICT Solution secara efisien melalui layanan pengelolaan IT menyeluruh dari tim ahli kami.', 'Optimize connectivity and ICT solutions efficiently through complete IT management services from our experts.', '/assets/bg/managed-service.jpg', '/assets/bg/managed-service.jpg', '[{"label":{"en":"Learn More","id":"Selengkapnya"},"href":"/solutions/managed-service","variant":"secondary-plain","size":"md","link_type":"url","iconRight":"chevron-right"}]', 120, 'PUBLISHED', CURRENT_TIMESTAMP),
  ('corporate-tv', 'Corporate TV', 'Corporate TV', 'Corporate TV', 'corporate-tv', 'Penuhi ekspektasi dengan saluran TV berkualitas, siaran langsung olahraga, hiburan, dan konten bisnis premium.', 'Penuhi ekspektasi dengan saluran TV berkualitas, siaran langsung olahraga, hiburan, dan konten bisnis premium.', 'Meet expectations with quality TV channels, live sports, entertainment, and premium business content.', '/assets/bg/corporate-tv.jpg', '/assets/bg/corporate-tv.jpg', '[{"label":{"en":"Learn More","id":"Selengkapnya"},"href":"/solutions/corporate-tv","variant":"secondary-plain","size":"md","link_type":"url","iconRight":"chevron-right"}]', 130, 'PUBLISHED', CURRENT_TIMESTAMP),
  ('network-consulting', 'Network Consulting', 'Network Consulting', 'Network Consulting', 'network-consulting', 'Dapatkan rekomendasi arsitektur jaringan terbaik dari konsultan berpengalaman kami untuk transformasi digital bisnis Anda.', 'Dapatkan rekomendasi arsitektur jaringan terbaik dari konsultan berpengalaman kami untuk transformasi digital bisnis Anda.', 'Get the best network architecture recommendations from our experienced consultants for your digital transformation.', '/assets/bg/network-consulting.jpg', '/assets/bg/network-consulting.jpg', '[{"label":{"en":"Learn More","id":"Selengkapnya"},"href":"/solutions/network-consulting","variant":"secondary-plain","size":"md","link_type":"url","iconRight":"chevron-right"}]', 140, 'PUBLISHED', CURRENT_TIMESTAMP);

INSERT INTO "data_bank_solution_category_relations" ("id", "solution_id", "category_id")
VALUES
  ('rel-dia-industry', 'dedicated-internet-access', 'industry-connectivity'),
  ('rel-dia-enterprise', 'dedicated-internet-access', 'scale-enterprise'),
  ('rel-dia-sme', 'dedicated-internet-access', 'scale-sme'),
  ('rel-dia-internet', 'dedicated-internet-access', 'need-internet'),
  ('rel-dia-protection', 'dedicated-internet-access', 'need-proteksi-bisnis'),
  ('rel-dia-reliable', 'dedicated-internet-access', 'need-koneksi-yang-handal'),
  ('rel-datacomm-industry', 'datacomm', 'industry-connectivity'),
  ('rel-datacomm-enterprise', 'datacomm', 'scale-enterprise'),
  ('rel-datacomm-sme', 'datacomm', 'scale-sme'),
  ('rel-datacomm-communication', 'datacomm', 'need-jalin-komunikasi-efektif'),
  ('rel-datacomm-integrated', 'datacomm', 'need-sistem-terintegrasi'),
  ('rel-datacomm-reliable', 'datacomm', 'need-koneksi-yang-handal'),
  ('rel-vsat-industry', 'vsat', 'industry-connectivity'),
  ('rel-vsat-enterprise', 'vsat', 'scale-enterprise'),
  ('rel-vsat-communication', 'vsat', 'need-jalin-komunikasi-efektif'),
  ('rel-vsat-protection', 'vsat', 'need-proteksi-bisnis'),
  ('rel-vsat-reliable', 'vsat', 'need-koneksi-yang-handal'),
  ('rel-metro-industry', 'metro-ethernet', 'industry-connectivity'),
  ('rel-metro-enterprise', 'metro-ethernet', 'scale-enterprise'),
  ('rel-metro-communication', 'metro-ethernet', 'need-jalin-komunikasi-efektif'),
  ('rel-metro-integrated', 'metro-ethernet', 'need-sistem-terintegrasi'),
  ('rel-metro-reliable', 'metro-ethernet', 'need-koneksi-yang-handal'),
  ('rel-ict-industry', 'ict-solutions', 'industry-ict-solutions'),
  ('rel-ict-enterprise', 'ict-solutions', 'scale-enterprise'),
  ('rel-ict-protection', 'ict-solutions', 'need-proteksi-bisnis'),
  ('rel-ict-digital', 'ict-solutions', 'need-transformasi-digital'),
  ('rel-cyber-industry', 'cybersecurity', 'industry-ict-solutions'),
  ('rel-cyber-enterprise', 'cybersecurity', 'scale-enterprise'),
  ('rel-cyber-protection', 'cybersecurity', 'need-proteksi-bisnis'),
  ('rel-cyber-data', 'cybersecurity', 'need-keamanan-data'),
  ('rel-colocation-industry', 'colocation', 'industry-ict-solutions'),
  ('rel-colocation-enterprise', 'colocation', 'scale-enterprise'),
  ('rel-colocation-protection', 'colocation', 'need-proteksi-bisnis'),
  ('rel-colocation-reliable', 'colocation', 'need-koneksi-yang-handal'),
  ('rel-colocation-digital', 'colocation', 'need-transformasi-digital'),
  ('rel-cloud-computing-industry', 'cloud-computing', 'industry-cloud'),
  ('rel-cloud-computing-enterprise', 'cloud-computing', 'scale-enterprise'),
  ('rel-cloud-computing-protection', 'cloud-computing', 'need-proteksi-bisnis'),
  ('rel-cloud-computing-reliable', 'cloud-computing', 'need-koneksi-yang-handal'),
  ('rel-cloud-computing-digital', 'cloud-computing', 'need-transformasi-digital'),
  ('rel-cloud-backup-industry', 'cloud-backup', 'industry-cloud'),
  ('rel-cloud-backup-enterprise', 'cloud-backup', 'scale-enterprise'),
  ('rel-cloud-backup-sme', 'cloud-backup', 'scale-sme'),
  ('rel-cloud-backup-protection', 'cloud-backup', 'need-proteksi-bisnis'),
  ('rel-cloud-backup-data', 'cloud-backup', 'need-keamanan-data'),
  ('rel-disaster-industry', 'disaster-recovery', 'industry-cloud'),
  ('rel-disaster-enterprise', 'disaster-recovery', 'scale-enterprise'),
  ('rel-disaster-protection', 'disaster-recovery', 'need-proteksi-bisnis'),
  ('rel-disaster-data', 'disaster-recovery', 'need-keamanan-data'),
  ('rel-disaster-reliable', 'disaster-recovery', 'need-koneksi-yang-handal'),
  ('rel-professional-industry', 'professional-service', 'industry-professional-service'),
  ('rel-professional-enterprise', 'professional-service', 'scale-enterprise'),
  ('rel-professional-sme', 'professional-service', 'scale-sme'),
  ('rel-professional-communication', 'professional-service', 'need-jalin-komunikasi-efektif'),
  ('rel-professional-protection', 'professional-service', 'need-proteksi-bisnis'),
  ('rel-managed-industry', 'managed-service', 'industry-professional-service'),
  ('rel-managed-enterprise', 'managed-service', 'scale-enterprise'),
  ('rel-managed-communication', 'managed-service', 'need-jalin-komunikasi-efektif'),
  ('rel-managed-protection', 'managed-service', 'need-proteksi-bisnis'),
  ('rel-managed-reliable', 'managed-service', 'need-koneksi-yang-handal'),
  ('rel-corporate-tv-industry', 'corporate-tv', 'industry-professional-service'),
  ('rel-corporate-tv-enterprise', 'corporate-tv', 'scale-enterprise'),
  ('rel-corporate-tv-communication', 'corporate-tv', 'need-jalin-komunikasi-efektif'),
  ('rel-corporate-tv-protection', 'corporate-tv', 'need-proteksi-bisnis'),
  ('rel-corporate-tv-reliable', 'corporate-tv', 'need-koneksi-yang-handal'),
  ('rel-network-consulting-industry', 'network-consulting', 'industry-professional-service'),
  ('rel-network-consulting-enterprise', 'network-consulting', 'scale-enterprise'),
  ('rel-network-consulting-digital', 'network-consulting', 'need-transformasi-digital'),
  ('rel-network-consulting-reliable', 'network-consulting', 'need-koneksi-yang-handal');
