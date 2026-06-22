-- Migration: Update RefreshToken table for token rotation
-- This migration adds tokenId and tokenHash fields and removes the old token field

-- Step 1: Add new columns
ALTER TABLE refresh_tokens 
  ADD COLUMN token_id VARCHAR(255),
  ADD COLUMN token_hash TEXT;

-- Step 2: Migrate existing data (if any)
-- Convert existing tokens to hashed format
-- Note: This is a one-time migration, existing tokens will be invalidated
UPDATE refresh_tokens 
SET 
  token_id = gen_random_uuid()::text,
  token_hash = encode(digest(token, 'sha256'), 'hex')
WHERE token_id IS NULL;

-- Step 3: Make new columns NOT NULL after migration
ALTER TABLE refresh_tokens 
  ALTER COLUMN token_id SET NOT NULL,
  ALTER COLUMN token_hash SET NOT NULL;

-- Step 4: Add unique constraints
ALTER TABLE refresh_tokens 
  ADD CONSTRAINT refresh_tokens_token_id_key UNIQUE (token_id),
  ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS refresh_tokens_token_id_idx ON refresh_tokens(token_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_token_hash_idx ON refresh_tokens(token_hash);

-- Step 6: Drop old token column
ALTER TABLE refresh_tokens DROP COLUMN token;

-- Step 7: Verify the migration
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'refresh_tokens';
