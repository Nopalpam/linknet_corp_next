const dotenv = require('dotenv');

const PRISMA_DATASOURCE_ENV = 'PRISMA_DB_URL';
const SUPPORTED_DB_TYPES = new Set(['pgsql', 'postgres', 'postgresql']);

dotenv.config();

function clean(value) {
  const normalized = value && value.trim();
  return normalized || undefined;
}

function getMissingDatabaseEnv(env) {
  return [
    'DB_TYPE',
    'DB_LINKNETCOID_HOST',
    'DB_LINKNETCOID_PORT',
    'DB_LINKNETCOID_DATABASE',
    'DB_LINKNETCOID_USER',
    'DB_LINKNETCOID_PASSWORD',
    'DB_SSL',
    'DB_LINKNETCOID_SSL_ENABLED',
    'DB_LINKNETCOID_SSL_REJECT_UNAUTHORIZED',
  ].filter((name) => !clean(env[name]));
}

function isPrismaGenerateCommand() {
  return process.argv.some((arg) => arg === 'generate');
}

function isOfflineCommand() {
  return isPrismaGenerateCommand() || process.argv.some((arg) => arg.includes('jest'));
}

function buildPrismaConnectionUrl(env) {
  const missing = getMissingDatabaseEnv(env);

  if (missing.length > 0) {
    if (isOfflineCommand()) {
      return 'postgresql://prisma:prisma@localhost:5432/linknetcoid?schema=public';
    }

    throw new Error(`Missing database environment variables: ${missing.join(', ')}`);
  }

  const dbType = clean(env.DB_TYPE).toLowerCase();
  if (!SUPPORTED_DB_TYPES.has(dbType)) {
    throw new Error('DB_TYPE must be one of: pgsql, postgres, postgresql');
  }

  const port = clean(env.DB_LINKNETCOID_PORT) || '5432';
  if (!/^\d+$/.test(port)) {
    throw new Error('DB_LINKNETCOID_PORT must be a valid TCP port number');
  }

  const connectionUrl = new URL('postgresql://localhost');
  connectionUrl.hostname = clean(env.DB_LINKNETCOID_HOST);
  connectionUrl.port = port;
  connectionUrl.username = clean(env.DB_LINKNETCOID_USER);
  connectionUrl.password = clean(env.DB_LINKNETCOID_PASSWORD);
  connectionUrl.pathname = `/${clean(env.DB_LINKNETCOID_DATABASE)}`;
  connectionUrl.searchParams.set('schema', 'public');

  const sslValue = (clean(env.DB_LINKNETCOID_SSL_ENABLED) || clean(env.DB_SSL) || '').toLowerCase();
  if (['require', 'true', '1', 'enabled'].includes(sslValue)) {
    connectionUrl.searchParams.set('sslmode', 'require');

    if ((clean(env.DB_LINKNETCOID_SSL_REJECT_UNAUTHORIZED) || '').toLowerCase() === 'false') {
      connectionUrl.searchParams.set('sslaccept', 'accept_invalid_certs');
    } else {
      connectionUrl.searchParams.set('sslaccept', 'strict');
    }
  }

  return connectionUrl.toString();
}

if (!clean(process.env[PRISMA_DATASOURCE_ENV])) {
  process.env[PRISMA_DATASOURCE_ENV] = buildPrismaConnectionUrl(process.env);
}
