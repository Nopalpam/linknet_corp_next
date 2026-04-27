import { PrismaClient, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../types/error.types';

const prisma = new PrismaClient();

export interface EventRegistrationParticipantInput {
  name: string;
  email: string;
  phone?: string;
  job_title?: string;
}

export interface CreateEventRegistrationData {
  company_name: string;
  company_email: string;
  company_phone?: string;
  company_address?: string;
  pic_name: string;
  pic_email: string;
  pic_phone?: string;
  notes?: string;
  participants: EventRegistrationParticipantInput[];
}

export interface EventRegistrationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

function sanitizeOptionalText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function serializeRegistration(item: any) {
  if (!item) {
    return item;
  }

  return {
    ...item,
    participants: item.event_registration_participants || [],
    event_registration_participants: undefined,
    event: item.events
      ? {
          id: item.events.id,
          title: item.events.title,
          slug: item.events.slug,
          start_date: item.events.start_date,
          end_date: item.events.end_date,
          status: item.events.status,
        }
      : undefined,
    events: undefined,
    submitted_at: item.created_at,
  };
}

function serializeRegistrationList(items: any[]) {
  return items.map(serializeRegistration);
}

function normalizeParticipants(participants: EventRegistrationParticipantInput[]) {
  return participants.map((participant) => ({
    name: participant.name.trim(),
    email: normalizeEmail(participant.email),
    phone: sanitizeOptionalText(participant.phone),
    job_title: sanitizeOptionalText(participant.job_title),
  }));
}

function validateParticipants(participants: EventRegistrationParticipantInput[]) {
  if (!Array.isArray(participants) || participants.length === 0) {
    throw new AppError('At least one participant is required', 400);
  }

  const normalized = normalizeParticipants(participants);
  const emailSet = new Set<string>();

  normalized.forEach((participant, index) => {
    if (!participant.name) {
      throw new AppError(`Participant ${index + 1} name is required`, 400);
    }

    if (!participant.email) {
      throw new AppError(`Participant ${index + 1} email is required`, 400);
    }

    if (!isValidEmail(participant.email)) {
      throw new AppError(`Participant ${index + 1} email is invalid`, 400);
    }

    if (emailSet.has(participant.email)) {
      throw new AppError('Participant emails must be unique in a registration', 400);
    }

    emailSet.add(participant.email);
  });

  return normalized;
}

function canRegisterForEvent(eventItem: any, now = new Date()) {
  if (!eventItem || eventItem.status !== 'PUBLISHED') {
    return false;
  }

  if (!eventItem.registration_end_at) {
    return false;
  }

  if ((eventItem.max_register_participants || 0) < 1) {
    return false;
  }

  const effectiveEndDate = eventItem.end_date || eventItem.start_date;

  return now <= eventItem.registration_end_at && now <= effectiveEndDate;
}

export class EventRegistrationService {
  async createPublicRegistration(eventSlug: string, data: CreateEventRegistrationData) {
    const eventItem = await prisma.events.findUnique({
      where: { slug: eventSlug },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        start_date: true,
        end_date: true,
        registration_end_at: true,
        max_register_participants: true,
      },
    });

    if (!eventItem || eventItem.status !== 'PUBLISHED') {
      throw new AppError('Event not found', 404);
    }

    if (!canRegisterForEvent(eventItem)) {
      throw new AppError('Registration for this event is closed', 400);
    }

    if (!data.company_name?.trim()) {
      throw new AppError('Company name is required', 400);
    }

    if (!data.company_email?.trim()) {
      throw new AppError('Company email is required', 400);
    }

    if (!isValidEmail(data.company_email)) {
      throw new AppError('Company email is invalid', 400);
    }

    if (!data.pic_name?.trim()) {
      throw new AppError('PIC name is required', 400);
    }

    if (!data.pic_email?.trim()) {
      throw new AppError('PIC email is required', 400);
    }

    if (!isValidEmail(data.pic_email)) {
      throw new AppError('PIC email is invalid', 400);
    }

    const participants = validateParticipants(data.participants);

    if (participants.length > eventItem.max_register_participants) {
      throw new AppError(
        `Maximum ${eventItem.max_register_participants} participants are allowed for one registration`,
        400
      );
    }

    const now = new Date();
    const registration = await prisma.event_registrations.create({
      data: {
        id: uuidv4(),
        event_id: eventItem.id,
        company_name: data.company_name.trim(),
        company_email: normalizeEmail(data.company_email),
        company_phone: sanitizeOptionalText(data.company_phone),
        company_address: sanitizeOptionalText(data.company_address),
        pic_name: data.pic_name.trim(),
        pic_email: normalizeEmail(data.pic_email),
        pic_phone: sanitizeOptionalText(data.pic_phone),
        notes: sanitizeOptionalText(data.notes),
        participant_count: participants.length,
        status: 'NEW',
        created_at: now,
        updated_at: now,
        event_registration_participants: {
          create: participants.map((participant) => ({
            id: uuidv4(),
            name: participant.name,
            email: participant.email,
            phone: participant.phone,
            job_title: participant.job_title,
            created_at: now,
            updated_at: now,
          })),
        },
      },
      include: {
        event_registration_participants: true,
        events: {
          select: {
            id: true,
            title: true,
            slug: true,
            start_date: true,
            end_date: true,
            status: true,
          },
        },
      },
    });

    return serializeRegistration(registration);
  }

  async getRegistrationsByEventId(eventId: string, params: EventRegistrationQueryParams = {}) {
    const eventItem = await prisma.events.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!eventItem) {
      throw new AppError('Event not found', 404);
    }

    const {
      page = 1,
      limit = 20,
      search,
    } = params;

    const skip = (page - 1) * limit;
    const where: Prisma.event_registrationsWhereInput = {
      event_id: eventId,
    };

    if (search) {
      where.OR = [
        { company_name: { contains: search, mode: 'insensitive' } },
        { company_email: { contains: search, mode: 'insensitive' } },
        { pic_name: { contains: search, mode: 'insensitive' } },
        { pic_email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.event_registrations.findMany({
        where,
        include: {
          event_registration_participants: true,
          events: {
            select: {
              id: true,
              title: true,
              slug: true,
              start_date: true,
              end_date: true,
              status: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.event_registrations.count({ where }),
    ]);

    return {
      data: serializeRegistrationList(items),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getRegistrationById(eventId: string, registrationId: string) {
    const item = await prisma.event_registrations.findFirst({
      where: {
        id: registrationId,
        event_id: eventId,
      },
      include: {
        event_registration_participants: true,
        events: {
          select: {
            id: true,
            title: true,
            slug: true,
            start_date: true,
            end_date: true,
            status: true,
          },
        },
      },
    });

    if (!item) {
      throw new AppError('Event registration not found', 404);
    }

    return serializeRegistration(item);
  }
}

export default new EventRegistrationService();