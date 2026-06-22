#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const backendRoot = path.resolve(__dirname, '..', '..');
const workspaceRoot = path.resolve(backendRoot, '..');
const backupSqlPath = process.env.LEGACY_BACKUP_SQL
  ? path.resolve(process.env.LEGACY_BACKUP_SQL)
  : path.join(workspaceRoot, 'linknet_bersih_newest_migration.sql');

const outputRoot = path.join(backendRoot, 'database', 'db-rebuild');
const docsRoot = path.join(backendRoot, 'docs', 'db-rebuild');
const rawSqlPath = path.join(outputRoot, 'linknet_bersih_legacy_raw.postgres.sql');
const canonicalSqlPath = path.join(outputRoot, 'import_legacy_canonical.sql');
const validationSqlPath = path.join(outputRoot, 'validate_legacy_rebuild.sql');

const LEGACY_TABLES = [
  'announcement_items',
  'announcement_sections',
  'announcement_types',
  'awards',
  'career_content',
  'contact_us',
  'managements',
  'management_categories',
  'menus',
  'news_category',
  'news_content',
  'news_highlight',
  'permissions',
  'report_items',
  'report_sections',
  'report_types',
  'roles',
  'role_permission',
  'tb_url_redirect',
  'users',
  'user_role',
];

const CANONICAL_TARGET_TABLES = [
  'announcement_types',
  'announcement_sections',
  'announcements',
  'awards',
  'career_content',
  'contact_us',
  'management_categories',
  'managements',
  'menus',
  'news_categories',
  'news',
  'news_highlights',
  'permissions',
  'report_types',
  'report_sections',
  'reports',
  'roles',
  'role_permissions',
  'url_redirects',
  'users',
  'user_roles',
];

const UUID_MAPPINGS = [
  ['announcement_items', 'announcements'],
  ['announcement_sections', 'announcement_sections'],
  ['announcement_types', 'announcement_types'],
  ['awards', 'awards'],
  ['contact_us', 'contact_us'],
  ['management_categories', 'management_categories'],
  ['managements', 'managements'],
  ['news_category', 'news_categories'],
  ['news_content', 'news'],
  ['news_highlight', 'news_highlights'],
  ['permissions', 'permissions'],
  ['report_items', 'reports'],
  ['report_sections', 'report_sections'],
  ['report_types', 'report_types'],
  ['roles', 'roles'],
  ['role_permission', 'role_permissions'],
  ['tb_url_redirect', 'url_redirects'],
  ['users', 'users'],
  ['user_role', 'user_roles'],
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sqlIdentifier(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

function postgresObjectName(...parts) {
  const raw = parts.join('_').replace(/[^a-zA-Z0-9_]+/g, '_');
  if (raw.length <= 60) {
    return raw;
  }

  return `${raw.slice(0, 50)}_${crypto.createHash('sha1').update(raw).digest('hex').slice(0, 8)}`;
}

function sqlString(value) {
  return `'${String(value).replace(/\u0000/g, '').replace(/'/g, "''")}'`;
}

function decodeMysqlEscape(ch) {
  switch (ch) {
    case '0':
      return '\0';
    case 'b':
      return '\b';
    case 'n':
      return '\n';
    case 'r':
      return '\r';
    case 't':
      return '\t';
    case 'Z':
      return String.fromCharCode(26);
    default:
      return ch;
  }
}

function splitTopLevelComma(value) {
  const parts = [];
  let current = '';
  let quote = null;
  let depth = 0;

  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    if (quote) {
      current += ch;
      if (ch === quote && value[i - 1] !== '\\') {
        quote = null;
      }
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      current += ch;
      continue;
    }

    if (ch === '(') {
      depth += 1;
      current += ch;
      continue;
    }

    if (ch === ')') {
      depth -= 1;
      current += ch;
      continue;
    }

    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }

    current += ch;
  }

  if (current.trim()) {
    parts.push(current.trim());
  }
  return parts;
}

function parseColumnLine(line) {
  const match = line.match(/^\s*`([^`]+)`\s+(.+?)(?:,\s*)?$/);
  if (!match) {
    return null;
  }

  const name = match[1];
  const spec = match[2].trim();
  const lower = spec.toLowerCase();
  const enumMatch = spec.match(/enum\((.*?)\)/i);
  const defaultMatch = spec.match(/\bDEFAULT\s+(.+?)(?:\s+ON\s+UPDATE|\s*$)/i);

  return {
    name,
    mysql: spec,
    pg: mapMysqlTypeToPostgres(spec),
    nullable: !/\bNOT NULL\b/i.test(spec),
    defaultValue: defaultMatch ? defaultMatch[1].replace(/,$/, '') : null,
    enumValues: enumMatch ? parseEnumValues(enumMatch[1]) : [],
    autoIncrement: /\bAUTO_INCREMENT\b/i.test(spec),
  };
}

function parseEnumValues(raw) {
  return splitTopLevelComma(raw).map((part) => part.trim().replace(/^'/, '').replace(/'$/, ''));
}

function mapMysqlTypeToPostgres(spec) {
  const lower = spec.toLowerCase();
  if (/\btinyint\s*\(\s*1\s*\)/.test(lower)) {
    return 'boolean';
  }
  if (/\bbigint\b/.test(lower)) {
    return 'bigint';
  }
  if (/\bint\b/.test(lower) || /\binteger\b/.test(lower)) {
    return 'integer';
  }
  if (/\btinyint\b/.test(lower)) {
    return 'smallint';
  }
  if (/\bdatetime\b/.test(lower) || /\btimestamp\b/.test(lower)) {
    return 'timestamp';
  }
  if (/\bdate\b/.test(lower)) {
    return 'date';
  }
  if (/\bjson\b/.test(lower)) {
    return 'jsonb';
  }
  if (/\b(blob|binary|varbinary)\b/.test(lower)) {
    return 'bytea';
  }
  return 'text';
}

function parseColumnsFromCreate(sql) {
  const tables = new Map();
  const createRe = /CREATE TABLE\s+`([^`]+)`\s+\(([\s\S]*?)\)\s+ENGINE=/g;
  let match;
  while ((match = createRe.exec(sql)) !== null) {
    const [, tableName, body] = match;
    const columns = body
      .split(/\r?\n/)
      .map(parseColumnLine)
      .filter(Boolean);

    tables.set(tableName, {
      name: tableName,
      columns,
      primaryKey: [],
      uniqueKeys: [],
      indexes: [],
      autoIncrement: null,
      rows: [],
    });
  }
  return tables;
}

function parseAlterMetadata(sql, tables) {
  const alterRe = /ALTER TABLE\s+`([^`]+)`\s+([\s\S]*?);/g;
  let match;
  while ((match = alterRe.exec(sql)) !== null) {
    const [, tableName, body] = match;
    const table = tables.get(tableName);
    if (!table) {
      continue;
    }

    const pkMatch = body.match(/ADD PRIMARY KEY\s+\(([^)]+)\)/i);
    if (pkMatch) {
      table.primaryKey = parseIndexColumns(pkMatch[1]);
    }

    for (const uniqueMatch of body.matchAll(/ADD UNIQUE KEY\s+`([^`]+)`\s+\(([^)]+)\)/gi)) {
      table.uniqueKeys.push({
        name: uniqueMatch[1],
        columns: parseIndexColumns(uniqueMatch[2]),
      });
    }

    for (const indexMatch of body.matchAll(/ADD KEY\s+`([^`]+)`\s+\(([^)]+)\)/gi)) {
      table.indexes.push({
        name: indexMatch[1],
        columns: parseIndexColumns(indexMatch[2]),
      });
    }

    const autoMatch = body.match(/MODIFY\s+`([^`]+)`[\s\S]*?AUTO_INCREMENT(?:=(\d+))?/i);
    if (autoMatch) {
      table.autoIncrement = {
        column: autoMatch[1],
        nextValue: autoMatch[2] ? Number(autoMatch[2]) : null,
      };
      const column = table.columns.find((item) => item.name === autoMatch[1]);
      if (column) {
        column.autoIncrement = true;
      }
    }
  }
}

