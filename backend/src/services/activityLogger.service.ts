import Queue from 'bull';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define log data interface
export interface LogActivityData {
  userId?: string;
  action: string; // create, update, delete, login, logout
  module: string; // users, news, pages, roles, permissions, etc.
  recordId?: string;
  oldData?: any;
  newData?: any;
  description?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

// Create Bull queue for activity logging
export const activityLogQueue = new Queue('activity-log', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Process activity log jobs
activityLogQueue.process(async (job) => {
  const logData: LogActivityData = job.data;

  try {
    await prisma.logActivity.create({
      data: {
        userId: logData.userId,
        action: logData.action,
        module: logData.module,
        recordId: logData.recordId,
        oldData: logData.oldData ? JSON.parse(JSON.stringify(logData.oldData)) : null,
        newData: logData.newData ? JSON.parse(JSON.stringify(logData.newData)) : null,
        description: logData.description,
        metadata: logData.metadata,
        ipAddress: logData.ipAddress,
        userAgent: logData.userAgent,
      },
    });

    console.log(
      `[ActivityLog] Logged ${logData.action} on ${logData.module}${logData.recordId ? ` (ID: ${logData.recordId})` : ''} by user ${logData.userId || 'anonymous'}`,
    );
  } catch (error) {
    console.error('[ActivityLog] Failed to create log entry:', error);
    throw error; // Will trigger retry mechanism
  }
});

// Queue event handlers
activityLogQueue.on('error', (error) => {
  console.error('[ActivityLog Queue] Error:', error);
});

activityLogQueue.on('failed', (job, error) => {
  console.error(`[ActivityLog Queue] Job ${job.id} failed:`, error);
});

activityLogQueue.on('completed', (job) => {
  console.log(`[ActivityLog Queue] Job ${job.id} completed`);
});

/**
 * Add activity log to queue (non-blocking)
 * @param logData - Activity log data
 */
export async function logActivity(logData: LogActivityData): Promise<void> {
  try {
    await activityLogQueue.add(logData, {
      priority: logData.action === 'login' || logData.action === 'logout' ? 1 : 5,
    });
  } catch (error) {
    console.error('[ActivityLog] Failed to queue log entry:', error);
    // Don't throw error - we don't want logging failures to affect main operations
  }
}

/**
 * Graceful shutdown
 */
export async function closeActivityLogQueue(): Promise<void> {
  await activityLogQueue.close();
}
