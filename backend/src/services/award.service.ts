import { PrismaClient } from '@prisma/client';
import { AppError } from '../types/error.types';

const prisma = new PrismaClient();

type AwardStatus = 'ACTIVE' | 'INACTIVE';

interface AwardData {
  title: string;
  year: number;
  issuer: string;
  description?: string;
  image?: string;
  order?: number;
  status?: AwardStatus;
}

interface AwardOrderUpdate {
  id: string;
  order: number;
}

export class AwardService {
  // Get all awards
  async getAllAwards(status?: AwardStatus) {
    const where: any = status ? { status, deletedAt: null } : { deletedAt: null };
    
    const awards = await prisma.award.findMany({
      where,
      orderBy: [
        { position: 'asc' },
        { year: 'desc' },
      ],
    });

    return awards;
  }

  // Get active awards (for public)
  async getActiveAwards() {
    const awards = await prisma.award.findMany({
      where: {
        status: 'ACTIVE',
        isActive: true,
        deletedAt: null,
      },
      orderBy: [
        { position: 'asc' },
        { year: 'desc' },
      ],
    });

    return awards;
  }

  // Get single award by ID
  async getAwardById(id: string) {
    const award = await prisma.award.findUnique({
      where: { id },
    });

    if (!award) {
      throw new AppError('Award not found', 404);
    }

    return award;
  }

  // Create new award
  async createAward(data: AwardData) {
    // Validate year
    if (data.year < 1900 || data.year > new Date().getFullYear() + 10) {
      throw new AppError('Invalid year', 400);
    }

    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists
    const existing = await prisma.award.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('Award with similar title already exists', 400);
    }

    // Get max position if not provided
    const order = data.order ?? 0;
    if (order === 0) {
      const maxPosition = await prisma.award.aggregate({
        _max: { position: true },
      });
      const position = (maxPosition._max?.position || 0) + 1;

      const award = await prisma.award.create({
        data: {
          title: data.title,
          slug,
          year: data.year,
          issuer: data.issuer,
          description: data.description,
          image: data.image,
          position,
          issueDate: new Date(data.year, 0, 1), // January 1st of the year
          status: data.status || 'ACTIVE',
          isActive: data.status !== 'INACTIVE',
        },
      });

      return award;
    } else {
      const award = await prisma.award.create({
        data: {
          title: data.title,
          slug,
          year: data.year,
          issuer: data.issuer,
          description: data.description,
          image: data.image,
          position: order,
          issueDate: new Date(data.year, 0, 1),
          status: data.status || 'ACTIVE',
          isActive: data.status !== 'INACTIVE',
        },
      });

      return award;
    }
  }

  // Update award
  async updateAward(id: string, data: Partial<AwardData>) {
    // Check if award exists
    const existingAward = await prisma.award.findUnique({
      where: { id },
    });

    if (!existingAward) {
      throw new AppError('Award not found', 404);
    }

    // Validate year if provided
    if (data.year !== undefined) {
      if (data.year < 1900 || data.year > new Date().getFullYear() + 10) {
        throw new AppError('Invalid year', 400);
      }
    }

    // Generate new slug if title changes
    let slug = existingAward.slug;
    if (data.title && data.title !== existingAward.title) {
      slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Check if new slug exists
      const duplicate = await prisma.award.findFirst({
        where: { slug, NOT: { id } },
      });
      if (duplicate) {
        throw new AppError('Award with similar title already exists', 400);
      }
    }

    const award = await prisma.award.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title, slug }),
        ...(data.year !== undefined && { 
          year: data.year,
          issueDate: new Date(data.year, 0, 1)
        }),
        ...(data.issuer !== undefined && { issuer: data.issuer }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.order !== undefined && { position: data.order }),
        ...(data.status !== undefined && { 
          status: data.status,
          isActive: data.status === 'ACTIVE'
        }),
      },
    });

    return award;
  }

  // Delete award
  async deleteAward(id: string) {
    // Check if award exists
    const existingAward = await prisma.award.findUnique({
      where: { id },
    });

    if (!existingAward) {
      throw new AppError('Award not found', 404);
    }

    // Soft delete
    await prisma.award.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Award deleted successfully' };
  }

  // Update awards order
  async updateAwardsOrder(updates: AwardOrderUpdate[]) {
    // Validate all awards exist
    const awardIds = updates.map((u) => u.id);
    const awards = await prisma.award.findMany({
      where: { id: { in: awardIds }, deletedAt: null },
    });

    if (awards.length !== awardIds.length) {
      throw new AppError('One or more awards not found', 404);
    }

    // Update orders in transaction
    await prisma.$transaction(
      updates.map((update) =>
        prisma.award.update({
          where: { id: update.id },
          data: { position: update.order },
        })
      )
    );

    return { message: 'Awards order updated successfully' };
  }

  // Get awards grouped by year
  async getAwardsByYear() {
    const awards = await prisma.award.findMany({
      where: {
        status: 'ACTIVE',
        isActive: true,
        deletedAt: null,
      },
      orderBy: [
        { year: 'desc' },
        { position: 'asc' },
      ],
    });

    // Group by year
    const groupedAwards = awards.reduce((acc, award) => {
      const year = award.year;
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(award);
      return acc;
    }, {} as Record<number, typeof awards>);

    return groupedAwards;
  }
}

export default new AwardService();
