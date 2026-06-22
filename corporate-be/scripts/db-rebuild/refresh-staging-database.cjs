#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const backendRoot = path.resolve(__dirname, '..', '..');
const rawSqlPath = path.join(backendRoot, 'database', 'db-rebuild', 'linknet_bersih_legacy_raw.postgres.sql');
const canonicalSqlPath = path.join(backendRoot, 'database', 'db-rebuild', 'import_legacy_canonical.sql');
const validationSqlPath = path.join(backendRoot, 'database', 'db-rebuild', 'validate_legacy_rebuild.sql');
const envPath = path.join(backendRoot, '.env');

const args = new Set(process.argv.slice(2));
const isDryRun = args.has('--dry-run');
const hasConfirmation = args.has('--confirm-staging-refresh');
const psqlBin = process.env.PSQL_BIN || 'psql';
const prismaBin =
  process.env.PRISMA_BIN ||
  path.join(backendRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma');
const shouldGeneratePrismaClient =
  process.env.DB_REFRESH_GENERATE_CLIENT === '1' ||
  process.env.DB_REFRESH_GENERATE_CLIENT === 'true';

const resetSql = [
  'SET client_min_messages TO warning;',
  'DROP SCHEMA IF EXISTS legacy_raw CASCADE;',
  'DROP SCHEMA IF EXISTS public CASCADE;',
  'CREATE SCHEMA public;',
  'GRANT ALL ON SCHEMA public TO public;',
].join(' ');

let currentStepName = null;
let tempDir = null;

function log(message) {
  console.log(`[db:staging:refresh] ${message}`);
}

function fail(error) {
  console.error('');
  console.error('[db:staging:refresh] FINAL STATUS: FAILED');
  if (currentStepName) {
    console.error(`[db:staging:refresh] Failed step: ${currentStepName}`);
  }
  console.error(`[db:staging:refresh] Reason: ${error.message}`);
  console.error('[db:staging:refresh] Result: database refresh did not complete. Seed/import may not have run.');
  console.error('[db:staging:refresh] Next action: fix the error above, then rerun npm run db:staging:refresh on the staging/local database.');
  process.exitCode = 1;
}

function success(message) {
  console.log('');
  console.log('[db:staging:refresh] FINAL STATUS: SUCCESS');
  console.log(`[db:staging:refresh] ${message}`);
}

function loadDotEnv() {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      continue;
    }

    const key = match[1];
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = value;
    }
  }
}

function parseDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set. Set it in .env or the shell before running this command.');
  }

  let parsed;
  try {
    parsed = new URL(databaseUrl);
  } catch (error) {
    throw new Error(`DATABASE_URL is not a valid URL: ${error.message}`);
  }

  if (!/^postgres(ql)?:$/.test(parsed.protocol)) {
    throw new Error(`DATABASE_URL must use PostgreSQL, received protocol ${parsed.protocol}`);
  }

  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  if (!databaseName) {
    throw new Error('DATABASE_URL does not include a database name.');
  }

  return { databaseUrl, parsed, databaseName };
}

function psqlUrl(databaseUrl) {
  const parsed = new URL(databaseUrl);
  parsed.searchParams.delete('schema');
  return parsed.toString();
}

function maskUrl(value) {
  try {
    const parsed = new URL(value);
    if (parsed.password) {
      parsed.password = '****';
    }
    return parsed.toString();
  } catch (_error) {
    return String(value).replace(/(:\/\/[^:\s]+:)[^@\s]+@/, '$1****@');
  }
}

function maskSensitiveOutput(value) {
  return String(value).replace(/(postgres(?:ql)?:\/\/[^:\s]+:)[^@\s]+@/gi, '$1****@');
}

function ensureSafeTarget(parsed, databaseName) {
  const host = parsed.hostname || '';
  const rawTarget = `${host}/${databaseName}`;

  if (/(^|[-_.])(prod|production)([-_.]|$)/i.test(rawTarget) || /(prod|production)/i.test(databaseName)) {
    throw new Error(`Refusing to refresh a database whose host/name looks like production: ${rawTarget}`);
  }

  if (process.env.DB_REFRESH_EXPECTED_DATABASE && process.env.DB_REFRESH_EXPECTED_DATABASE !== databaseName) {
    throw new Error(
      `DB_REFRESH_EXPECTED_DATABASE is ${process.env.DB_REFRESH_EXPECTED_DATABASE}, but DATABASE_URL points to ${databaseName}.`,
    );
  }
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}. Run npm run db:rebuild:generate first.`);
  }
}

function ensureExecutableFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}. Make sure dependencies are installed in the Docker image.`);
  }
}

function displayCommand(command, commandArgs) {
  return [command, ...commandArgs]
    .map((part) => {
      const value = String(part);
      const masked = value.startsWith('postgres://') || value.startsWith('postgresql://') ? maskUrl(value) : value;
      return /\s/.test(masked) ? `"${masked}"` : masked;
    })
    .join(' ');
}

function tailOutput(value) {
  const lines = maskSensitiveOutput(value)
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);

  return lines.slice(-20).join('\n');
}

function ensureTempDir() {
  if (!tempDir) {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'linknet-db-refresh-'));
  }
  return tempDir;
}

