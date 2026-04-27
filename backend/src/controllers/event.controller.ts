import { NextFunction, Request, Response } from 'express';
import { AppError } from '../types/error.types';
import eventService, {
  CreateEventData,
  EventPublicState,
  EventQueryParams,
  UpdateEventData,
} from '../services/event.service';
import eventRegistrationService, {
  CreateEventRegistrationData,
} from '../services/event-registration.service';

function parseQueryParams(query: Request['query'], defaults: { page: number; limit: number; sortBy: string; sortOrder: 'asc' | 'desc' }) {
  const params: EventQueryParams = {
    page: query.page ? parseInt(query.page as string, 10) : defaults.page,
    limit: query.limit ? parseInt(query.limit as string, 10) : defaults.limit,
    search: query.search as string | undefined,
    status: query.status as string | undefined,
    state: query.state as EventPublicState | undefined,
    sortBy: (query.sortBy as string) || defaults.sortBy,
    sortOrder: (query.sortOrder as 'asc' | 'desc') || defaults.sortOrder,
  };

  if ((params.page || 1) < 1 || (params.limit || 1) < 1) {
    throw new AppError('Invalid pagination parameters', 400);
  }

  return params;
}

function parseArticleIds(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item));
      }
    } catch (_error) {
      return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  throw new AppError('Article IDs must be an array of strings', 400);
}

function parseOptionalNumber(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    throw new AppError(`${fieldName} must be a valid number`, 400);
  }

  return numericValue;
}

export class EventController {
  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await eventService.getEvents(
        parseQueryParams(req.query, {
          page: 1,
          limit: 10,
          sortBy: 'updated_at',
          sortOrder: 'desc',
        })
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEventById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError('Invalid Event ID', 400);
      }

      const data = await eventService.getEventById(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        title,
        hero_title,
        slug,
        excerpt,
        content,
        cover_image,
        location,
        venue,
        address,
        map_embed_url,
        organizer_label,
        organizer_name,
        organizer_logo,
        ticket_price,
        register_link,
        registration_end_at,
        max_register_participants,
        start_date,
        end_date,
        status,
        article_ids,
      } = req.body;

      if (!title || title.trim() === '') {
        throw new AppError('Title is required', 400);
      }

      if (!content || content.trim() === '') {
        throw new AppError('Content is required', 400);
      }

      if (!start_date) {
        throw new AppError('Start date is required', 400);
      }

      const data: CreateEventData = {
        title: title.trim(),
        ...(hero_title !== undefined ? { hero_title: String(hero_title) } : {}),
        ...(slug !== undefined ? { slug: String(slug).trim() } : {}),
        ...(excerpt !== undefined ? { excerpt: String(excerpt) } : {}),
        content: String(content),
        ...(cover_image !== undefined ? { cover_image: String(cover_image) } : {}),
        ...(location !== undefined ? { location: String(location) } : {}),
        ...(venue !== undefined ? { venue: String(venue) } : {}),
        ...(address !== undefined ? { address: String(address) } : {}),
        ...(map_embed_url !== undefined ? { map_embed_url: String(map_embed_url) } : {}),
        ...(organizer_label !== undefined ? { organizer_label: String(organizer_label) } : {}),
        ...(organizer_name !== undefined ? { organizer_name: String(organizer_name) } : {}),
        ...(organizer_logo !== undefined ? { organizer_logo: String(organizer_logo) } : {}),
        ...(ticket_price !== undefined ? { ticket_price: String(ticket_price) } : {}),
        ...(register_link !== undefined ? { register_link: String(register_link) } : {}),
        ...(registration_end_at !== undefined ? { registration_end_at } : {}),
        ...(max_register_participants !== undefined
          ? { max_register_participants: parseOptionalNumber(max_register_participants, 'Max register participants') }
          : {}),
        start_date,
        ...(end_date !== undefined ? { end_date } : {}),
        ...(status !== undefined ? { status: String(status) } : {}),
        ...(article_ids !== undefined ? { article_ids: parseArticleIds(article_ids) } : {}),
      };

