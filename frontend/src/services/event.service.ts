import { BaseCrudService, PaginatedResponse } from './baseCrud.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type EventStatus = 'DRAFT' | 'PUBLISHED';
export type EventPublicState = 'upcoming' | 'ongoing' | 'ended';

export interface RelatedNewsItem {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  news_date: string;
  news_thumbnail?: string | null;
  excerpt?: string | null;
  excerpt_en?: string | null;
  status?: string;
}

export interface EventOrganizer {
  label: string;
  name: string;
  logo: string;
}

export interface EventLocationSection {
  title: string;
  map_embed_url?: string | null;
  mapEmbedUrl?: string | null;
  name?: string | null;
  address?: string | null;
  directions_link?: string | null;
  directionsLink?: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  hero_title?: string | null;
  heroTitle?: string | null;
  slug: string;
  excerpt?: string | null;
  content: string;
  cover_image?: string | null;
  image?: string | null;
  location?: string | null;
  venue?: string | null;
  address?: string | null;
  map_embed_url?: string | null;
  organizer_label?: string | null;
  organizer_name?: string | null;
  organizer_logo?: string | null;
  organizer?: EventOrganizer;
  ticket_price?: string | null;
  ticketPrice?: string | null;
  register_link?: string | null;
  registerLink?: string | null;
  registration_end_at?: string | null;
  registrationEndedTime?: string | null;
  max_register_participants?: number;
  maxRegisterParticipants?: number;
  start_date: string;
  end_date?: string | null;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  timeStart?: string | null;
  timeEnd?: string | null;
  status: EventStatus;
  public_state?: EventPublicState;
  state?: EventPublicState;
  publish_status?: string;
  publishStatus?: string;
  badgeText?: string;
  heroLocation?: string;
  locationSection?: EventLocationSection | null;
  article_ids?: string[];
  articleIds?: string[];
  related_news?: RelatedNewsItem[];
  relatedNews?: RelatedNewsItem[];
  is_registration_open?: boolean;
  isRegistrationOpen?: boolean;
  registration_count?: number;
  registrationCount?: number;
  related_news_count?: number;
  relatedNewsCount?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  title: string;
  hero_title?: string;
  slug?: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  location?: string;
  venue?: string;
  address?: string;
  map_embed_url?: string;
  organizer_label?: string;
  organizer_name?: string;
  organizer_logo?: string;
  ticket_price?: string;
  register_link?: string;
  registration_end_at?: string | null;
  max_register_participants?: number;
  start_date: string;
  end_date?: string | null;
  status?: EventStatus;
  article_ids?: string[];
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export interface EventRegistrationParticipant {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  job_title?: string | null;
}

export interface EventRegistrationItem {
  id: string;
  event_id: string;
  company_name: string;
  company_email: string;
  company_phone?: string | null;
  company_address?: string | null;
  pic_name: string;
  pic_email: string;
  pic_phone?: string | null;
  notes?: string | null;
  participant_count: number;
  status: string;
  participants?: EventRegistrationParticipant[];
  event?: {
    id: string;
    title: string;
    slug: string;
    start_date: string;
    end_date?: string | null;
    status: string;
  };
  created_at: string;
  updated_at: string;
  submitted_at?: string;
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
  participants: EventRegistrationParticipant[];
}

class EventService extends BaseCrudService<EventItem> {
  constructor() {
    super('/cms/events');
  }

  async getPublicEvents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    state?: EventPublicState;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<EventItem>> {
    const query = this.buildQueryString(params || {});
    return this.fetchWithAuth(`${API_URL}/api/v1/events?${query}`);
  }

  async getBySlug(slug: string): Promise<{ data: EventItem }> {
    return this.fetchWithAuth(`${API_URL}/api/v1/events/${slug}`);
  }

  async createEvent(data: CreateEventData): Promise<{ data: EventItem; message: string }> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(id: string, data: UpdateEventData): Promise<{ data: EventItem; message: string }> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getEventRegistrations(
    eventId: string,
    params?: { page?: number; limit?: number; search?: string }
  ): Promise<PaginatedResponse<EventRegistrationItem>> {
    const query = this.buildQueryString(params || {});
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${eventId}/registrations?${query}`);
  }

  async getEventRegistration(eventId: string, registrationId: string): Promise<{ data: EventRegistrationItem }> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${eventId}/registrations/${registrationId}`);
  }

  async submitRegistration(
    slug: string,
    data: CreateEventRegistrationData
  ): Promise<{ data: EventRegistrationItem; message: string }> {
    return this.fetchWithAuth(`${API_URL}/api/v1/events/${slug}/registrations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const eventService = new EventService();