function psqlIncludePath(filePath) {
  const normalized = path.resolve(filePath).split(path.sep).join('/');
  for (const char of normalized) {
    if (char === "'" || char === '\r' || char === '\n' || char === '\0') {
      throw new Error(`Unsafe psql include path: ${filePath}`);
    }
  }
  return normalized;
}

function createPsqlWrapper(fileName, sqlFilePath, statements = []) {
  const wrapperPath = path.join(ensureTempDir(), fileName);
  const content = [
    '\\set ON_ERROR_STOP on',
    'SET client_min_messages TO warning;',
    ...statements,
    `\\i '${psqlIncludePath(sqlFilePath)}'`,
    '',
  ].join('\n');

  fs.writeFileSync(wrapperPath, content, 'utf8');
  return wrapperPath;
}

function runCommand(stepName, command, commandArgs, options = {}) {
  currentStepName = stepName;
  const commandLine = displayCommand(command, commandArgs);
  log(`Step: ${stepName}`);
  console.log(`> ${commandLine}`);

  if (isDryRun) {
    return;
  }

  const result = spawnSync(command, commandArgs, {
    cwd: backendRoot,
    env: process.env,
    encoding: 'utf8',
    maxBuffer: 100 * 1024 * 1024,
    shell: options.shell ?? false,
  });

  const stdout = result.stdout ? maskSensitiveOutput(result.stdout) : '';
  const stderr = result.stderr ? maskSensitiveOutput(result.stderr) : '';

  if (stdout) {
    process.stdout.write(stdout);
  }
  if (stderr) {
    process.stderr.write(stderr);
  }

  if (result.error) {
    throw new Error(`${commandLine} could not start: ${result.error.message}`);
  }

  if (result.signal) {
    throw new Error(`${commandLine} was stopped by signal ${result.signal}`);
  }

  if (result.status !== 0) {
    const lastOutput = tailOutput(`${stdout}\n${stderr}`);
    const hint = lastOutput ? ` Last output:\n${lastOutput}` : ' No output was returned by the process.';
    throw new Error(`${commandLine} failed with exit code ${result.status}.${hint}`);
  }
}

function main() {
  try {
    loadDotEnv();

    if (!hasConfirmation) {
      throw new Error(
        'Missing --confirm-staging-refresh. This command drops schema public and legacy_raw before rebuilding.',
      );
    }

    const { databaseUrl, parsed, databaseName } = parseDatabaseUrl();
    ensureSafeTarget(parsed, databaseName);
    ensureFile(rawSqlPath, 'Raw legacy SQL');
    ensureFile(canonicalSqlPath, 'Canonical seed/import SQL');
    ensureFile(validationSqlPath, 'Validation SQL');
    ensureExecutableFile(prismaBin, 'Prisma CLI');

    const cleanPsqlUrl = psqlUrl(databaseUrl);

    log(`Target database: ${maskUrl(databaseUrl)}`);
    log('WARNING: this command drops schema public and legacy_raw before rebuilding.');
    log('Expected result: migration creates tables, canonical seed/import fills data, validation checks counts.');
    if (!shouldGeneratePrismaClient) {
      log('Skipping Prisma client generation. Docker image should already contain the generated Prisma client.');
    }

    const rawImportWrapper = createPsqlWrapper('import-legacy-raw.sql', rawSqlPath, [
      "SET legacy_rebuild.allow_import = 'true';",
      'CREATE SCHEMA IF NOT EXISTS legacy_raw;',
    ]);
    const canonicalImportWrapper = createPsqlWrapper('import-legacy-canonical.sql', canonicalSqlPath, [
      "SET legacy_rebuild.allow_import = 'true';",
      'CREATE SCHEMA IF NOT EXISTS legacy_raw;',
    ]);
    const validationWrapper = createPsqlWrapper('validate-legacy-rebuild.sql', validationSqlPath);

    const steps = [
      {
        name: 'Reset staging schemas',
        command: psqlBin,
        args: [cleanPsqlUrl, '-v', 'ON_ERROR_STOP=1', '-c', resetSql],
      },
      {
        name: 'Run Prisma migration',
        command: prismaBin,
        args: ['migrate', 'deploy'],
        options: { shell: process.platform === 'win32' },
      },
      ...(shouldGeneratePrismaClient
        ? [
            {
              name: 'Generate Prisma client',
              command: prismaBin,
              args: ['generate'],
              options: { shell: process.platform === 'win32' },
            },
          ]
        : []),
      {
        name: 'Import raw legacy backup into legacy_raw',
        command: psqlBin,
        args: [cleanPsqlUrl, '-v', 'ON_ERROR_STOP=1', '-f', rawImportWrapper],
      },
      {
        name: 'Seed canonical public tables from legacy_raw',
        command: psqlBin,
        args: [cleanPsqlUrl, '-v', 'ON_ERROR_STOP=1', '-f', canonicalImportWrapper],
      },
      {
        name: 'Validate imported data and sequences',
        command: psqlBin,
        args: [cleanPsqlUrl, '-v', 'ON_ERROR_STOP=1', '-f', validationWrapper],
      },
    ];

    for (const step of steps) {
      runCommand(step.name, step.command, step.args, step.options);
    }

    if (isDryRun) {
      success('DRY RUN SUCCESS - no database changes were executed.');
      return;
    }

    success('Database refresh completed: migration SUCCESS, seed/import SUCCESS, validation SUCCESS.');
  } catch (error) {
    fail(error);
  } finally {
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

main();
