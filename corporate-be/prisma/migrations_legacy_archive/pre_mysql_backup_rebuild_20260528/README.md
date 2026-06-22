# Legacy Migration Archive

Created: 2026-05-28

This folder keeps the pre-rebuild Prisma migration history for audit only.

Reason:

- The active database rebuild uses the latest MySQL backup as the primary data source.
- The old migration set had many incremental changes, two `init` migrations, and manual SQL files.
- Some old migrations contained destructive operations such as `DROP`, so they should not be part of a fresh rebuild path.

Active migration path after this archive:

- `prisma/migrations/migration_lock.toml`
- `prisma/migrations/20260528090000_baseline_from_mysql_backup/migration.sql`

Do not delete this archive until staging and production cutover validation are complete. If an old migration is needed for forensic comparison, inspect it here rather than re-enabling it in the active migration folder.
