-- ============================================
-- CAREER CMS - PostgreSQL Schema
-- Migration from Laravel MySQL to Express.js + PostgreSQL
-- Created: 2026-02-22
-- ============================================

-- Drop existing table if exists (fresh start for Career module)
DROP TABLE IF EXISTS career_content CASCADE;

-- ============================================
-- TABLE: career_content
-- Description: Stores career/job position data
-- Compatible with MySQL Laravel legacy system
-- ============================================
CREATE TABLE career_content (
    id              BIGSERIAL       PRIMARY KEY,
    position        VARCHAR(255)    NOT NULL,
    slug            VARCHAR(255),
    division        VARCHAR(255),
    type            VARCHAR(100),
    link_job        VARCHAR(500),
    location        VARCHAR(255),
    description     TEXT,
    description_id  TEXT,
    requirements    TEXT,
    requirements_id TEXT,
    status          VARCHAR(20)     NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'inactive', 'scheduled')),
    expiry_date     TIMESTAMP,
    created_at      TIMESTAMP(0)    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP(0)    DEFAULT CURRENT_TIMESTAMP,
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255)
);

-- ============================================
-- COMMENTS for documentation
-- ============================================
COMMENT ON TABLE  career_content                    IS 'Career positions - migrated from Laravel MySQL';
COMMENT ON COLUMN career_content.id                 IS 'Auto-increment primary key (BIGSERIAL for MySQL compatibility)';
COMMENT ON COLUMN career_content.position           IS 'Job position title (required)';
COMMENT ON COLUMN career_content.slug               IS 'SEO-friendly URL slug (auto-generated from position, unique, case-insensitive)';
COMMENT ON COLUMN career_content.division           IS 'Company division/department';
COMMENT ON COLUMN career_content.type               IS 'Employment type (Full-time, Part-time, Contract, Internship)';
COMMENT ON COLUMN career_content.link_job           IS 'External job portal link';
COMMENT ON COLUMN career_content.location           IS 'Job location (city or remote)';
COMMENT ON COLUMN career_content.description        IS 'Job description in English';
COMMENT ON COLUMN career_content.description_id     IS 'Job description in Bahasa Indonesia';
COMMENT ON COLUMN career_content.requirements       IS 'Job requirements in English';
COMMENT ON COLUMN career_content.requirements_id    IS 'Job requirements in Bahasa Indonesia';
COMMENT ON COLUMN career_content.status             IS 'Position status: active, inactive, scheduled';
COMMENT ON COLUMN career_content.expiry_date        IS 'Position expiry date (NULL = no expiration)';
COMMENT ON COLUMN career_content.created_at         IS 'Record creation timestamp';
COMMENT ON COLUMN career_content.updated_at         IS 'Record last update timestamp';
COMMENT ON COLUMN career_content.created_by         IS 'Email of user who created the record';
COMMENT ON COLUMN career_content.updated_by         IS 'Email of user who last updated the record';

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Unique case-insensitive slug index
CREATE UNIQUE INDEX idx_career_content_slug_unique
    ON career_content (LOWER(slug));

-- Status index for filtering
CREATE INDEX idx_career_content_status
    ON career_content (status);

-- Expiry date index for auto-expiry checks
CREATE INDEX idx_career_content_expiry_date
    ON career_content (expiry_date);

-- Location index for filtering
CREATE INDEX idx_career_content_location
    ON career_content (location);

-- Type index for filtering
CREATE INDEX idx_career_content_type
    ON career_content (type);

-- Division index for filtering
CREATE INDEX idx_career_content_division
    ON career_content (division);

-- Created at descending for default sorting
CREATE INDEX idx_career_content_created_at_desc
    ON career_content (created_at DESC);

-- Composite partial index for published scope (most important query)
-- Covers: WHERE status = 'active' AND (expiry_date IS NULL OR expiry_date > NOW())
CREATE INDEX idx_career_published
    ON career_content (status, expiry_date)
    WHERE status = 'active';

-- ============================================
-- TRIGGER: Auto-update updated_at on UPDATE
-- ============================================
CREATE OR REPLACE FUNCTION update_career_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_career_content_updated_at
    BEFORE UPDATE ON career_content
    FOR EACH ROW
    EXECUTE FUNCTION update_career_content_updated_at();

-- ============================================
-- SAMPLE DATA for testing (optional)
-- ============================================
-- INSERT INTO career_content (position, slug, division, type, link_job, location, description, description_id, requirements, requirements_id, status, created_by)
-- VALUES
-- ('Senior Software Engineer', 'senior-software-engineer', 'Technology', 'Full-time', 'https://jobs.example.com/sse', 'Jakarta', 'We are looking for...', 'Kami mencari...', '5+ years experience...', '5+ tahun pengalaman...', 'active', 'admin@linknet.co.id'),
-- ('Network Engineer', 'network-engineer', 'Infrastructure', 'Full-time', NULL, 'Surabaya', 'Join our team...', 'Bergabunglah...', '3+ years...', '3+ tahun...', 'active', 'admin@linknet.co.id');

SELECT 'Career Content schema created successfully!' AS result;
