const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const schemaPath = path.join(projectRoot, 'prisma', 'schema.prisma');
const generatedClientPath = path.join(projectRoot, 'node_modules', '.prisma', 'client', 'index.d.ts');

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function getMtimeMs(filePath) {
  return fs.statSync(filePath).mtimeMs;
}

function shouldGenerateClient() {
  if (!fileExists(schemaPath)) {
    console.warn('[predev] Prisma schema not found, skipping generate check.');
    return false;
  }

  if (!fileExists(generatedClientPath)) {
    console.log('[predev] Prisma client not found. Running prisma generate...');
    return true;
  }

  const schemaMtime = getMtimeMs(schemaPath);
  const clientMtime = getMtimeMs(generatedClientPath);

  if (schemaMtime > clientMtime) {
    console.log('[predev] Prisma schema changed. Running prisma generate...');
    return true;
  }

  console.log('[predev] Prisma client is up to date. Skipping prisma generate.');
  return false;
}

if (!shouldGenerateClient()) {
  process.exit(0);
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['prisma', 'generate'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error('[predev] Failed to run prisma generate:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);