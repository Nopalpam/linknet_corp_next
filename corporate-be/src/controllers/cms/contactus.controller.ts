import { Request, Response } from 'express';
import { PrismaClient, ContactStatus } from '@prisma/client';
import {
  normalizeEnum,
  normalizeOptionalString,
  normalizePositiveInt,
  normalizeSortOrder,
} from '../../utils/securityInput.util';
// import { Parser } from 'json2csv'; // TODO: Install json2csv package

const prisma = new PrismaClient();
const CONTACT_SORT_FIELDS = new Set(['submittedAt', 'firstName', 'lastName', 'email', 'company', 'status']);

/**
 * Get all contact submissions with pagination and filters
 */
export const getContactSubmissions = async (req: Request, res: Response) => {
  try {
    const pageNum = normalizePositiveInt(req.query.page, 1, 100000);
    const limitNum = normalizePositiveInt(req.query.limit, 10, 100);
    const search = normalizeOptionalString(req.query.search, { maxLength: 100 });
    const status = normalizeOptionalString(req.query.status, { maxLength: 30 });
    const inquiryType = normalizeOptionalString(req.query.inquiryType, { maxLength: 100 });
    const dateFrom = normalizeOptionalString(req.query.dateFrom, { maxLength: 10 });
    const dateTo = normalizeOptionalString(req.query.dateTo, { maxLength: 10 });
    const sortBy = normalizeEnum(req.query.sortBy, CONTACT_SORT_FIELDS, 'submittedAt');
    const sortOrder = normalizeSortOrder(req.query.sortOrder);
    const skip = (pageNum - 1) * limitNum;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfNextMonth = new Date(startOfMonth);
    startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

    // Build filter
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (inquiryType) {
      where.inquiryType = inquiryType;
    }

    if (dateFrom || dateTo) {
      where.submittedAt = {
        ...(dateFrom
          ? {
              gte: new Date(`${dateFrom}T00:00:00.000Z`),
            }
          : {}),
        ...(dateTo
          ? {
              lte: new Date(`${dateTo}T23:59:59.999Z`),
            }
          : {}),
      };
    }

    // Get total count
    const [total, totalThisMonth, submissions, stats] = await prisma.$transaction([
      prisma.contactUs.count({ where }),
      prisma.contactUs.count({
        where: {
          ...where,
          submittedAt: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },
        },
      }),
      prisma.contactUs.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          company: true,
          inquiryType: true,
          subject: true,
          message: true,
          status: true,
          submittedAt: true,
          readAt: true,
        },
      }),
      prisma.contactUs.groupBy({
        by: ['status'],
        where,
        orderBy: {
          status: 'asc',
        },
        _count: true,
      }),
    ]);

    const statusCounts = {
      total,
      totalThisMonth,
      new: stats.find(s => s.status === ContactStatus.NEW)?._count || 0,
      read: stats.find(s => s.status === ContactStatus.READ)?._count || 0,
    };

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        stats: statusCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submissions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get contact submission detail by ID
 * Auto mark as read when viewed
 */
export const getContactSubmissionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const submission = await prisma.contactUs.findUnique({
      where: { id },
    });

    if (!submission) {
      res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
      return;
    }

    // Mark as read if still NEW
    if (submission.status === ContactStatus.NEW) {
      await prisma.contactUs.update({
        where: { id },
        data: {
          status: ContactStatus.READ,
          readAt: new Date(),
        },
      });
      submission.status = ContactStatus.READ;
      submission.readAt = new Date();
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error fetching contact submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submission',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete contact submission by ID
 */
export const deleteContactSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const submission = await prisma.contactUs.findUnique({
      where: { id },
    });

    if (!submission) {
      res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
      return;
    }

    await prisma.contactUs.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Contact submission deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete multiple contact submissions
 */
export const deleteMultipleSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid or empty IDs array',
      });
      return;
    }

    const result = await prisma.contactUs.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    res.json({
      success: true,
      message: `${result.count} contact submission(s) deleted successfully`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Error deleting multiple submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact submissions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Export contact submissions to CSV
 */
export const exportContactSubmissions = async (req: Request, res: Response) => {
  try {
    const { status = '', search = '' } = req.query;

    // Build filter
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { subject: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    // Get all submissions (no pagination for export)
    const submissions = await prisma.contactUs.findMany({
      where,
      orderBy: {
        submittedAt: 'desc',
      },
    });

    // Format data for CSV
    const csvData = submissions.map(sub => ({
      'First Name': sub.firstName,
      'Last Name': sub.lastName,
      'Email': sub.email,
      'Phone': sub.phone || '-',
      'Role': sub.role || '-',
      'Company': sub.company || '-',
      'Inquiry Type': sub.inquiryType,
      'Subject': sub.subject || '-',
      'Message': sub.message,
      'Status': sub.status,
      'IP Address': sub.ipAddress || '-',
      'Submitted At': sub.submittedAt.toISOString(),
      'Read At': sub.readAt ? sub.readAt.toISOString() : '-',
    }));

    // Convert to CSV
    // TODO: Uncomment after installing json2csv
    // const parser = new Parser();
    // const csv = parser.parse(csvData);

    // For now, return JSON
    res.header('Content-Type', 'application/json');
    res.header('Content-Disposition', `attachment; filename="contact-submissions-${Date.now()}.json"`);
    
    res.json(csvData);
  } catch (error) {
    console.error('Error exporting contact submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export contact submissions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Mark submission as read/unread
 */
export const updateSubmissionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(ContactStatus).includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
      return;
    }

    const submission = await prisma.contactUs.findUnique({
      where: { id },
    });

    if (!submission) {
      res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
      return;
    }

    const updated = await prisma.contactUs.update({
      where: { id },
      data: {
        status,
        readAt: status === ContactStatus.READ ? new Date() : null,
      },
    });

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating submission status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
