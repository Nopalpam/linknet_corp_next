-- AlterTable: Add new columns to log_activities table
ALTER TABLE "log_activities" 
ADD COLUMN "record_id" TEXT,
ADD COLUMN "old_data" JSONB,
ADD COLUMN "new_data" JSONB,
ADD COLUMN "deleted_at" TIMESTAMP(3);

-- CreateIndex: Add index for record_id
CREATE INDEX "log_activities_record_id_idx" ON "log_activities"("record_id");

-- CreateIndex: Add index for deleted_at
CREATE INDEX "log_activities_deleted_at_idx" ON "log_activities"("deleted_at");

-- Update existing records: Set appropriate comments for action field
COMMENT ON COLUMN "log_activities"."action" IS 'Action types: create, update, delete, login, logout, etc.';
COMMENT ON COLUMN "log_activities"."module" IS 'Module names: users, news, pages, roles, permissions, etc.';
COMMENT ON COLUMN "log_activities"."record_id" IS 'ID of the affected record';
COMMENT ON COLUMN "log_activities"."old_data" IS 'Previous state (for updates/deletes)';
COMMENT ON COLUMN "log_activities"."new_data" IS 'New state (for creates/updates)';
