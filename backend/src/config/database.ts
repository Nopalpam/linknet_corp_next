import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma Client Instance
 * 
 * This ensures a single instance of PrismaClient is used throughout the application
 * to avoid exhausting database connections in development with hot-reloading.
 */
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Graceful shutdown handler
 */
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
