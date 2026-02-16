-- MBSS2.0-ApplicationCoding-008: Failed login attempt tracking & account lockout
-- MBSS2.0-ApplicationCoding-009: Password age tracking
-- MBSS2.0-ApplicationCoding-010: First-time login password change requirement
-- MBSS2.0-ApplicationCoding-011: Password history to prevent reuse

-- Add new columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "failed_login_attempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locked_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locked_reason" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "must_change_password" BOOLEAN NOT NULL DEFAULT true;

-- Create password_histories table for MBSS2.0-011
CREATE TABLE IF NOT EXISTS "password_histories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_histories_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "password_histories_user_id_idx" ON "password_histories"("user_id");
CREATE INDEX IF NOT EXISTS "password_histories_created_at_idx" ON "password_histories"("created_at");

-- Add foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'password_histories_user_id_fkey'
    ) THEN
        ALTER TABLE "password_histories"
            ADD CONSTRAINT "password_histories_user_id_fkey"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Set existing users to NOT require password change (they are already active)
-- Only new users created after this migration should require password change
UPDATE "users" SET "must_change_password" = false WHERE "status" = 'ACTIVE';