function parseIndexColumns(raw) {
  return [...raw.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
}

function findStatementEnd(sql, start) {
  let inString = false;
  let escapeNext = false;
  for (let i = start; i < sql.length; i += 1) {
    const ch = sql[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (inString && ch === '\\') {
      escapeNext = true;
      continue;
    }
    if (ch === "'") {
      inString = !inString;
      continue;
    }
    if (ch === ';' && !inString) {
      return i;
    }
  }
  return sql.length;
}

function parseMysqlValues(valuesSql) {
  const rows = [];
  let row = null;
  let token = '';
  let quoted = false;
  let inString = false;
  let escapeNext = false;

  function pushToken() {
    const raw = token.trim();
    if (!quoted && /^null$/i.test(raw)) {
      row.push(null);
    } else if (!quoted && raw === '') {
      row.push(null);
    } else {
      row.push({ value: quoted ? token : raw, quoted });
    }
    token = '';
    quoted = false;
  }

  for (let i = 0; i < valuesSql.length; i += 1) {
    const ch = valuesSql[i];

    if (!row) {
      if (ch === '(') {
        row = [];
        token = '';
        quoted = false;
      }
      continue;
    }

    if (inString) {
      if (escapeNext) {
        token += decodeMysqlEscape(ch);
        escapeNext = false;
        continue;
      }
      if (ch === '\\') {
        escapeNext = true;
        continue;
      }
      if (ch === "'") {
        if (valuesSql[i + 1] === "'") {
          token += "'";
          i += 1;
          continue;
        }
        inString = false;
        continue;
      }
      token += ch;
      continue;
    }

    if (ch === "'") {
      inString = true;
      quoted = true;
      continue;
    }

    if (ch === ',') {
      pushToken();
      continue;
    }

    if (ch === ')') {
      pushToken();
      rows.push(row);
      row = null;
      continue;
    }

    token += ch;
  }

  return rows;
}

function parseInserts(sql, tables) {
  const insertRe = /INSERT INTO\s+`([^`]+)`(?:\s*\(([^)]*)\))?\s+VALUES\s*/g;
  let match;
  while ((match = insertRe.exec(sql)) !== null) {
    const [, tableName, rawColumns] = match;
    const table = tables.get(tableName);
    if (!table) {
      continue;
    }

    const statementEnd = findStatementEnd(sql, insertRe.lastIndex);
    const valuesSql = sql.slice(insertRe.lastIndex, statementEnd);
    const columns = rawColumns
      ? [...rawColumns.matchAll(/`([^`]+)`/g)].map((item) => item[1])
      : table.columns.map((column) => column.name);

    for (const values of parseMysqlValues(valuesSql)) {
      const row = {};
      columns.forEach((columnName, index) => {
        row[columnName] = values[index] === undefined ? null : values[index];
      });
      table.rows.push(row);
    }

    insertRe.lastIndex = statementEnd + 1;
  }
}

function getRawValue(row, columnName) {
  const value = row[columnName];
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')
    ? value.value
    : value;
}

function postgresLiteral(cell, column) {
  if (cell === null || cell === undefined) {
    return 'NULL';
  }
  const value = typeof cell === 'object' ? cell.value : String(cell);
  const pgType = column.pg;

  if (pgType === 'boolean') {
    if (/^(1|true|yes|y)$/i.test(String(value))) {
      return 'TRUE';
    }
    if (/^(0|false|no|n)$/i.test(String(value))) {
      return 'FALSE';
    }
    return 'NULL';
  }

  if (pgType === 'integer' || pgType === 'bigint' || pgType === 'smallint') {
    if (/^-?\d+$/.test(String(value))) {
      return String(value);
    }
    return 'NULL';
  }

  if ((pgType === 'timestamp' || pgType === 'date') && /^0{4}-0{2}-0{2}/.test(String(value))) {
    return 'NULL';
  }

  if (pgType === 'jsonb') {
    return `${sqlString(value)}::jsonb`;
  }

  if (pgType === 'bytea') {
    return `${sqlString(value)}::bytea`;
  }

  return sqlString(value);
}

function generateRawSql(tables) {
  const lines = [
    '-- Generated by scripts/db-rebuild/generate-rebuild-artifacts.cjs',
    '-- Purpose: raw audit import of the MySQL backup into schema legacy_raw.',
    '-- This file is not the runtime application schema.',
    '',
    'BEGIN;',
    '',
    "DO $$",
    'BEGIN',
    "  IF lower(coalesce(current_setting('legacy_rebuild.allow_import', true), '')) <> 'true' THEN",
    "    RAISE EXCEPTION 'Refusing legacy raw import. Run only on local/staging and set legacy_rebuild.allow_import=true for this session.';",
    '  END IF;',
    "  IF current_database() ~* '(prod|production)' THEN",
    "    RAISE EXCEPTION 'Refusing to import into a database whose name looks like production: %', current_database();",
    '  END IF;',
    'END $$;',
    '',
    'CREATE SCHEMA IF NOT EXISTS legacy_raw;',
    '',
  ];

  for (const tableName of LEGACY_TABLES) {
    const table = tables.get(tableName);
    if (!table) {
      continue;
    }

    lines.push(`CREATE TABLE IF NOT EXISTS legacy_raw.${sqlIdentifier(tableName)} (`);
    const columnLines = table.columns.map((column) => `  ${sqlIdentifier(column.name)} ${column.pg}`);
    if (table.primaryKey.length > 0) {
      columnLines.push(
        `  CONSTRAINT ${sqlIdentifier(postgresObjectName('lr', tableName, 'pkey'))} PRIMARY KEY (${table.primaryKey
          .map(sqlIdentifier)
          .join(', ')})`,
      );
    }
    for (const unique of table.uniqueKeys) {
      columnLines.push(
        `  CONSTRAINT ${sqlIdentifier(postgresObjectName('lr', tableName, unique.name, 'uniq'))} UNIQUE (${unique.columns
          .map(sqlIdentifier)
          .join(', ')})`,
      );
    }
    lines.push(columnLines.join(',\n'));
    lines.push(');');
    lines.push('');
  }

  for (const tableName of LEGACY_TABLES) {
    const table = tables.get(tableName);
    if (!table) {
      continue;
    }
    for (const index of table.indexes) {
      lines.push(
        `CREATE INDEX IF NOT EXISTS ${sqlIdentifier(postgresObjectName('lr', tableName, index.name, 'idx'))} ON legacy_raw.${sqlIdentifier(
          tableName,
        )} (${index.columns.map(sqlIdentifier).join(', ')});`,
      );
    }
  }
  lines.push('');

  for (const tableName of LEGACY_TABLES) {
    const table = tables.get(tableName);
    if (!table || table.rows.length === 0) {
      continue;
    }

    lines.push('DO $$');
    lines.push('BEGIN');
    lines.push(
      `  IF EXISTS (SELECT 1 FROM legacy_raw.${sqlIdentifier(tableName)} LIMIT 1) THEN`,
    );
    lines.push(
      `    RAISE EXCEPTION 'legacy_raw.${tableName} already has rows. Use a fresh local/staging database for import validation.';`,
    );
    lines.push('  END IF;');
    lines.push('END $$;');
    lines.push('');

    const columnList = table.columns.map((column) => sqlIdentifier(column.name)).join(', ');
    const chunks = [];
    for (let index = 0; index < table.rows.length; index += 100) {
      chunks.push(table.rows.slice(index, index + 100));
    }

    for (const chunk of chunks) {
      lines.push(`INSERT INTO legacy_raw.${sqlIdentifier(tableName)} (${columnList}) VALUES`);
      lines.push(
        chunk
          .map((row) => {
            const values = table.columns.map((column) => postgresLiteral(row[column.name], column));
            return `  (${values.join(', ')})`;
          })
          .join(',\n') + ';',
      );
      lines.push('');
    }
  }

  lines.push('COMMIT;');
  lines.push('');
  return lines.join('\n');
}

