import Queue from 'bull';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Check if Redis is enabled
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';

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

// Create Bull queue for activity logging ONLY if Redis is enabled
let activityLogQueue: Queue.Queue | null = null;

if (REDIS_ENABLED) {
  activityLogQueue = new Queue('activity-log', {
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
} else {
  console.log('[ActivityLog] Redis is disabled. Activity logs will be written directly to database.');
}

export { activityLogQueue };

/**
 * Write activity log directly to database (fallback when Redis is disabled)
 */
async function logActivityDirect(logData: LogActivityData): Promise<void> {
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
  } catch (error) {
    console.error('[ActivityLog] Failed to write log entry directly:', error);
    // Don't throw - logging should not break main operations
  }
}

/**
 * Add activity log to queue (non-blocking)
 * Falls back to direct database write when Redis is disabled
 * @param logData - Activity log data
 */
export async function logActivity(logData: LogActivityData): Promise<void> {
  if (REDIS_ENABLED && activityLogQueue) {
    try {
      await activityLogQueue.add(logData, {
        priority: logData.action === 'login' || logData.action === 'logout' ? 1 : 5,
      });
    } catch (error) {
      console.error('[ActivityLog] Failed to queue log entry, falling back to direct write:', error);
      // Fallback to direct database write
      await logActivityDirect(logData);
    }
  } else {
    // Redis disabled - write directly to database
    await logActivityDirect(logData);
  }
}

/**
 * Graceful shutdown
 */
export async function closeActivityLogQueue(): Promise<void> {
  if (activityLogQueue) {
    await activityLogQueue.close();
  }
}
