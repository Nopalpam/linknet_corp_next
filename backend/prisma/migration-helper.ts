/**
 * Prisma Migration Helper
 * Run this before creating your first migration
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Use process.cwd() to get the backend root directory
const BACKEND_DIR = process.cwd();
const ENV_FILE = path.join(BACKEND_DIR, '.env');
const ENV_EXAMPLE = path.join(BACKEND_DIR, '.env.example');

function checkEnvironment() {
  console.log('🔍 Checking environment configuration...\n');
  console.log(`Looking for .env at: ${ENV_FILE}`);
  console.log(`Looking for .env.example at: ${ENV_EXAMPLE}\n`);

  if (!fs.existsSync(ENV_FILE)) {
    console.log('⚠️  .env file not found!');
    console.log('📝 Creating .env from .env.example...\n');

    if (fs.existsSync(ENV_EXAMPLE)) {
      fs.copyFileSync(ENV_EXAMPLE, ENV_FILE);
      console.log('✅ .env file created!');
      console.log('⚠️  Please update DATABASE_URL in .env file before continuing.\n');
      process.exit(0);
    } else {
      console.log('❌ .env.example not found!');
      process.exit(1);
    }
  }

  const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  const databaseUrl = envContent.match(/DATABASE_URL="?([^"\n]+)"?/)?.[1];

  if (!databaseUrl || databaseUrl.includes('username:password')) {
    console.log('❌ DATABASE_URL not configured properly!');
    console.log('Please update DATABASE_URL in .env file.\n');
    console.log('Example:');
    console.log('DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/linknetcorp?schema=public"\n');
    process.exit(1);
  }

  console.log('✅ Environment configuration looks good!\n');
}

function runCommand(command: string, description: string) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: BACKEND_DIR });
    console.log(`✅ ${description} completed!\n`);
  } catch (error) {
    console.error(`❌ ${description} failed!`);
    throw error;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Prisma Migration Setup Helper           ║');
  console.log('╚════════════════════════════════════════════╝\n');

  checkEnvironment();

  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'init':
      console.log('📦 Initializing Prisma...\n');
      runCommand('npx prisma generate', 'Generating Prisma Client');
      runCommand('npx prisma migrate dev --name init', 'Creating initial migration');
      console.log('🎉 Prisma initialization complete!\n');
      console.log('Next steps:');
      console.log('  1. Run: npm run db:seed');
      console.log('  2. Start developing!\n');
      break;

    case 'reset':
      console.log('⚠️  WARNING: This will delete all data!\n');
      runCommand('npx prisma migrate reset --force', 'Resetting database');
      console.log('🎉 Database reset complete!\n');
      break;

    case 'generate':
      runCommand('npx prisma generate', 'Generating Prisma Client');
      break;

    case 'studio':
      runCommand('npx prisma studio', 'Opening Prisma Studio');
      break;

    case 'help':
    default:
      console.log('Available commands:\n');
      console.log('  init     - Initialize Prisma and create first migration');
      console.log('  reset    - Reset database and run all migrations');
      console.log('  generate - Generate Prisma Client');
      console.log('  studio   - Open Prisma Studio\n');
      console.log('Usage: npm run db:setup <command>\n');
      break;
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