function generateCanonicalSql() {
  const targetTablesSqlArray = CANONICAL_TARGET_TABLES.map(sqlString).join(', ');
  const mappingSql = UUID_MAPPINGS.map(
    ([source, target]) =>
      `INSERT INTO legacy_raw.legacy_import_mappings (source_table, old_id, target_table, new_id)
SELECT ${sqlString(source)}, id::text, ${sqlString(target)}, gen_random_uuid()::text
FROM legacy_raw.${sqlIdentifier(source)};`,
  ).join('\n\n');

  return `-- Generated by scripts/db-rebuild/generate-rebuild-artifacts.cjs
-- Purpose: import audited legacy_raw data into the Prisma-compatible public schema.
-- Run this only after baseline Prisma migration has created an empty public schema.

BEGIN;

DO $$
DECLARE
  target_table text;
  existing_rows bigint;
BEGIN
  IF lower(coalesce(current_setting('legacy_rebuild.allow_import', true), '')) <> 'true' THEN
    RAISE EXCEPTION 'Refusing canonical legacy import. Run only on local/staging and set legacy_rebuild.allow_import=true for this session.';
  END IF;

  IF current_database() ~* '(prod|production)' THEN
    RAISE EXCEPTION 'Refusing to import into a database whose name looks like production: %', current_database();
  END IF;

  IF to_regnamespace('legacy_raw') IS NULL THEN
    RAISE EXCEPTION 'legacy_raw schema is missing. Run linknet_bersih_legacy_raw.postgres.sql first.';
  END IF;

  FOREACH target_table IN ARRAY ARRAY[${targetTablesSqlArray}] LOOP
    IF to_regclass(format('public.%I', target_table)) IS NULL THEN
      RAISE EXCEPTION 'Expected target table public.% does not exist. Run Prisma baseline migration first.', target_table;
    END IF;

    EXECUTE format('SELECT count(*) FROM public.%I', target_table) INTO existing_rows;
    IF existing_rows > 0 THEN
      RAISE EXCEPTION 'Refusing import because public.% already has % row(s). Use a fresh local/staging database.', target_table, existing_rows;
    END IF;
  END LOOP;

  IF NOT EXISTS (SELECT 1 FROM legacy_raw.users LIMIT 1) THEN
    RAISE EXCEPTION 'Legacy users table is empty; news import requires a fallback created_by_id user.';
  END IF;
END $$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION legacy_raw.slugify(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'));
$$;

CREATE OR REPLACE FUNCTION legacy_raw.is_valid_jsonb(value text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF value IS NULL OR btrim(value) = '' THEN
    RETURN true;
  END IF;
  PERFORM value::jsonb;
  RETURN true;
EXCEPTION WHEN others THEN
  RETURN false;
END;
$$;

CREATE TABLE IF NOT EXISTS legacy_raw.legacy_import_mappings (
  source_table text NOT NULL,
  old_id text NOT NULL,
  target_table text NOT NULL,
  new_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source_table, old_id)
);

CREATE TABLE IF NOT EXISTS legacy_raw.legacy_import_skipped_rows (
  source_table text NOT NULL,
  old_id text NOT NULL,
  target_table text NOT NULL,
  reason text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE
  invalid_count bigint;
BEGIN
  SELECT count(*) INTO invalid_count
  FROM legacy_raw.legacy_import_mappings;
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'legacy_raw.legacy_import_mappings already has % row(s). Use a fresh local/staging database.', invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count
  FROM legacy_raw.menus m
  LEFT JOIN legacy_raw.menus p ON p.id = m.parent_id
  WHERE m.parent_id IS NOT NULL AND p.id IS NULL;
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Menu parent orphan detected: % row(s). Stop and inspect legacy_raw.menus.', invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count
  FROM legacy_raw.menus
  WHERE NOT legacy_raw.is_valid_jsonb(translations);
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Invalid JSON detected in legacy_raw.menus.translations: % row(s).', invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count
  FROM legacy_raw.managements m
  LEFT JOIN legacy_raw.management_categories c ON c.id = m.category_id
  WHERE m.category_id IS NULL OR c.id IS NULL;
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Management category missing/orphan detected: % row(s).', invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count
  FROM legacy_raw.report_sections s
  LEFT JOIN legacy_raw.report_types t ON t.id = s.report_type_id
  WHERE t.id IS NULL;
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Report section type orphan detected: % row(s).', invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count
  FROM legacy_raw.report_items i
  LEFT JOIN legacy_raw.report_types t ON t.id = i.report_type_id
  WHERE i.report_type_id IS NOT NULL AND t.id IS NULL;
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Report item type orphan detected: % row(s).', invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count
  FROM legacy_raw.report_items i
  LEFT JOIN legacy_raw.report_sections s ON s.id = i.report_section_id
  WHERE i.report_section_id IS NOT NULL AND s.id IS NULL;
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Report item section orphan detected: % row(s).', invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count
  FROM legacy_raw.announcement_sections s
  LEFT JOIN legacy_raw.announcement_types t ON t.id = s.announcement_type_id
  WHERE t.id IS NULL;
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Announcement section type orphan detected: % row(s).', invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count
  FROM legacy_raw.announcement_items i
  LEFT JOIN legacy_raw.announcement_types t ON t.id = i.announcement_type_id
  WHERE i.announcement_type_id IS NOT NULL AND t.id IS NULL;
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Announcement item type orphan detected: % row(s).', invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count
  FROM legacy_raw.announcement_items i
  LEFT JOIN legacy_raw.announcement_sections s ON s.id = i.announcement_section_id
  WHERE i.announcement_section_id IS NOT NULL AND s.id IS NULL;
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Announcement item section orphan detected: % row(s).', invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count
  FROM legacy_raw.news_content n
  LEFT JOIN legacy_raw.news_category c ON c.id = n.id_category
  WHERE n.id_category IS NULL OR c.id IS NULL;
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'News category missing/orphan detected: % row(s).', invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count
  FROM legacy_raw.news_highlight h
  LEFT JOIN legacy_raw.news_content n ON n.id = h.id_news
  WHERE n.id IS NULL;
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'News highlight orphan detected: % row(s).', invalid_count;
  END IF;
END $$;

${mappingSql}

INSERT INTO public.roles (id, name, slug, description, is_system, created_at, updated_at, deleted_at)
WITH src AS (
  SELECT r.*,
         count(*) OVER (PARTITION BY lower(r.name)) AS duplicate_names
  FROM legacy_raw.roles r
)
SELECT map.new_id,
       CASE WHEN src.duplicate_names > 1 THEN src.name || ' #' || src.id::text ELSE src.name END,
       legacy_raw.slugify(src.name || '-' || src.id::text),
       'Imported from MySQL backup role id ' || src.id::text,
       lower(src.name) LIKE '%admin%',
       coalesce(src.created_at, now()),
       coalesce(src.updated_at, src.created_at, now()),
       NULL
FROM src
JOIN legacy_raw.legacy_import_mappings map
  ON map.source_table = 'roles' AND map.old_id = src.id::text;

INSERT INTO public.permissions (id, name, slug, module, description, created_at, updated_at)
WITH src AS (
  SELECT p.*,
         count(*) OVER (PARTITION BY lower(p.name)) AS duplicate_names
  FROM legacy_raw.permissions p
)
SELECT map.new_id,
       CASE WHEN src.duplicate_names > 1 THEN src.name || ' #' || src.id::text ELSE src.name END,
       legacy_raw.slugify(coalesce(src.module, 'legacy') || '-' || src.name || '-' || src.id::text),
       coalesce(nullif(src.module, ''), 'legacy'),
       'Imported from MySQL backup permission id ' || src.id::text,
       coalesce(src.created_at, now()),
       coalesce(src.updated_at, src.created_at, now())
FROM src
JOIN legacy_raw.legacy_import_mappings map
  ON map.source_table = 'permissions' AND map.old_id = src.id::text;

INSERT INTO public.users (
  id, email, username, password, first_name, last_name, avatar, phone, status,
  email_verified_at, last_login_at, failed_login_attempts, locked_at, locked_reason,
  password_changed_at, must_change_password, mfa_enabled, mfa_secret, mfa_verified_at,
  created_at, updated_at, deleted_at
)
SELECT map.new_id,
       u.email,
       legacy_raw.slugify(split_part(u.email, '@', 1) || '-' || u.id::text),
       CASE
         WHEN u.password LIKE '$2y$%' THEN '$2b$' || substr(u.password, 5)
         ELSE u.password
       END,
       coalesce(nullif(split_part(u.name, ' ', 1), ''), u.name),
       coalesce(nullif(trim(substr(u.name, length(split_part(u.name, ' ', 1)) + 1)), ''), ''),
       coalesce(u.avatar, u.img_user),
       NULL,
       CASE WHEN coalesce(u.data_status, 0) = 1 THEN 'ACTIVE'::"UserStatus" ELSE 'INACTIVE'::"UserStatus" END,
       u.email_verified_at,
       NULL,
       0,
       NULL,
       NULL,
       coalesce(u.updated_at, u.created_at, now()),
       false,
       false,
       NULL,
       NULL,
       coalesce(u.created_at, now()),
       coalesce(u.updated_at, u.created_at, now()),
       u.deleted_at
FROM legacy_raw.users u
JOIN legacy_raw.legacy_import_mappings map
  ON map.source_table = 'users' AND map.old_id = u.id::text;

INSERT INTO public.role_permissions (id, role_id, permission_id, created_at)
SELECT rp_map.new_id, role_map.new_id, permission_map.new_id, now()
FROM legacy_raw.role_permission rp
JOIN legacy_raw.legacy_import_mappings rp_map
  ON rp_map.source_table = 'role_permission' AND rp_map.old_id = rp.id::text
JOIN legacy_raw.legacy_import_mappings role_map
  ON role_map.source_table = 'roles' AND role_map.old_id = rp.role_id::text
JOIN legacy_raw.legacy_import_mappings permission_map
  ON permission_map.source_table = 'permissions' AND permission_map.old_id = rp.permission_id::text;

INSERT INTO legacy_raw.legacy_import_skipped_rows (source_table, old_id, target_table, reason, payload)
SELECT 'role_permission',
       rp.id::text,
       'role_permissions',
       concat_ws('; ',
         CASE WHEN r.id IS NULL THEN 'missing legacy role_id ' || rp.role_id::text END,
         CASE WHEN p.id IS NULL THEN 'missing legacy permission_id ' || rp.permission_id::text END
       ),
       to_jsonb(rp)
FROM legacy_raw.role_permission rp
LEFT JOIN legacy_raw.roles r ON r.id = rp.role_id
LEFT JOIN legacy_raw.permissions p ON p.id = rp.permission_id
WHERE r.id IS NULL OR p.id IS NULL;

INSERT INTO public.user_roles (id, user_id, role_id, created_at)
SELECT ur_map.new_id, user_map.new_id, role_map.new_id, now()
FROM legacy_raw.user_role ur
JOIN legacy_raw.legacy_import_mappings ur_map
  ON ur_map.source_table = 'user_role' AND ur_map.old_id = ur.id::text
JOIN legacy_raw.legacy_import_mappings user_map
  ON user_map.source_table = 'users' AND user_map.old_id = ur.user_id::text
JOIN legacy_raw.legacy_import_mappings role_map
  ON role_map.source_table = 'roles' AND role_map.old_id = ur.role_id::text;

INSERT INTO legacy_raw.legacy_import_skipped_rows (source_table, old_id, target_table, reason, payload)
SELECT 'user_role',
       ur.id::text,
       'user_roles',
       concat_ws('; ',
         CASE WHEN u.id IS NULL THEN 'missing legacy user_id ' || ur.user_id::text END,
         CASE WHEN r.id IS NULL THEN 'missing legacy role_id ' || ur.role_id::text END
       ),
       to_jsonb(ur)
FROM legacy_raw.user_role ur
LEFT JOIN legacy_raw.users u ON u.id = ur.user_id
LEFT JOIN legacy_raw.roles r ON r.id = ur.role_id
WHERE u.id IS NULL OR r.id IS NULL;

INSERT INTO public.menus (
  id, parent_id, section_title, section_order, title, translations, slug, url, icon, image,
  description, badge, position, type, "order", is_active, open_new_tab, css_class,
  created_by, updated_by, created_at, updated_at
)
SELECT id,
       parent_id,
       section_title,
       coalesce(section_order, 0),
       title,
       CASE WHEN translations IS NULL OR btrim(translations) = '' THEN NULL ELSE translations::jsonb END,
       slug,
       url,
       icon,
       image,
       description,
       badge,
       lower(btrim(coalesce(position, 'header')))::"MenuPosition",
       lower(btrim(coalesce(type, 'link')))::"MenuType",
       coalesce("order", 0),
       coalesce(is_active, true),
       coalesce(open_new_tab, false),
       css_class,
       created_by,
       updated_by,
       created_at,
       updated_at
FROM legacy_raw.menus;

INSERT INTO public.career_content (
  id, position, slug, division, type, link_job, location, description, description_id,
  requirements, requirements_id, status, expiry_date, created_at, updated_at, created_by, updated_by
)
SELECT id, position, slug, division, type, link_job, location, description, description_id,
       requirements, requirements_id, coalesce(status, 'active'), expiry_date, created_at, updated_at,
       created_by, updated_by
FROM legacy_raw.career_content;

INSERT INTO public.management_categories (
  id, name, slug, description, position, is_active, created_by, updated_by, created_at, updated_at, deleted_at
)
WITH src AS (
  SELECT c.*,
         legacy_raw.slugify(coalesce(nullif(c.slug, ''), c.name)) AS base_slug,
         count(*) OVER (PARTITION BY legacy_raw.slugify(coalesce(nullif(c.slug, ''), c.name))) AS duplicate_slugs
  FROM legacy_raw.management_categories c
)
SELECT map.new_id,
       src.name,
       CASE WHEN src.duplicate_slugs > 1 THEN src.base_slug || '-' || src.id::text ELSE src.base_slug END,
       src.description,
       coalesce(src."order", 0),
       coalesce(src.status, 1) = 1,
       src.created_by,
       src.updated_by,
       coalesce(src.created_at, now()),
       coalesce(src.updated_at, src.created_at, now()),
       NULL
FROM src
JOIN legacy_raw.legacy_import_mappings map
  ON map.source_table = 'management_categories' AND map.old_id = src.id::text;

INSERT INTO public.managements (
  id, category_id, name, slug, position_en, position_id, description, photo, bio_en, bio_id,
  email, phone, linkedin, "order", is_active, created_by, updated_by, created_at, updated_at, deleted_at
)
WITH src AS (
  SELECT m.*,
         legacy_raw.slugify(m.name || '-' || m.id::text) AS generated_slug
  FROM legacy_raw.managements m
)
SELECT management_map.new_id,
       category_map.new_id,
       src.name,
       src.generated_slug,
       src.position_en,
       src.position_id,
       src.category,
       src.photo,
       src.bio_en,
       src.bio_id,
       NULL,
       NULL,
       NULL,
       coalesce(src.data_order, 0),
       coalesce(src.data_status, 1) = 1,
       src.created_by,
       src.updated_by,
       coalesce(src.created_at, now()),
       coalesce(src.updated_at, src.created_at, now()),
       NULL
FROM src
JOIN legacy_raw.legacy_import_mappings management_map
  ON management_map.source_table = 'managements' AND management_map.old_id = src.id::text
LEFT JOIN legacy_raw.legacy_import_mappings category_map
  ON category_map.source_table = 'management_categories' AND category_map.old_id = src.category_id::text
WHERE src.category_id IS NOT NULL;

INSERT INTO public.awards (
  id, title, title_id, title_en, slug, description, description_id, description_en, top_logo,
  image, link, issuer, year, issue_date, position, is_active, status, created_by, updated_by,
  created_at, updated_at, deleted_at
)
SELECT map.new_id,
       coalesce(a.nama_awards, a.nama_awards_en, a.nama_awards_id, 'Award ' || a.id::text),
       a.nama_awards_id,
       a.nama_awards_en,
       legacy_raw.slugify(coalesce(a.nama_awards, a.nama_awards_en, a.nama_awards_id, 'award') || '-' || extract(year from a.tahun)::int::text || '-' || a.id::text),
       a.detail_awards,
       a.detail_awards_id,
       a.detail_awards_en,
       NULL,
       a.image,
       a.link,
       'Link Net',
       extract(year from a.tahun)::int,
       a.tahun::timestamp,
       a.id::integer,
       true,
       'ACTIVE',
       a.created_by::text,
       a.updated_by::text,
       coalesce(a.created_at, now()),
       coalesce(a.updated_at, a.created_at, now()),
       NULL
FROM legacy_raw.awards a
JOIN legacy_raw.legacy_import_mappings map
  ON map.source_table = 'awards' AND map.old_id = a.id::text;

INSERT INTO public.contact_us (
  id, first_name, last_name, email, phone, role, company, inquiry_type, subject, message,
  status, ip_address, user_agent, read_at, submitted_at, created_at, updated_at
)
SELECT map.new_id,
       c.first_name,
       c.last_name,
       c.email,
       c.phone,
       c.role,
       c.company,
       CASE
         WHEN upper(c.inquiry_type) IN ('BUSINESS', 'SUPPORT', 'CAREER', 'OTHERS')
           THEN upper(c.inquiry_type)::"InquiryType"
         ELSE 'OTHERS'::"InquiryType"
       END,
       'Legacy contact import',
       c.message,
       'NEW'::"ContactStatus",
       c.ip_address,
       c.user_agent,
       NULL,
       coalesce(c.submitted_at, c.created_at, now()),
       coalesce(c.created_at, c.submitted_at, now()),
       coalesce(c.updated_at, c.created_at, c.submitted_at, now())
FROM legacy_raw.contact_us c
JOIN legacy_raw.legacy_import_mappings map
  ON map.source_table = 'contact_us' AND map.old_id = c.id::text;

INSERT INTO public.announcement_types (
  id, name, slug, type, description, icon, color, position, is_active, created_at, updated_at, deleted_at
)
SELECT map.new_id,
       t.name,
       legacy_raw.slugify(t.name || '-' || t.id::text),
       coalesce(t.type, 'List'),
       NULL,
       NULL,
       NULL,
       coalesce(t.sort_order, 0),
       coalesce(t.is_active, true),
       coalesce(t.created_at, now()),
       coalesce(t.updated_at, t.created_at, now()),
       t.deleted_at
FROM legacy_raw.announcement_types t
JOIN legacy_raw.legacy_import_mappings map
  ON map.source_table = 'announcement_types' AND map.old_id = t.id::text;

INSERT INTO public.announcement_sections (
  id, type_id, name, slug, description, announcement_year, cta_enabled, cta_text, cta_url,
  position, is_active, created_at, updated_at, deleted_at
)
SELECT section_map.new_id,
       type_map.new_id,
       s.title,
       legacy_raw.slugify(s.title || '-' || s.id::text),
       s.description,
       s.announcement_year,
       coalesce(s.cta_enabled, false),
       s.cta_text,
       s.cta_url,
       coalesce(s.sort_order, 0),
       coalesce(s.is_active, true),
       coalesce(s.created_at, now()),
       coalesce(s.updated_at, s.created_at, now()),
       s.deleted_at
FROM legacy_raw.announcement_sections s
JOIN legacy_raw.legacy_import_mappings section_map
  ON section_map.source_table = 'announcement_sections' AND section_map.old_id = s.id::text
JOIN legacy_raw.legacy_import_mappings type_map
  ON type_map.source_table = 'announcement_types' AND type_map.old_id = s.announcement_type_id::text;

INSERT INTO public.announcements (
  id, type_id, section_id, title, slug, description, pdf_file, cover_image, data_type,
  audit_status, file_size, sort_order, is_active, status, created_at, updated_at, deleted_at
)
SELECT item_map.new_id,
       type_map.new_id,
       section_map.new_id,
       i.title,
       legacy_raw.slugify(i.title || '-' || i.id::text),
       i.sub_description,
       i.pdf_file,
       i.cover_image,
       i.data_type,
       i.audit_status,
       i.file_size,
       coalesce(i.sort_order, 0),
       coalesce(i.is_active, true),
       CASE WHEN coalesce(i.is_active, true) THEN 'PUBLISHED'::"ContentStatus" ELSE 'ARCHIVED'::"ContentStatus" END,
       coalesce(i.created_at, now()),
       coalesce(i.updated_at, i.created_at, now()),
       i.deleted_at
FROM legacy_raw.announcement_items i
JOIN legacy_raw.legacy_import_mappings item_map
  ON item_map.source_table = 'announcement_items' AND item_map.old_id = i.id::text
LEFT JOIN legacy_raw.legacy_import_mappings type_map
  ON type_map.source_table = 'announcement_types' AND type_map.old_id = i.announcement_type_id::text
LEFT JOIN legacy_raw.legacy_import_mappings section_map
  ON section_map.source_table = 'announcement_sections' AND section_map.old_id = i.announcement_section_id::text;

INSERT INTO public.report_types (
  id, name, slug, description, icon, color, position, is_active, created_at, updated_at, deleted_at
)
SELECT map.new_id,
       t.name,
       legacy_raw.slugify(t.name || '-' || t.id::text),
       NULL,
       NULL,
       NULL,
       coalesce(t.sort_order, 0),
       coalesce(t.is_active, true),
       coalesce(t.created_at, now()),
       coalesce(t.updated_at, t.created_at, now()),
       t.deleted_at
FROM legacy_raw.report_types t
JOIN legacy_raw.legacy_import_mappings map
  ON map.source_table = 'report_types' AND map.old_id = t.id::text;

INSERT INTO public.report_sections (
  id, type_id, name, slug, description, position, is_active, created_at, updated_at, deleted_at
)
SELECT section_map.new_id,
       type_map.new_id,
       s.title,
       legacy_raw.slugify(s.title || '-' || s.id::text),
       s.description,
       coalesce(s.sort_order, 0),
       coalesce(s.is_active, true),
       coalesce(s.created_at, now()),
       coalesce(s.updated_at, s.created_at, now()),
       s.deleted_at
FROM legacy_raw.report_sections s
JOIN legacy_raw.legacy_import_mappings section_map
  ON section_map.source_table = 'report_sections' AND section_map.old_id = s.id::text
JOIN legacy_raw.legacy_import_mappings type_map
  ON type_map.source_table = 'report_types' AND type_map.old_id = s.report_type_id::text;

INSERT INTO public.reports (
  id, type_id, section_id, title, slug, description, pdf_file, cover_image, data_type,
  audit_status, file_size, sort_order, is_active, period, year, quarter, file_url, file_type,
  thumbnail, downloads, status, published_at, created_at, updated_at, deleted_at
)
SELECT item_map.new_id,
       type_map.new_id,
       section_map.new_id,
       i.title,
       legacy_raw.slugify(i.title || '-' || i.id::text),
       i.sub_description,
       i.pdf_file,
       i.cover_image,
       i.data_type,
       i.audit_status,
       i.file_size,
       coalesce(i.sort_order, 0),
       coalesce(i.is_active, true),
       NULL,
       s.report_year,
       NULL,
       i.pdf_file,
       NULL,
       i.cover_image,
       0,
       CASE WHEN coalesce(i.is_active, true) THEN 'PUBLISHED'::"ContentStatus" ELSE 'ARCHIVED'::"ContentStatus" END,
       CASE WHEN coalesce(i.is_active, true) THEN coalesce(i.created_at, now()) ELSE NULL END,
       coalesce(i.created_at, now()),
       coalesce(i.updated_at, i.created_at, now()),
       i.deleted_at
FROM legacy_raw.report_items i
LEFT JOIN legacy_raw.report_sections s ON s.id = i.report_section_id
JOIN legacy_raw.legacy_import_mappings item_map
  ON item_map.source_table = 'report_items' AND item_map.old_id = i.id::text
LEFT JOIN legacy_raw.legacy_import_mappings type_map
  ON type_map.source_table = 'report_types' AND type_map.old_id = i.report_type_id::text
LEFT JOIN legacy_raw.legacy_import_mappings section_map
  ON section_map.source_table = 'report_sections' AND section_map.old_id = i.report_section_id::text;

INSERT INTO public.news_categories (
  id, name_en, name_id, slug, description, position, is_active, created_by, updated_by, created_at, updated_at, deleted_at
)
WITH src AS (
  SELECT c.*,
         legacy_raw.slugify(coalesce(nullif(c.slug, ''), c.category_name)) AS base_slug,
         count(*) OVER (PARTITION BY legacy_raw.slugify(coalesce(nullif(c.slug, ''), c.category_name))) AS duplicate_slugs
  FROM legacy_raw.news_category c
)
SELECT map.new_id,
       src.category_name,
       src.category_name,
       CASE WHEN src.duplicate_slugs > 1 THEN src.base_slug || '-' || src.id::text ELSE src.base_slug END,
       NULL,
       coalesce(src.data_order, 0),
       coalesce(src.data_status, true),
       src.created_by,
       src.updated_by,
       coalesce(src.created_at, now()),
       coalesce(src.updated_at, src.created_at, now()),
       NULL
FROM src
JOIN legacy_raw.legacy_import_mappings map
  ON map.source_table = 'news_category' AND map.old_id = src.id::text;

INSERT INTO public.news (
  id, title_en, title_id, slug, news_date, news_thumbnail, excerpt_en, excerpt_id,
  content_en, content_id, news_link, author, meta_title, meta_description, meta_desc,
  category_id, meta_keywords, custom_css, custom_js, view_count, view_count_unique,
  status, visibility, published_at, created_by_id, updated_by_id, created_at, updated_at, deleted_at
)
SELECT news_map.new_id,
       n.title_en,
       n.title_id,
       legacy_raw.slugify(coalesce(nullif(n.slug, ''), n.title_en) || '-' || n.id::text),
       coalesce(n.news_date, n.created_at::date, current_date),
       n.news_thumbnail,
       n.excerpt_en,
       n.excerpt_id,
       n.content_en,
       n.content_id,
       n.news_link,
       n.author,
       n.title_en,
       n.meta_desc,
       n.meta_desc,
       category_map.new_id,
       n.meta_keyword,
       n.custom_css,
       n.custom_js,
       least(coalesce(n.view_count, 0), 2147483647)::integer,
       least(coalesce(n.view_count_unique, 0), 2147483647)::integer,
       CASE WHEN coalesce(n.data_status, true) THEN 'PUBLISHED'::"ContentStatus" ELSE 'DRAFT'::"ContentStatus" END,
       'PUBLIC',
       CASE WHEN coalesce(n.data_status, true) THEN coalesce(n.news_date::timestamp, n.created_at, now()) ELSE NULL END,
       coalesce(publisher_map.new_id, first_user.new_id),
       updater_map.new_id,
       coalesce(n.created_at, now()),
       coalesce(n.updated_at, n.created_at, now()),
       NULL
FROM legacy_raw.news_content n
JOIN legacy_raw.legacy_import_mappings news_map
  ON news_map.source_table = 'news_content' AND news_map.old_id = n.id::text
JOIN legacy_raw.legacy_import_mappings category_map
  ON category_map.source_table = 'news_category' AND category_map.old_id = n.id_category::text
CROSS JOIN LATERAL (
  SELECT new_id
  FROM legacy_raw.legacy_import_mappings
  WHERE source_table = 'users'
  ORDER BY old_id::bigint
  LIMIT 1
) first_user
LEFT JOIN legacy_raw.legacy_import_mappings publisher_map
  ON publisher_map.source_table = 'users' AND publisher_map.old_id = n.id_publisher::text
LEFT JOIN legacy_raw.legacy_import_mappings updater_map
  ON updater_map.source_table = 'users' AND updater_map.old_id = n.updated_by;

INSERT INTO public.news_highlights (id, news_id, position, created_by, updated_by, created_at, updated_at)
SELECT highlight_map.new_id,
       news_map.new_id,
       coalesce(h.data_order, h.id)::integer,
       h.created_by,
       h.updated_by,
       coalesce(h.created_at, now()),
       coalesce(h.updated_at, h.created_at, now())
FROM legacy_raw.news_highlight h
JOIN legacy_raw.legacy_import_mappings highlight_map
  ON highlight_map.source_table = 'news_highlight' AND highlight_map.old_id = h.id::text
JOIN legacy_raw.legacy_import_mappings news_map
  ON news_map.source_table = 'news_content' AND news_map.old_id = h.id_news::text;

INSERT INTO public.url_redirects (
  id, from_url, to_url, status_code, hits, is_active, created_at, updated_at, deleted_at
)
SELECT map.new_id,
       r.source_path,
       r.url_destination,
       301,
       0,
       true,
       coalesce(r.created_at, now()),
       coalesce(r.updated_at, r.created_at, now()),
       NULL
FROM legacy_raw.tb_url_redirect r
JOIN legacy_raw.legacy_import_mappings map
  ON map.source_table = 'tb_url_redirect' AND map.old_id = r.id::text;

SELECT setval(pg_get_serial_sequence('public.menus', 'id'), coalesce((SELECT max(id) FROM public.menus), 1), (SELECT count(*) > 0 FROM public.menus));
SELECT setval(pg_get_serial_sequence('public.career_content', 'id'), coalesce((SELECT max(id) FROM public.career_content), 1), (SELECT count(*) > 0 FROM public.career_content));

COMMIT;
`;
}

