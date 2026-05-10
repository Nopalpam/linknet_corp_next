CREATE TABLE IF NOT EXISTS "map_coverage_regions" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL DEFAULT 'Area',
  "title" TEXT NOT NULL,
  "color" TEXT,
  "province_keys" JSONB NOT NULL DEFAULT '[]',
  "cities" JSONB NOT NULL DEFAULT '[]',
  "lat" DOUBLE PRECISION,
  "lon" DOUBLE PRECISION,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_by" TEXT,
  "updated_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "map_coverage_regions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "map_coverage_regions_code_key" ON "map_coverage_regions"("code");
CREATE INDEX IF NOT EXISTS "map_coverage_regions_is_active_idx" ON "map_coverage_regions"("is_active");
CREATE INDEX IF NOT EXISTS "map_coverage_regions_sort_order_idx" ON "map_coverage_regions"("sort_order");
CREATE INDEX IF NOT EXISTS "map_coverage_regions_deleted_at_idx" ON "map_coverage_regions"("deleted_at");
