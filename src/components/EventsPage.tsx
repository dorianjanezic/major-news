'use client'

import { useState, useEffect } from 'react';
import EventsTable from './EventsTable';
import { MarketEvent } from '@/types/market-event';
import { apiService } from '@/services/api';

export default function EventsPage() {
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const { events: eventsData } = await apiService.getEvents({ limit: 50 }); // Get recent events instead of just current week
      setEvents(eventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleEventUpdate = async (id: string, updates: Partial<MarketEvent>) => {
    try {
      const updatedEvent = await apiService.updateEvent(id, updates);
      setEvents(prevEvents =>
        prevEvents.map(event => event.id === id ? updatedEvent : event)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      console.error('Error updating event:', err);
    }
  };

  const handleEventDelete = async (id: string) => {
    try {
      await apiService.deleteEvent(id);
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      console.error('Error deleting event:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Market Events</h1>
          <p className="text-muted-foreground text-sm mt-1">AI-powered weekly market event tracker</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-xs text-destructive font-medium">{error}</p>
          </div>
        )}

        {/* Events Table */}
        <EventsTable
          events={events}
          loading={loading}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
      </div>
    </div>
  );
}