function generateValidationSql(tables) {
  const canonicalCounts = [
    ['announcement_types', 'announcement_types'],
    ['announcement_sections', 'announcement_sections'],
    ['announcement_items', 'announcements'],
    ['awards', 'awards'],
    ['career_content', 'career_content'],
    ['contact_us', 'contact_us'],
    ['management_categories', 'management_categories'],
    ['managements', 'managements'],
    ['menus', 'menus'],
    ['news_category', 'news_categories'],
    ['news_content', 'news'],
    ['news_highlight', 'news_highlights'],
    ['permissions', 'permissions'],
    ['report_types', 'report_types'],
    ['report_sections', 'report_sections'],
    ['report_items', 'reports'],
    ['roles', 'roles'],
    ['role_permission', 'role_permissions'],
    ['tb_url_redirect', 'url_redirects'],
    ['users', 'users'],
    ['user_role', 'user_roles'],
  ];

  const rawSelects = LEGACY_TABLES.map((tableName) => {
    const expectedRows = tables.get(tableName)?.rows.length ?? 0;
    return `SELECT ${sqlString(tableName)} AS table_name, ${expectedRows}::bigint AS expected_rows, count(*)::bigint AS actual_rows FROM legacy_raw.${sqlIdentifier(tableName)}`;
  }).join('\nUNION ALL\n');

  const canonicalSelects = canonicalCounts
    .map(([sourceTable, targetTable]) => {
      const expectedRows = tables.get(sourceTable)?.rows.length ?? 0;
      if (sourceTable === 'role_permission') {
        return `SELECT 'role_permission' AS source_table, 'role_permissions' AS target_table, count(*)::bigint AS expected_rows, (SELECT count(*)::bigint FROM public."role_permissions") AS actual_rows
FROM legacy_raw.role_permission rp
JOIN legacy_raw.roles r ON r.id = rp.role_id
JOIN legacy_raw.permissions p ON p.id = rp.permission_id`;
      }
      if (sourceTable === 'user_role') {
        return `SELECT 'user_role' AS source_table, 'user_roles' AS target_table, count(*)::bigint AS expected_rows, (SELECT count(*)::bigint FROM public."user_roles") AS actual_rows
FROM legacy_raw.user_role ur
JOIN legacy_raw.users u ON u.id = ur.user_id
JOIN legacy_raw.roles r ON r.id = ur.role_id`;
      }
      return `SELECT ${sqlString(sourceTable)} AS source_table, ${sqlString(targetTable)} AS target_table, ${expectedRows}::bigint AS expected_rows, count(*)::bigint AS actual_rows FROM public.${sqlIdentifier(targetTable)}`;
    })
    .join('\nUNION ALL\n');

  return `-- Generated by scripts/db-rebuild/generate-rebuild-artifacts.cjs
-- Purpose: read-only row count checks after raw and canonical imports.

WITH raw_counts AS (
${rawSelects}
)
SELECT table_name,
       expected_rows,
       actual_rows,
       CASE WHEN expected_rows = actual_rows THEN 'OK' ELSE 'MISMATCH' END AS status
FROM raw_counts
ORDER BY table_name;

WITH canonical_counts AS (
${canonicalSelects}
)
SELECT source_table,
       target_table,
       expected_rows,
       actual_rows,
       CASE WHEN expected_rows = actual_rows THEN 'OK' ELSE 'MISMATCH' END AS status
FROM canonical_counts
ORDER BY source_table, target_table;

SELECT source_table,
       target_table,
       count(*)::bigint AS mapped_rows
FROM legacy_raw.legacy_import_mappings
GROUP BY source_table, target_table
ORDER BY source_table, target_table;

SELECT source_table,
       target_table,
       reason,
       count(*)::bigint AS skipped_rows
FROM legacy_raw.legacy_import_skipped_rows
GROUP BY source_table, target_table, reason
ORDER BY source_table, target_table, reason;

SELECT 'menus' AS table_name,
       coalesce((SELECT max(id) FROM public.menus), 0)::bigint AS max_id,
       (SELECT last_value FROM public.menus_id_seq)::bigint AS sequence_last_value,
       CASE
         WHEN (SELECT count(*) FROM public.menus) = 0 THEN 'EMPTY'
         WHEN (SELECT last_value FROM public.menus_id_seq) >= (SELECT max(id) FROM public.menus) THEN 'OK'
         ELSE 'MISMATCH'
       END AS status
UNION ALL
SELECT 'career_content' AS table_name,
       coalesce((SELECT max(id) FROM public.career_content), 0)::bigint AS max_id,
       (SELECT last_value FROM public.career_content_id_seq)::bigint AS sequence_last_value,
       CASE
         WHEN (SELECT count(*) FROM public.career_content) = 0 THEN 'EMPTY'
         WHEN (SELECT last_value FROM public.career_content_id_seq) >= (SELECT max(id) FROM public.career_content) THEN 'OK'
         ELSE 'MISMATCH'
       END AS status;
`;
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');
}

