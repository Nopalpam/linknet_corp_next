import { PrismaClient, UserStatus } from '@prisma/client';
import cron from 'node-cron';
import { logInfo, logError } from '@utils/logger';

const prisma = new PrismaClient();

const DORMANT_USER_DAYS = parseInt(process.env.DORMANT_USER_DISABLE_DAYS || '30', 10);
const isDormantDisableEnabled = (): boolean =>
  process.env.AUTO_DISABLE_DORMANT_USERS === 'true' ||
  (process.env.NODE_ENV === 'production' && process.env.AUTO_DISABLE_DORMANT_USERS !== 'false');

export const disableDormantUsers = async (): Promise<number> => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DORMANT_USER_DAYS);

  const result = await prisma.user.updateMany({
    where: {
      status: UserStatus.ACTIVE,
      deletedAt: null,
      OR: [
        { lastLoginAt: { lt: cutoff } },
        {
          lastLoginAt: null,
          createdAt: { lt: cutoff },
        },
      ],
    },
    data: {
      status: UserStatus.INACTIVE,
    },
  });

  logInfo('Dormant user disable job completed', {
    disabledCount: result.count,
    dormantUserDays: DORMANT_USER_DAYS,
  });

  return result.count;
};

export const initializeAccountLifecycleJobs = (): void => {
  if (!isDormantDisableEnabled()) {
    logInfo('Dormant user disable job is disabled');
    return;
  }

  cron.schedule('15 1 * * *', async () => {
    try {
      await disableDormantUsers();
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Dormant user disable job failed'));
    }
  });

  logInfo('Dormant user disable job initialized', {
    schedule: '15 1 * * *',
    dormantUserDays: DORMANT_USER_DAYS,
  });
};
