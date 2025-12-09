import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();

/**
 * Cleanup expired refresh tokens from database
 * This function is called by a cron job
 */
export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    const now = new Date();
    
    // Delete all expired refresh tokens
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });

    console.log(`[Token Cleanup] Deleted ${result.count} expired refresh tokens at ${now.toISOString()}`);
  } catch (error) {
    console.error('[Token Cleanup] Error cleaning up expired tokens:', error);
  }
};

/**
 * Cleanup expired password reset tokens
 */
export const cleanupExpiredPasswordResetTokens = async (): Promise<void> => {
  try {
    const now = new Date();
    
    // Delete all expired password reset tokens
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: now
            }
          },
          {
            usedAt: {
              not: null
            }
          }
        ]
      }
    });

    console.log(`[Token Cleanup] Deleted ${result.count} expired/used password reset tokens at ${now.toISOString()}`);
  } catch (error) {
    console.error('[Token Cleanup] Error cleaning up password reset tokens:', error);
  }
};

/**
 * Initialize token cleanup cron jobs
 * Runs daily at 2:00 AM
 */
export const initializeTokenCleanupJobs = (): void => {
  // Run every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('[Token Cleanup] Starting scheduled token cleanup...');
    await cleanupExpiredTokens();
    await cleanupExpiredPasswordResetTokens();
    console.log('[Token Cleanup] Scheduled token cleanup completed');
  });

  console.log('[Token Cleanup] Cron jobs initialized - will run daily at 2:00 AM');

  // Run cleanup immediately on startup
  setTimeout(async () => {
    console.log('[Token Cleanup] Running initial cleanup on startup...');
    await cleanupExpiredTokens();
    await cleanupExpiredPasswordResetTokens();
    console.log('[Token Cleanup] Initial cleanup completed');
  }, 5000); // Wait 5 seconds after server starts
};