function generateDocs(tables) {
  const generatedAt = new Date().toISOString();
  const tableRows = LEGACY_TABLES.map((tableName) => {
    const table = tables.get(tableName);
    return [
      `\`${tableName}\``,
      table ? String(table.columns.length) : '0',
      table ? String(table.rows.length) : '0',
      table && table.primaryKey.length ? table.primaryKey.map((item) => `\`${item}\``).join(', ') : '-',
      table && table.autoIncrement ? `\`${table.autoIncrement.column}\`` : '-',
    ];
  });

  const totalRows = LEGACY_TABLES.reduce((sum, tableName) => sum + (tables.get(tableName)?.rows.length ?? 0), 0);
  const backupAnalysis = `# Analisa Backup MySQL

Generated: ${generatedAt}

Backup source: \`${backupSqlPath}\`

Database legacy terdeteksi dari dump: \`linknetcorpdb\`.

## Ringkasan

- Tabel legacy terdeteksi: ${LEGACY_TABLES.length}
- Total row terdeteksi dari INSERT: ${totalRows}
- Runtime final tetap memakai schema Prisma/PostgreSQL di \`public\`.
- Schema \`legacy_raw\` hanya untuk audit row count dan validasi sebelum mapping ke tabel canonical.

## Tabel dan row count

${markdownTable(['Table', 'Columns', 'Rows', 'Primary key', 'Auto increment'], tableRows)}

## Catatan kompatibilitas MySQL ke PostgreSQL

- \`AUTO_INCREMENT\` tidak dipakai untuk raw audit; ID legacy disimpan apa adanya. Untuk canonical, mayoritas ID dimapping ke UUID melalui \`legacy_raw.legacy_import_mappings\`.
- \`bigint UNSIGNED\` menjadi \`bigint\`; PostgreSQL tidak punya unsigned integer.
- \`tinyint(1)\` menjadi \`boolean\` di raw audit.
- \`datetime\` dan \`timestamp\` menjadi \`timestamp\`.
- \`text\`, \`mediumtext\`, \`longtext\`, \`varchar\`, \`tinytext\`, dan \`enum\` disimpan sebagai \`text\` di raw audit; canonical mengikuti tipe Prisma.
- \`menus.translations\` divalidasi sebagai JSON sebelum cast ke \`jsonb\`.
- \`ENGINE\`, \`CHARSET\`, \`COLLATE\`, dan backtick MySQL tidak dibawa ke PostgreSQL.

## Potensi konflik yang menghentikan import canonical

- Target canonical di \`public\` sudah berisi row pada tabel yang akan diimport.
- Ada orphan pada relasi konten wajib seperti \`news_highlight\`, report/announcement section, menu parent, atau management category.
- Orphan pada relasi auth legacy \`role_permission\` dan \`user_role\` tidak menghentikan import, tetapi dicatat ke \`legacy_raw.legacy_import_skipped_rows\`.
- \`menus.translations\` bukan JSON valid.
- Database tujuan terlihat seperti production dari nama database.
- Session belum mengaktifkan guard \`legacy_rebuild.allow_import=true\`.
`;

  const mappingRows = [
    ['`announcement_types`', '`announcement_types`', 'UUID', '`name`, `type`, `sort_order`, `is_active` dipertahankan.'],
    ['`announcement_sections`', '`announcement_sections`', 'UUID', '`announcement_type_id` dimapping ke UUID type.'],
    ['`announcement_items`', '`announcements`', 'UUID', '`sub_description` -> `description`, file metadata dipertahankan.'],
    ['`report_types`', '`report_types`', 'UUID', 'Struktur list/grid dan posisi dipertahankan.'],
    ['`report_sections`', '`report_sections`', 'UUID', '`report_year` dipakai untuk `reports.year` saat item diimport.'],
    ['`report_items`', '`reports`', 'UUID', '`sub_description` -> `description`, `pdf_file` juga masuk `file_url`.'],
    ['`news_category`', '`news_categories`', 'UUID', '`category_name` -> `name_en` dan `name_id`.'],
    ['`news_content`', '`news`', 'UUID', 'Publisher memakai `id_publisher` bila cocok, fallback ke user pertama.'],
    ['`news_highlight`', '`news_highlights`', 'UUID', '`id_news` dimapping ke `news.id`.'],
    ['`roles`, `permissions`', '`roles`, `permissions`', 'UUID', 'Slug dibuat dari nama/module/id legacy agar unik.'],
    ['`role_permission`, `user_role`', '`role_permissions`, `user_roles`', 'UUID', 'Semua relasi melewati mapping table.'],
    ['`users`', '`users`', 'UUID', 'Password `$2y$` dinormalisasi menjadi `$2b$` untuk bcryptjs.'],
    ['`menus`', '`menus`', 'BigInt preserved', 'ID dan parent_id dipertahankan; sequence disesuaikan setelah import.'],
    ['`career_content`', '`career_content`', 'BigInt preserved', 'ID dipertahankan; sequence disesuaikan setelah import.'],
    ['`management_categories`, `managements`', '`management_categories`, `managements`', 'UUID', 'Management wajib punya category_id yang valid.'],
    ['`awards`', '`awards`', 'UUID', '`tahun` -> `issue_date` dan `year`; issuer default `Link Net`.'],
    ['`contact_us`', '`contact_us`', 'UUID', 'Inquiry type di-normalisasi ke enum Prisma, default `OTHERS` jika tidak cocok.'],
    ['`tb_url_redirect`', '`url_redirects`', 'UUID', '`source_path` -> `from_url`, `url_destination` -> `to_url`.'],
  ];

  const mappingDoc = `# Mapping MySQL ke PostgreSQL Canonical

Generated: ${generatedAt}

Import canonical tidak membuat schema aplikasi. Jalankan Prisma baseline migration terlebih dahulu, lalu import \`legacy_raw\`, lalu import canonical.

${markdownTable(['MySQL legacy', 'PostgreSQL canonical', 'ID strategy', 'Catatan'], mappingRows)}

## Tabel aplikasi yang tidak ada di backup

Tabel seperti \`settings\`, \`pages\`, \`page_components\`, \`form_*\`, \`events\`, \`files\`, \`folders\`, \`label_*\`, \`data_bank_*\`, \`component_visibility\`, \`map_coverage_regions\`, \`cookie_consents\`, dan token/auth runtime tetap dibuat oleh Prisma migration. Data untuk tabel tersebut harus berasal dari seed/bootstrap idempotent aplikasi setelah import legacy selesai.

## Data yang tidak dimirror langsung

- Tabel raw legacy tetap tersedia di \`legacy_raw\` untuk audit.
- Field legacy yang tidak punya padanan runtime tetap tidak dipaksa masuk ke \`public\`.
- Mapping old ID ke new UUID tersimpan di \`legacy_raw.legacy_import_mappings\`.
`;

  const readme = `# Database Rebuild dari Backup MySQL

Generated: ${generatedAt}

Dokumen dan artefak di folder ini dibuat untuk rebuild PostgreSQL secara aman dari backup MySQL terbaru tanpa menjalankan aksi ke production database.

## Artefak utama

- Raw audit SQL: \`${rawSqlPath}\`
- Canonical import SQL: \`${canonicalSqlPath}\`
- Validation SQL: \`${validationSqlPath}\`
- Backup analysis: \`${path.join(docsRoot, 'backup-analysis.md')}\`
- Mapping notes: \`${path.join(docsRoot, 'mysql-to-postgres-mapping.md')}\`
- Staging refresh command: \`${path.join(docsRoot, 'staging-refresh-command.md')}\`
- Import/deploy guide: \`${path.join(docsRoot, 'import-and-deploy-guide.md')}\`
- Validation checklist: \`${path.join(docsRoot, 'validation-checklist.md')}\`
- Code compatibility audit: \`${path.join(docsRoot, 'code-compatibility-audit.md')}\`
- Rollback plan: \`${path.join(docsRoot, 'rollback-plan.md')}\`
- Migration notes: \`${path.join(docsRoot, 'migration-notes.md')}\`

## Urutan aman lokal/staging

Untuk staging yang memang boleh dikosongkan, gunakan satu command:

\`\`\`powershell
cd ${backendRoot}
npm run db:staging:refresh
\`\`\`

Command tersebut akan menghapus schema \`public\` dan \`legacy_raw\`, menjalankan migration, import raw, import canonical, dan validasi row count.

## Urutan manual lokal/staging

1. Buat database PostgreSQL baru yang kosong.
2. Jalankan baseline migration Prisma: \`npx prisma migrate deploy\`.
3. Import raw audit SQL dengan guard eksplisit.
4. Import canonical SQL dengan guard eksplisit.
5. Bandingkan row count legacy dan canonical.
6. Jalankan seed/bootstrap idempotent untuk tabel aplikasi yang tidak ada di backup.
7. Jalankan aplikasi dan validasi fitur utama.

Production hanya boleh switch \`DATABASE_URL\` ke database baru setelah validasi staging selesai dan backup/snapshot lama tersedia.
`;

const importGuide = `# Panduan Import dan Deployment AWS

## Local/staging import

Set \`DATABASE_URL\` ke database PostgreSQL baru yang kosong, bukan production.

\`\`\`powershell
cd ${backendRoot}
npx prisma migrate deploy
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -c "SET legacy_rebuild.allow_import = 'true';" -f "${rawSqlPath}"
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -c "SET legacy_rebuild.allow_import = 'true';" -f "${canonicalSqlPath}"
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f "${validationSqlPath}"
npx prisma generate
\`\`\`

Jangan jalankan \`prisma migrate reset\`, \`DROP\`, \`TRUNCATE\`, restore, atau overwrite terhadap production.

## Staging refresh satu command

Jika database staging memang boleh dikosongkan, team IT cukup menjalankan:

\`\`\`bash
npm run db:staging:refresh
\`\`\`

Efek command tersebut sama dengan urutan manual di atas, tetapi diawali dengan:

- \`DROP SCHEMA IF EXISTS legacy_raw CASCADE\`
- \`DROP SCHEMA IF EXISTS public CASCADE\`
- \`CREATE SCHEMA public\`

Command akan berhenti jika ada error.

## AWS deployment aman

1. Backup PostgreSQL production saat ini dengan snapshot RDS atau \`pg_dump\`.
2. Buat database PostgreSQL baru untuk rebuild.
3. Jalankan baseline migration di database baru.
4. Import raw SQL, lalu import canonical SQL.
5. Jalankan seed/bootstrap idempotent untuk data aplikasi yang tidak ada di backup.
6. Deploy \`corporate-be\`, \`corporate-cms\`, \`corporate-fm\`, dan \`corporate-web\` ke staging dengan \`DATABASE_URL\` menuju database rebuild.
7. Validasi login CMS, CRUD utama, endpoint public, file manager, dan rendering web.
8. Setelah aman, switch production dengan mengganti secret/env \`DATABASE_URL\` ke database baru.
9. Pertahankan database lama sampai validasi pasca-switch selesai.
`;

  const validationChecklist = `# Checklist Validasi Rebuild

- [ ] \`npx prisma migrate deploy\` sukses pada database kosong lokal/staging.
- [ ] \`linknet_bersih_legacy_raw.postgres.sql\` sukses diimport ke \`legacy_raw\`.
- [ ] \`import_legacy_canonical.sql\` sukses diimport ke \`public\`.
- [ ] Row count legacy raw sesuai dengan backup MySQL.
- [ ] Row count canonical sesuai ekspektasi mapping.
- [ ] \`legacy_raw.legacy_import_mappings\` berisi mapping old ID ke new ID.
- [ ] Tidak ada orphan FK konten wajib yang dihentikan guard.
- [ ] Jika ada row auth legacy yang dilewati, alasannya tercatat di \`legacy_raw.legacy_import_skipped_rows\`.
- [ ] Password user legacy bisa dipakai untuk login CMS setelah normalisasi bcrypt.
- [ ] Backend bisa start dan health check normal.
- [ ] CMS bisa login dan mengelola menu/news/report/announcement/career/contact.
- [ ] File manager tetap berjalan dan tidak membutuhkan tabel legacy langsung.
- [ ] Website public bisa membaca menu, news, report, announcement, career, dan contact endpoint.
- [ ] Scan code tidak menemukan query MySQL-only yang tersisa.
- [ ] Tidak ada migration lama yang masih aktif di folder \`prisma/migrations\`.
`;

  const stagingRefreshCommand = `# Staging Refresh Command

Command untuk team IT:

\`\`\`bash
npm run db:staging:refresh
\`\`\`

## Efek command

Command ini destructive untuk database yang ditunjuk oleh \`DATABASE_URL\`.

Yang dilakukan:

1. Menghapus schema \`legacy_raw\` jika ada.
2. Menghapus schema \`public\` beserta semua tabel/data lama.
3. Membuat ulang schema \`public\`.
4. Menjalankan \`npx prisma migrate deploy\`.
5. Menjalankan \`npx prisma generate\`.
6. Import raw backup ke \`legacy_raw\`.
7. Import data canonical ke tabel aplikasi \`public\`.
8. Menjalankan SQL validasi row count, mapping, skipped rows, dan sequence.

Command berhenti saat ada error. Di akhir proses, script akan menampilkan salah satu status berikut:

- \`FINAL STATUS: SUCCESS\` jika migration, seed/import, dan validasi selesai.
- \`FINAL STATUS: FAILED\` jika salah satu step gagal, lengkap dengan nama step dan alasan error.

## Prasyarat

- Jalankan dari folder \`corporate-be\`.
- Image/container sudah berisi dependency Node dan Prisma.
- \`psql\` tersedia di environment tempat command dijalankan.
- \`DATABASE_URL\` mengarah ke database staging yang boleh dikosongkan.
- Nama host/database tidak boleh terlihat seperti production, misalnya mengandung \`prod\` atau \`production\`.
- File SQL tersedia di \`database/db-rebuild\`.

Opsional, untuk mengunci nama database target:

\`\`\`bash
export DB_REFRESH_EXPECTED_DATABASE=nama_database_staging
npm run db:staging:refresh
\`\`\`

## Dry run

Untuk melihat urutan command tanpa mengeksekusi reset/import:

\`\`\`bash
npm run db:staging:refresh:dry-run
\`\`\`

## Cek hasil akhir sederhana

\`\`\`bash
npx prisma migrate status
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/db-rebuild/validate_legacy_rebuild.sql
\`\`\`

Jika output validasi menampilkan skipped rows untuk \`role_permission\` atau \`user_role\`, itu berarti row legacy tersebut menunjuk role/permission/user yang tidak ada di backup dan sengaja tidak dipaksa masuk agar FK canonical tetap valid.
`;

  const rollbackPlan = `# Rollback Plan

## Sebelum switch production

- Simpan snapshot/backup PostgreSQL production lama.
- Simpan database rebuild sebagai database terpisah.
- Validasi staging memakai secret/env yang sama formatnya dengan production.

## Setelah switch production

Rollback tercepat adalah mengembalikan secret/env \`DATABASE_URL\` aplikasi ke database production lama, lalu redeploy/restart service.

Database lama jangan dihapus sampai:

- login CMS sukses,
- CRUD utama sukses,
- website public normal,
- file manager normal,
- row count dan spot check konten lolos,
- log aplikasi tidak menunjukkan error schema/query.

Jika import canonical gagal di staging, jangan bersihkan production. Buat database staging baru, perbaiki mapping atau data cleanup, lalu ulang dari baseline migration.
`;

  const codeCompatibilityAudit = `# Code Compatibility Audit

Generated: ${generatedAt}

## corporate-be

- Backend adalah owner database aplikasi.
- ORM aktif: Prisma dengan datasource PostgreSQL \`DATABASE_URL\`.
- Migration aktif setelah rebuild: baseline \`prisma/migrations/20260528090000_baseline_from_mysql_backup/migration.sql\`.
- Query raw runtime yang terdeteksi masih PostgreSQL-safe, misalnya health check \`SELECT 1\` dan \`SELECT CURRENT_TIMESTAMP\`.
- Service \`career.service.ts\` masih memakai raw SQL ke \`career_content\`; tabel ini tetap BigInt dan tetap dipertahankan di schema canonical.
- Script import legacy lama di \`scripts/import-*.js\`, \`scripts/migrate-*-data.js\`, dan \`scripts/migrate-*-from-mysql.ts\` tidak menjadi jalur rebuild utama. Jalur baru adalah \`scripts/db-rebuild/generate-rebuild-artifacts.cjs\` plus SQL di \`database/db-rebuild\`.

## corporate-cms

- Tidak ditemukan dependency runtime database langsung seperti Prisma/TypeORM/Sequelize/Knex/PostgreSQL client.
- CMS memakai API backend.
- Ada README lama di modul careers yang masih menyebut \`prisma db push\` dan \`DATABASE_URL\`; itu dokumentasi historis dan bukan jalur deploy rebuild.

## corporate-web

- Tidak ditemukan dependency runtime database langsung.
- Website public bergantung pada API/backend atau data statis.

## corporate-fm

- Tidak ditemukan dependency runtime database langsung.
- Service file manager tetap bergantung pada file/S3 API, bukan schema PostgreSQL aplikasi.

## Rekomendasi

- Jalankan build dan smoke test semua aplikasi setelah dependency lokal/staging lengkap.
- Setelah import canonical, validasi endpoint backend yang dipakai CMS/web/FM: menu, news, report, announcement, career, contact, auth, dan file manager.
- Jangan jalankan script import legacy lama ke production. Gunakan artefak \`database/db-rebuild\` pada database kosong lokal/staging.
`;

  const migrationNotes = `# Migration Notes

## Keputusan

- Migration lama tidak dihapus dari repository history; migration lama harus diarsipkan ke \`prisma/migrations_legacy_archive/pre_mysql_backup_rebuild_20260528\`.
- Folder aktif \`prisma/migrations\` hanya menyimpan \`migration_lock.toml\` dan satu baseline migration baru dari \`prisma/schema.prisma\`.
- Data legacy tidak masuk migration. Migration hanya membuat struktur aplikasi; import data dilakukan lewat SQL/script setelah DB kosong/staging siap.

## Alasan arsip

- Migration lama terdiri dari banyak tahap incremental dan dua migration \`init\`.
- Beberapa migration lama pernah mengandung operasi destructive seperti \`DROP\`.
- Target rebuild membutuhkan baseline yang dapat dijalankan dari database kosong tanpa membawa konflik schema lama.

## Dampak

- Environment baru menjalankan baseline fresh DB.
- Environment production lama tidak disentuh langsung.
- Jika butuh audit perubahan lama, arsip migration tetap tersedia di repository.
`;

  return {
    'README.md': readme,
    'backup-analysis.md': backupAnalysis,
    'mysql-to-postgres-mapping.md': mappingDoc,
    'import-and-deploy-guide.md': importGuide,
    'validation-checklist.md': validationChecklist,
    'staging-refresh-command.md': stagingRefreshCommand,
    'code-compatibility-audit.md': codeCompatibilityAudit,
    'rollback-plan.md': rollbackPlan,
    'migration-notes.md': migrationNotes,
  };
}