      const created = await eventService.createEvent(data);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError('Invalid Event ID', 400);
      }

      const {
        title,
        hero_title,
        slug,
        excerpt,
        content,
        cover_image,
        location,
        venue,
        address,
        map_embed_url,
        organizer_label,
        organizer_name,
        organizer_logo,
        ticket_price,
        register_link,
        registration_end_at,
        max_register_participants,
        start_date,
        end_date,
        status,
        article_ids,
      } = req.body;

      if (title !== undefined && title.trim() === '') {
        throw new AppError('Title cannot be empty', 400);
      }

      if (content !== undefined && content.trim() === '') {
        throw new AppError('Content cannot be empty', 400);
      }

      const data: UpdateEventData = {
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        ...(hero_title !== undefined ? { hero_title: String(hero_title) } : {}),
        ...(slug !== undefined ? { slug: String(slug).trim() } : {}),
        ...(excerpt !== undefined ? { excerpt: String(excerpt) } : {}),
        ...(content !== undefined ? { content: String(content) } : {}),
        ...(cover_image !== undefined ? { cover_image: String(cover_image) } : {}),
        ...(location !== undefined ? { location: String(location) } : {}),
        ...(venue !== undefined ? { venue: String(venue) } : {}),
        ...(address !== undefined ? { address: String(address) } : {}),
        ...(map_embed_url !== undefined ? { map_embed_url: String(map_embed_url) } : {}),
        ...(organizer_label !== undefined ? { organizer_label: String(organizer_label) } : {}),
        ...(organizer_name !== undefined ? { organizer_name: String(organizer_name) } : {}),
        ...(organizer_logo !== undefined ? { organizer_logo: String(organizer_logo) } : {}),
        ...(ticket_price !== undefined ? { ticket_price: String(ticket_price) } : {}),
        ...(register_link !== undefined ? { register_link: String(register_link) } : {}),
        ...(registration_end_at !== undefined ? { registration_end_at } : {}),
        ...(max_register_participants !== undefined
          ? { max_register_participants: parseOptionalNumber(max_register_participants, 'Max register participants') }
          : {}),
        ...(start_date !== undefined ? { start_date } : {}),
        ...(end_date !== undefined ? { end_date } : {}),
        ...(status !== undefined ? { status: String(status) } : {}),
        ...(article_ids !== undefined ? { article_ids: parseArticleIds(article_ids) } : {}),
      };

      const updated = await eventService.updateEvent(id, data);

      res.json({
        success: true,
        message: 'Event updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError('Invalid Event ID', 400);
      }

      await eventService.deleteEvent(id);
      res.json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getPublishedEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await eventService.getPublishedEvents(
        parseQueryParams(req.query, {
          page: 1,
          limit: 12,
          sortBy: 'start_date',
          sortOrder: 'asc',
        })
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPublishedEventBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      if (!slug) {
        throw new AppError('Slug is required', 400);
      }

      const data = await eventService.getEventBySlug(slug);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createEventRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      if (!slug) {
        throw new AppError('Slug is required', 400);
      }

      const {
        company_name,
        company_email,
        company_phone,
        company_address,
        pic_name,
        pic_email,
        pic_phone,
        notes,
        participants,
      } = req.body;

      if (!Array.isArray(participants)) {
        throw new AppError('Participants must be an array', 400);
      }

      const data: CreateEventRegistrationData = {
        company_name: String(company_name || ''),
        company_email: String(company_email || ''),
        ...(company_phone !== undefined ? { company_phone: String(company_phone) } : {}),
        ...(company_address !== undefined ? { company_address: String(company_address) } : {}),
        pic_name: String(pic_name || ''),
        pic_email: String(pic_email || ''),
        ...(pic_phone !== undefined ? { pic_phone: String(pic_phone) } : {}),
        ...(notes !== undefined ? { notes: String(notes) } : {}),
        participants: participants.map((participant) => ({
          name: String(participant?.name || ''),
          email: String(participant?.email || ''),
          ...(participant?.phone !== undefined ? { phone: String(participant.phone) } : {}),
          ...(participant?.job_title !== undefined ? { job_title: String(participant.job_title) } : {}),
        })),
      };

      const created = await eventRegistrationService.createPublicRegistration(slug, data);

      res.status(201).json({
        success: true,
        message: 'Event registration submitted successfully',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEventRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError('Invalid Event ID', 400);
      }

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      if (page < 1 || limit < 1) {
        throw new AppError('Invalid pagination parameters', 400);
      }

      const result = await eventRegistrationService.getRegistrationsByEventId(id, {
        page,
        limit,
        search: req.query.search as string | undefined,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEventRegistrationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, registrationId } = req.params;
      if (!id || !registrationId) {
        throw new AppError('Invalid event registration request', 400);
      }

      const data = await eventRegistrationService.getRegistrationById(id, registrationId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export default new EventController();