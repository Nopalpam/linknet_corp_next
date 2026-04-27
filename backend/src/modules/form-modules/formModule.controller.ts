import { Request, Response } from 'express';
import { ZodError } from 'zod';
import prisma from '../../config/database';
import { asyncHandler } from '../../middleware/errorHandler.middleware';
import { ValidationError } from '../../types/error.types';
import {
  publicFormModuleParamsSchema,
  publicFormSubmissionSchema,
} from './formModule.validation';
import { FormModuleService } from './formModule.service';

const formModuleService = new FormModuleService(prisma);

const mapBusinessUnitParam = (value: 'enterprise' | 'fiber' | 'media') => value.toUpperCase() as 'ENTERPRISE' | 'FIBER' | 'MEDIA';

export const getPublicFormModule = asyncHandler(async (req: Request, res: Response) => {
  try {
    const params = publicFormModuleParamsSchema.parse(req.params);
    const module = await formModuleService.getPublicFormModule(mapBusinessUnitParam(params.businessUnit), params.slug);

    res.json({
      success: true,
      data: module,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid form module route parameters');
    }

    throw error;
  }
});

export const submitPublicFormModule = asyncHandler(async (req: Request, res: Response) => {
  try {
    const params = publicFormModuleParamsSchema.parse(req.params);
    const payload = publicFormSubmissionSchema.parse(req.body);
    const result = await formModuleService.createSubmission(
      mapBusinessUnitParam(params.businessUnit),
      params.slug,
      payload,
      {
        ipAddress: req.ip,
        userAgent: req.get('user-agent') ?? null,
      }
    );

    res.status(result.persisted ? 201 : 200).json({
      success: true,
      message: result.persisted
        ? 'Form submission stored successfully'
        : 'Form route resolved successfully',
      data: result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid form submission payload');
    }

    throw error;
  }
});