function writeDocs(tables) {
  const docs = generateDocs(tables);
  for (const [fileName, content] of Object.entries(docs)) {
    fs.writeFileSync(path.join(docsRoot, fileName), `${content.trim()}\n`, 'utf8');
  }
}

function main() {
  if (!fs.existsSync(backupSqlPath)) {
    throw new Error(`Backup SQL not found: ${backupSqlPath}`);
  }

  ensureDir(outputRoot);
  ensureDir(docsRoot);

  const sql = fs.readFileSync(backupSqlPath, 'utf8');
  const tables = parseColumnsFromCreate(sql);
  parseAlterMetadata(sql, tables);
  parseInserts(sql, tables);

  const missingTables = LEGACY_TABLES.filter((tableName) => !tables.has(tableName));
  if (missingTables.length > 0) {
    throw new Error(`Missing expected legacy table(s): ${missingTables.join(', ')}`);
  }

  fs.writeFileSync(rawSqlPath, generateRawSql(tables), 'utf8');
  fs.writeFileSync(canonicalSqlPath, generateCanonicalSql(), 'utf8');
  fs.writeFileSync(validationSqlPath, generateValidationSql(tables), 'utf8');
  writeDocs(tables);

  const totalRows = LEGACY_TABLES.reduce((sum, tableName) => sum + (tables.get(tableName)?.rows.length ?? 0), 0);
  console.log(`Backup SQL: ${backupSqlPath}`);
  console.log(`Legacy tables: ${LEGACY_TABLES.length}`);
  console.log(`Legacy rows: ${totalRows}`);
  console.log(`Raw SQL: ${rawSqlPath}`);
  console.log(`Canonical import SQL: ${canonicalSqlPath}`);
  console.log(`Validation SQL: ${validationSqlPath}`);
  console.log(`Docs: ${docsRoot}`);
}

main();
