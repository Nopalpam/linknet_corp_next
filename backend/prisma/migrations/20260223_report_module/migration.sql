-- Drop old UUID-based report tables (from previous schema design)
DROP TABLE IF EXISTS "reports" CASCADE;
DROP TABLE IF EXISTS "report_sections" CASCADE;
DROP TABLE IF EXISTS "report_types" CASCADE;

-- CreateTable: report_types
CREATE TABLE "report_types" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(10) NOT NULL DEFAULT 'Grid',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "report_types_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "report_types_type_check" CHECK ("type" IN ('Grid', 'List'))
);

-- CreateTable: report_sections
CREATE TABLE "report_sections" (
    "id" BIGSERIAL NOT NULL,
    "report_type_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "report_year" INTEGER,
    "cta_enabled" BOOLEAN NOT NULL DEFAULT true,
    "cta_text" VARCHAR(255),
    "cta_url" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "report_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable: report_items
CREATE TABLE "report_items" (
    "id" BIGSERIAL NOT NULL,
    "report_type_id" BIGINT,
    "report_section_id" BIGINT,
    "title" VARCHAR(255) NOT NULL,
    "sub_description" TEXT,
    "pdf_file" TEXT,
    "cover_image" VARCHAR(255),
    "data_type" VARCHAR(20),
    "audit_status" VARCHAR(20),
    "file_size" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "report_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "report_items_data_type_check" CHECK ("data_type" IS NULL OR "data_type" IN ('Consolidated', 'Interim')),
    CONSTRAINT "report_items_audit_status_check" CHECK ("audit_status" IS NULL OR "audit_status" IN ('Audited', 'Unaudited', 'Limited Review'))
);

-- CreateIndex: report_types
CREATE INDEX "report_types_type_idx" ON "report_types"("type");
CREATE INDEX "report_types_sort_order_idx" ON "report_types"("sort_order");
CREATE INDEX "report_types_is_active_idx" ON "report_types"("is_active");
CREATE INDEX "report_types_deleted_at_idx" ON "report_types"("deleted_at");

-- Partial index for soft delete
CREATE INDEX "report_types_active_idx" ON "report_types"("id") WHERE "deleted_at" IS NULL;

-- CreateIndex: report_sections
CREATE INDEX "report_sections_report_type_id_idx" ON "report_sections"("report_type_id");
CREATE INDEX "report_sections_report_year_idx" ON "report_sections"("report_year");
CREATE INDEX "report_sections_sort_order_idx" ON "report_sections"("sort_order");
CREATE INDEX "report_sections_is_active_idx" ON "report_sections"("is_active");
CREATE INDEX "report_sections_deleted_at_idx" ON "report_sections"("deleted_at");

-- Partial index for soft delete
CREATE INDEX "report_sections_active_idx" ON "report_sections"("id") WHERE "deleted_at" IS NULL;

-- CreateIndex: report_items
CREATE INDEX "report_items_report_type_id_idx" ON "report_items"("report_type_id");
CREATE INDEX "report_items_report_section_id_idx" ON "report_items"("report_section_id");
CREATE INDEX "report_items_data_type_idx" ON "report_items"("data_type");
CREATE INDEX "report_items_audit_status_idx" ON "report_items"("audit_status");
CREATE INDEX "report_items_sort_order_idx" ON "report_items"("sort_order");
CREATE INDEX "report_items_is_active_idx" ON "report_items"("is_active");
CREATE INDEX "report_items_deleted_at_idx" ON "report_items"("deleted_at");

-- Partial index for soft delete
CREATE INDEX "report_items_active_idx" ON "report_items"("id") WHERE "deleted_at" IS NULL;

-- AddForeignKey
ALTER TABLE "report_sections" ADD CONSTRAINT "report_sections_report_type_id_fkey" FOREIGN KEY ("report_type_id") REFERENCES "report_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "report_items" ADD CONSTRAINT "report_items_report_type_id_fkey" FOREIGN KEY ("report_type_id") REFERENCES "report_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "report_items" ADD CONSTRAINT "report_items_report_section_id_fkey" FOREIGN KEY ("report_section_id") REFERENCES "report_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- After data import, reset sequences:
-- SELECT setval('report_types_id_seq', COALESCE((SELECT MAX(id) FROM report_types), 1));
-- SELECT setval('report_sections_id_seq', COALESCE((SELECT MAX(id) FROM report_sections), 1));
-- SELECT setval('report_items_id_seq', COALESCE((SELECT MAX(id) FROM report_items), 1));
