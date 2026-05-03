import { Request, Response } from 'express';
import { ZodError } from 'zod';
import prisma from '../../config/database';
import { asyncHandler } from '../../middleware/errorHandler.middleware';
import { AuthRequest } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { Permission } from '../../constants/permissions';
import { ValidationError } from '../../types/error.types';
import {
  createFormModuleSchema,
  formModuleIdParamSchema,
  formModuleQuerySchema,
  formSubmissionIdParamSchema,
  formSubmissionQuerySchema,
  updateFormModuleSchema,
} from './formModule.validation';
import { FormModuleService } from './formModule.service';

const formModuleService = new FormModuleService(prisma);

export const getFormModules = [
  requirePermission(Permission.FORM_MODULES_READ),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const query = formModuleQuerySchema.parse(req.query);
      const result = await formModuleService.getFormModules(query);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid form module query parameters');
      }

      throw error;
    }
  }),
];

export const getFormModuleById = [
  requirePermission(Permission.FORM_MODULES_READ),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const params = formModuleIdParamSchema.parse(req.params);
      const module = await formModuleService.getFormModuleById(params.id);

      res.json({
        success: true,
        data: module,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid form module id');
      }

      throw error;
    }
  }),
];

export const createFormModule = [
  requirePermission(Permission.FORM_MODULES_CREATE),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const payload = createFormModuleSchema.parse(req.body);
      const module = await formModuleService.createFormModule(payload);

      res.status(201).json({
        success: true,
        message: 'Form module created successfully',
        data: module,
        meta: {
          actorId: req.user?.id ?? null,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid form module payload');
      }

      throw error;
    }
  }),
];

export const updateFormModule = [
  requirePermission(Permission.FORM_MODULES_UPDATE),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const params = formModuleIdParamSchema.parse(req.params);
      const payload = updateFormModuleSchema.parse(req.body);
      const module = await formModuleService.updateFormModule(params.id, payload);

      res.json({
        success: true,
        message: 'Form module updated successfully',
        data: module,
        meta: {
          actorId: req.user?.id ?? null,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid form module payload');
      }

      throw error;
    }
  }),
];

export const deleteFormModule = [
  requirePermission(Permission.FORM_MODULES_DELETE),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const params = formModuleIdParamSchema.parse(req.params);
      await formModuleService.deleteFormModule(params.id);

      res.json({
        success: true,
        message: 'Form module archived successfully',
        meta: {
          actorId: req.user?.id ?? null,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid form module id');
      }

      throw error;
    }
  }),
];

export const getFormModuleSubmissions = [
  requirePermission(Permission.FORM_SUBMISSIONS_READ),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const params = formModuleIdParamSchema.parse(req.params);
      const query = formSubmissionQuerySchema.parse(req.query);
      const result = await formModuleService.getFormSubmissions(params.id, query);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        filters: result.filters,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid form submission query');
      }

      throw error;
    }
  }),
];

export const exportFormModuleSubmissions = [
  requirePermission(Permission.FORM_SUBMISSIONS_READ),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const params = formModuleIdParamSchema.parse(req.params);
      const query = formSubmissionQuerySchema.parse(req.query);
      const result = await formModuleService.exportFormSubmissions(params.id, query);

      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.status(200).send(result.body);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid form submission export query');
      }

      throw error;
    }
  }),
];

export const getFormModuleSubmissionById = [
  requirePermission(Permission.FORM_SUBMISSIONS_READ),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const params = formSubmissionIdParamSchema.parse(req.params);
      const submission = await formModuleService.getFormSubmissionById(params.id, params.submissionId);

      res.json({
        success: true,
        data: submission,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid form submission id');
      }

      throw error;
    }
  }),
];

export const retryFormModuleSubmissionDispatches = [
  requirePermission(Permission.FORM_MODULES_UPDATE),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const params = formSubmissionIdParamSchema.parse(req.params);
      const submission = await formModuleService.retrySubmissionDispatches(params.id, params.submissionId);

      res.json({
        success: true,
        message: 'Form submission dispatch retried successfully',
        data: submission,
        meta: {
          actorId: req.user?.id ?? null,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid form submission id');
      }

      throw error;
    }
  }),
];
