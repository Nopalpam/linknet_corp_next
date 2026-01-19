import { Request, Response } from 'express';
import prisma from '../config/database';
import { InquiryType } from '@prisma/client';
import { rateLimit } from 'express-rate-limit';
import { logInfo, logError } from '../utils/logger';

// Rate limiter: max 3 requests per IP per hour
export const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // max 3 requests per IP
  message: {
    success: false,
    message: 'Too many submissions from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Store in memory (for production, consider using Redis)
  skipSuccessfulRequests: false,
});

/**
 * Submit contact form
 * @route POST /api/contact-us/submit
 * @access Public
 */
export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      company,
      inquiryType,
      message,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !inquiryType || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields',
      });
    }

    // Validate inquiry type
    const validInquiryTypes = ['BUSINESS', 'SUPPORT', 'CAREER', 'OTHERS'];
    if (!validInquiryTypes.includes(inquiryType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inquiry type',
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Get IP address
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      null;

    // Get user agent
    const userAgent = req.headers['user-agent'] || null;

    // Save to database
    const contactSubmission = await prisma.contactUs.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        role: role || null,
        company: company || null,
        inquiryType: inquiryType.toUpperCase() as InquiryType,
        message,
        ipAddress,
        userAgent,
      },
    });

    logInfo(`Contact form submitted: ${contactSubmission.id}`, {
      email,
      inquiryType,
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        id: contactSubmission.id,
        submittedAt: contactSubmission.submittedAt,
      },
    });
  } catch (error) {
    logError(error as Error, { context: 'submitContactForm' });
    return res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again later.',
    });
  }
};

/**
 * Get all contact submissions (Admin only)
 * @route GET /api/contact-us
 * @access Private (Admin)
 */
export const getAllContactSubmissions = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      inquiryType,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Filter by inquiry type
    if (inquiryType) {
      where.inquiryType = (inquiryType as string).toUpperCase();
    }

    // Search by email, name, or message
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { message: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [submissions, total] = await Promise.all([
      prisma.contactUs.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.contactUs.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logError(error as Error, { context: 'getAllContactSubmissions' });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submissions',
    });
  }
};

/**
 * Get contact submission by ID (Admin only)
 * @route GET /api/contact-us/:id
 * @access Private (Admin)
 */
export const getContactSubmissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await prisma.contactUs.findUnique({
      where: { id },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    logError(error as Error, { context: 'getContactSubmissionById' });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submission',
    });
  }
};

/**
 * Delete contact submission (Admin only)
 * @route DELETE /api/contact-us/:id
 * @access Private (Admin)
 */
export const deleteContactSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await prisma.contactUs.findUnique({
      where: { id },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
    }

    await prisma.contactUs.delete({
      where: { id },
    });

    logInfo(`Contact submission deleted: ${id}`);

    return res.status(200).json({
      success: true,
      message: 'Contact submission deleted successfully',
    });
  } catch (error) {
    logError(error as Error, { context: 'deleteContactSubmission' });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission',
    });
  }
};
