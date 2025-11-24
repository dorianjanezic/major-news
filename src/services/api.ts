import axios from 'axios';
import { MarketEvent, CreateMarketEvent, MarketEventsResponse, GenerateEventsResponse, ApiResponse } from '@/types/market-event';

class ApiService {
  private client = axios.create({
    baseURL: '/api',
    timeout: 30000, // Increased to 30 seconds for AI generation
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // GET /api/market-events - Get all market events with optional filtering
  async getEvents(options: {
    limit?: number;
    offset?: number;
    type?: string;
    significance?: string;
    date?: string;
  } = {}): Promise<MarketEventsResponse> {
    const params = new URLSearchParams();

    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.type) params.append('type', options.type);
    if (options.significance) params.append('significance', options.significance);
    if (options.date) params.append('date', options.date);

    const response = await this.client.get<ApiResponse<MarketEventsResponse>>(
      `/market-events?${params.toString()}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch market events');
    }

    return response.data.data!;
  }

  // GET /api/market-events/current-week - Get events for the current week
  async getCurrentWeekEvents(): Promise<MarketEvent[]> {
    const response = await this.client.get<ApiResponse<MarketEvent[]>>('/market-events/current-week');

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch current week events');
    }

    console.log('API Response:', response.data.data); // Debug log
    return response.data.data!;
  }

  // GET /api/market-events/:id - Get a single market event by ID
  async getEventById(id: string): Promise<MarketEvent> {
    const response = await this.client.get<ApiResponse<MarketEvent>>(`/market-events/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch market event');
    }

    return response.data.data!;
  }

  // POST /api/market-events - Create a new market event
  async createEvent(eventData: CreateMarketEvent): Promise<MarketEvent> {
    const response = await this.client.post<ApiResponse<MarketEvent>>('/market-events', eventData);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create market event');
    }

    return response.data.data!;
  }

  // POST /api/market-events/generate - Generate new events using AI
  async generateEvents(weekStart?: Date): Promise<GenerateEventsResponse> {
    const response = await this.client.post<ApiResponse<GenerateEventsResponse>>(
      '/market-events/generate',
      weekStart ? { weekStart: weekStart.toISOString() } : {}
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to generate market events');
    }

    return response.data.data!;
  }

  // PUT /api/market-events/:id - Update a market event
  async updateEvent(id: string, updates: Partial<CreateMarketEvent>): Promise<MarketEvent> {
    const response = await this.client.put<ApiResponse<MarketEvent>>(`/market-events/${id}`, updates);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update market event');
    }

    return response.data.data!;
  }

  // DELETE /api/market-events/:id - Delete a market event
  async deleteEvent(id: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<{ deleted: boolean }>>(`/market-events/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete market event');
    }
  }

  // DELETE /api/market-events/delete-all - Delete all market events
  async deleteAllEvents(): Promise<{ deleted: number }> {
    const response = await this.client.delete<ApiResponse<{ deleted: number }>>(`/market-events/delete-all`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete all market events');
    }

    return response.data.data!;
  }

  // DELETE /api/market-events/clear-regenerate - Clear all and regenerate
  async clearAndRegenerateEvents(): Promise<{
    deleted: number;
    generated: number;
    created: number;
    skipped: number;
    events: MarketEvent[];
  }> {
    const response = await this.client.delete<ApiResponse<{
      deleted: number;
      generated: number;
      created: number;
      skipped: number;
      events: MarketEvent[];
    }>>(`/market-events/clear-regenerate`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to clear and regenerate events');
    }

    return response.data.data!;
  }

  // DELETE /api/market-events/old/:days - Delete old events
  async deleteOldEvents(days: number): Promise<{ deleted: number }> {
    const response = await this.client.delete<ApiResponse<{ deleted: number }>>(`/market-events/old/${days}`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete old events');
    }

    return response.data.data!;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; services: Record<string, string> }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

// Export singleton instance
export const apiService = new ApiService();
