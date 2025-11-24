import { supabase } from '@/utils/supabase';
import { MarketEvent, CreateMarketEvent, UpdateMarketEvent } from '@/types/market-event';

export class MarketEventsService {
  /**
   * Get all market events with optional filtering and pagination
   */
  async getEvents(options: {
    limit?: number;
    offset?: number;
    type?: string;
    significance?: string;
    date?: string;
  } = {}): Promise<{ events: MarketEvent[]; total: number }> {
    try {
      let query = supabase
        .from('market_events')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.type && options.type !== 'All') {
        query = query.eq('type', options.type as any);
      }
      if (options.significance && options.significance !== 'All') {
        query = query.eq('significance', options.significance as any);
      }
      if (options.date) {
        query = query.ilike('date', `%${options.date}%`);
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching market events:', error);
        throw new Error(`Failed to fetch market events: ${error.message}`);
      }

      return {
        events: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error in getEvents:', error);
      throw error;
    }
  }

  /**
   * Get a single market event by ID
   */
  async getEventById(id: string): Promise<MarketEvent | null> {
    try {
      const { data, error } = await supabase
        .from('market_events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching market event by ID:', error);
        throw new Error(`Failed to fetch market event: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getEventById:', error);
      throw error;
    }
  }

  /**
   * Create a new market event
   */
  async createEvent(eventData: CreateMarketEvent): Promise<MarketEvent> {
    try {
      const { data, error } = await supabase
        .from('market_events')
        .insert([eventData])
        .select()
        .single();

      if (error) {
        console.error('Error creating market event:', error);
        throw new Error(`Failed to create market event: ${error.message}`);
      }

      console.log(`Created market event: ${data.event}`);
      return data;
    } catch (error) {
      console.error('Error in createEvent:', error);
      throw error;
    }
  }

  /**
   * Create multiple market events (batch insert) - skips duplicates
   */
  async createEvents(eventsData: CreateMarketEvent[]): Promise<{ created: MarketEvent[], skipped: number }> {
    try {
      const uniqueEvents: CreateMarketEvent[] = [];
      let skippedCount = 0;

      // Check each event for duplicates
      for (const eventData of eventsData) {
        const existingEvent = await this.findExistingEvent(eventData);
        if (existingEvent) {
          console.log(`Skipping duplicate event: ${eventData.event} (${eventData.date})`);
          skippedCount++;
          continue;
        }
        uniqueEvents.push(eventData);
      }

      if (uniqueEvents.length === 0) {
        return { created: [], skipped: skippedCount };
      }

      const { data, error } = await supabase
        .from('market_events')
        .insert(uniqueEvents)
        .select();

      if (error) {
        console.error('Error creating market events:', error);
        throw new Error(`Failed to create market events: ${error.message}`);
      }

      console.log(`Created ${data.length} new market events, skipped ${skippedCount} duplicates`);
      return { created: data, skipped: skippedCount };
    } catch (error) {
      console.error('Error in createEvents:', error);
      throw error;
    }
  }

  /**
   * Check if an event already exists (by event name and date)
   */
  private async findExistingEvent(eventData: CreateMarketEvent): Promise<MarketEvent | null> {
    try {
      const { data, error } = await supabase
        .from('market_events')
        .select('*')
        .eq('event', eventData.event)
        .eq('date', eventData.date)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error checking for existing event:', error);
        return null; // Assume not found on error
      }

      return data;
    } catch (error) {
      console.error('Error in findExistingEvent:', error);
      return null;
    }
  }

  /**
   * Update an existing market event
   */
  async updateEvent(id: string, updates: UpdateMarketEvent): Promise<MarketEvent | null> {
    try {
      const { data, error } = await supabase
        .from('market_events')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error updating market event:', error);
        throw new Error(`Failed to update market event: ${error.message}`);
      }

      console.log(`Updated market event: ${data.event}`);
      return data;
    } catch (error) {
      console.error('Error in updateEvent:', error);
      throw error;
    }
  }

  /**
   * Delete a market event
   */
  async deleteEvent(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('market_events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting market event:', error);
        throw new Error(`Failed to delete market event: ${error.message}`);
      }

      console.log(`Deleted market event with ID: ${id}`);
      return true;
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      throw error;
    }
  }

  /**
   * Delete all market events
   */
  async deleteAllEvents(): Promise<number> {
    try {
      // Get count before deletion
      const { count, error: countError } = await supabase
        .from('market_events')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error counting market events:', countError);
      }

      // Delete all events - use a broad condition that matches everything
      const { error } = await supabase
        .from('market_events')
        .delete()
        .lte('created_at', new Date().toISOString()); // This matches all records created before now (all records)

      if (error) {
        console.error('Error deleting all market events:', error);
        throw new Error(`Failed to delete market events: ${error.message}`);
      }

      const deletedCount = count || 0;
      console.log(`Deleted ${deletedCount} market events`);
      return deletedCount;
    } catch (error) {
      console.error('Error in deleteAllEvents:', error);
      throw error;
    }
  }

  /**
   * Delete events older than specified days
   */
  async deleteOldEvents(daysOld: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await supabase
        .from('market_events')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        console.error('Error deleting old market events:', error);
        throw new Error(`Failed to delete old market events: ${error.message}`);
      }

      const deletedCount = data?.length || 0;
      console.log(`Deleted ${deletedCount} market events older than ${daysOld} days`);
      return deletedCount;
    } catch (error) {
      console.error('Error in deleteOldEvents:', error);
      throw error;
    }
  }

  /**
   * Get events for the current week (based on today's date)
   */
  async getCurrentWeekEvents(): Promise<MarketEvent[]> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)

      const startMonth = startOfWeek.toLocaleString('default', { month: 'long' });
      const endMonth = endOfWeek.toLocaleString('default', { month: 'long' });
      const year = startOfWeek.getFullYear();

      let dateFilter: string;
      if (startMonth === endMonth) {
        dateFilter = `${startMonth} ${year}`;
      } else {
        dateFilter = `${startMonth}-${endMonth} ${year}`;
      }

      const { events } = await this.getEvents({ date: dateFilter });
      return events;
    } catch (error) {
      console.error('Error in getCurrentWeekEvents:', error);
      throw error;
    }
  }
}
