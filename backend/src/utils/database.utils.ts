import { PrismaClient } from '@prisma/client';
import prisma from '@config/database';

type UpdateModel<TResult> = {
  update(args: {
    where: Record<string, unknown>;
    data: {
      deletedAt: Date | null;
    };
  }): Promise<TResult>;
};

type FindManyArgs = {
  where?: Record<string, unknown>;
} & Record<string, unknown>;

type FindManyModel<TResult> = {
  findMany(args: FindManyArgs & { where: Record<string, unknown> }): Promise<TResult[]>;
};

type FindFirstModel<TResult> = {
  findFirst(args: { where: Record<string, unknown> }): Promise<TResult | null>;
};

type CountModel = {
  count(args: { where: Record<string, unknown> }): Promise<number>;
};

/**
 * Database Connection Utilities
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private client: PrismaClient;

  private constructor() {
    this.client = prisma;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Get Prisma client
   */
  public getClient(): PrismaClient {
    return this.client;
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  /**
   * Disconnect from database
   */
  public async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }

  /**
   * Execute transaction
   */
  public async transaction<T>(
    fn: (tx: PrismaClient) => Promise<T>
  ): Promise<T> {
    return await this.client.$transaction(async (tx) => {
      return await fn(tx as PrismaClient);
    });
  }

  /**
   * Soft delete helper
   * Updates deletedAt timestamp instead of hard deleting
   */
  public async softDelete(
    model: UpdateModel<unknown>,
    where: Record<string, unknown>
  ): Promise<unknown> {
    return await model.update({
      where,
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Restore soft deleted record
   */
  public async restore(
    model: UpdateModel<unknown>,
    where: Record<string, unknown>
  ): Promise<unknown> {
    return await model.update({
      where,
      data: {
        deletedAt: null,
      },
    });
  }

  /**
   * Find with soft delete filter
   */
  public async findManyActive(
    model: FindManyModel<unknown>,
    args?: FindManyArgs
  ): Promise<unknown[]> {
    return await model.findMany({
      ...args,
      where: {
        ...args?.where,
        deletedAt: null,
      },
    });
  }

  /**
   * Find one with soft delete filter
   */
  public async findUniqueActive(
    model: FindFirstModel<unknown>,
    args: { where: Record<string, unknown> }
  ): Promise<unknown> {
    return await model.findFirst({
      where: {
        ...args.where,
        deletedAt: null,
      },
    });
  }

  /**
   * Count with soft delete filter
   */
  public async countActive(
    model: CountModel,
    where?: Record<string, unknown>
  ): Promise<number> {
    return await model.count({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }

  /**
   * Pagination helper
   */
  public getPaginationParams(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return {
      skip,
      take: limit,
    };
  }

  /**
   * Generate pagination metadata
   */
  public generatePaginationMeta(
    total: number,
    page: number,
    limit: number
  ) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();
export default prisma;
