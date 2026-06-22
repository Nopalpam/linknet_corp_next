export const PRISMA_DATASOURCE_ENV = 'PRISMA_DB_URL';

const SUPPORTED_DB_TYPES = new Set(['pgsql', 'postgres', 'postgresql']);
const DEFAULT_SCHEMA = 'public';

type EnvMap = NodeJS.ProcessEnv;

interface BuildOptions {
  allowIncomplete?: boolean;
}

function clean(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function sslEnabled(env: EnvMap): boolean {
  const sslValue = clean(env.DB_LINKNETCOID_SSL_ENABLED) || clean(env.DB_SSL);
  return ['require', 'true', '1', 'enabled'].includes((sslValue || '').toLowerCase());
}

export function getMissingDatabaseEnv(env: EnvMap = process.env): string[] {
  const required = [
    'DB_TYPE',
    'DB_LINKNETCOID_HOST',
    'DB_LINKNETCOID_PORT',
    'DB_LINKNETCOID_DATABASE',
    'DB_LINKNETCOID_USER',
    'DB_LINKNETCOID_PASSWORD',
    'DB_SSL',
    'DB_LINKNETCOID_SSL_ENABLED',
    'DB_LINKNETCOID_SSL_REJECT_UNAUTHORIZED',
  ];

  return required.filter((name) => !clean(env[name]));
}

export function buildPrismaConnectionUrl(env: EnvMap = process.env): string {
  const missing = getMissingDatabaseEnv(env);

  if (missing.length > 0) {
    throw new Error(`Missing database environment variables: ${missing.join(', ')}`);
  }

  const dbType = clean(env.DB_TYPE)?.toLowerCase();
  if (!dbType || !SUPPORTED_DB_TYPES.has(dbType)) {
    throw new Error('DB_TYPE must be one of: pgsql, postgres, postgresql');
  }

  const port = clean(env.DB_LINKNETCOID_PORT) || '5432';
  if (!/^\d+$/.test(port)) {
    throw new Error('DB_LINKNETCOID_PORT must be a valid TCP port number');
  }

  const connectionUrl = new URL('postgresql://localhost');
  connectionUrl.hostname = clean(env.DB_LINKNETCOID_HOST) as string;
  connectionUrl.port = port;
  connectionUrl.username = clean(env.DB_LINKNETCOID_USER) as string;
  connectionUrl.password = clean(env.DB_LINKNETCOID_PASSWORD) as string;
  connectionUrl.pathname = `/${clean(env.DB_LINKNETCOID_DATABASE)}`;
  connectionUrl.searchParams.set('schema', DEFAULT_SCHEMA);

  if (sslEnabled(env)) {
    connectionUrl.searchParams.set('sslmode', 'require');

    if ((clean(env.DB_LINKNETCOID_SSL_REJECT_UNAUTHORIZED) || '').toLowerCase() === 'false') {
      connectionUrl.searchParams.set('sslaccept', 'accept_invalid_certs');
    } else {
      connectionUrl.searchParams.set('sslaccept', 'strict');
    }
  }

  return connectionUrl.toString();
}

export function applyPrismaDatasourceEnv(
  env: EnvMap = process.env,
  options: BuildOptions = {}
): string | undefined {
  if (clean(env[PRISMA_DATASOURCE_ENV])) {
    return env[PRISMA_DATASOURCE_ENV];
  }

  const missing = getMissingDatabaseEnv(env);
  if (missing.length > 0 && options.allowIncomplete) {
    return undefined;
  }

  const url = buildPrismaConnectionUrl(env);
  env[PRISMA_DATASOURCE_ENV] = url;
  return url;
}

export function getDatabaseConfigStatus(env: EnvMap = process.env) {
  return {
    type: clean(env.DB_TYPE),
    host: !!clean(env.DB_LINKNETCOID_HOST),
    port: !!clean(env.DB_LINKNETCOID_PORT),
    database: !!clean(env.DB_LINKNETCOID_DATABASE),
    user: !!clean(env.DB_LINKNETCOID_USER),
    password: !!clean(env.DB_LINKNETCOID_PASSWORD),
    ssl: sslEnabled(env),
    rejectUnauthorized: clean(env.DB_LINKNETCOID_SSL_REJECT_UNAUTHORIZED) !== 'false',
    missing: getMissingDatabaseEnv(env),
  };
}
