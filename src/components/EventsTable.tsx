'use client'

import React, { useState, useMemo } from 'react';
import { MarketEvent, SortDirection, SortField, TableColumn } from '@/types/market-event';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EventsTableProps {
  events: MarketEvent[];
  loading?: boolean;
  onEventUpdate?: (id: string, updates: Partial<MarketEvent>) => void;
  onEventDelete?: (id: string) => void;
}

const EventsTable: React.FC<EventsTableProps> = ({
  events,
  loading = false,
  onEventUpdate,
  onEventDelete
}) => {
  // Debug: Check if events have citations
  React.useEffect(() => {
    if (events.length > 0) {
      const eventWithCitations = events.find(e => e.citations && e.citations.length > 0);
      if (eventWithCitations) {
        console.log('Event with citations:', eventWithCitations.event, eventWithCitations.citations?.length);
      }
    }
  }, [events]);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Define table columns
  const columns: TableColumn<MarketEvent>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
    },
    {
      key: 'event',
      header: 'Event',
      sortable: true,
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (value: string) => <Badge variant="secondary">{value}</Badge>,
    },
    {
      key: 'description',
      header: 'Description & Impact',
      render: (value: string, event: MarketEvent) => (
        <div className="min-w-[350px] whitespace-pre-wrap leading-relaxed text-sm text-muted-foreground">
          {value}
          {event.citations && event.citations.length > 0 && (
            <div className="mt-3 pt-2 border-t border-border/50 space-y-2">
              <div className="text-xs text-muted-foreground font-medium">Sources:</div>
              <div className="flex flex-wrap gap-1">
                {event.citations.slice(0, 3).map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-colors"
                  >
                    {index + 1}
                  </a>
                ))}
                {event.citations.length > 3 && (
                  <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/30 rounded">
                    +{event.citations.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'significance',
      header: 'Significance',
      sortable: true,
      render: (value: string) => (
        <Badge variant={value.toLowerCase() as "high" | "medium" | "low"}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'market_sentiment',
      header: 'Market Sentiment',
      sortable: true,
      render: (value: string) => (
        <Badge variant={value.toLowerCase() as "bullish" | "bearish" | "neutral" | "mixed"}>
          {value}
        </Badge>
      ),
    },
  ];

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction or reset
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort events
  const sortedEvents = useMemo(() => {
    if (!sortField || !sortDirection) {
      return events;
    }

    return [...events].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [events, sortField, sortDirection]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card text-card-foreground overflow-hidden">

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50 border-border">
              {columns.map(column => (
                <TableHead
                  key={column.key as string}
                  className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:text-foreground' : ''
                    }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <div className="flex flex-col ml-1">
                        <span className={`text-[10px] leading-none ${sortField === column.key && sortDirection === 'asc'
                          ? 'text-primary'
                          : 'text-muted-foreground/30'
                          }`}>▲</span>
                        <span className={`text-[10px] leading-none ${sortField === column.key && sortDirection === 'desc'
                          ? 'text-primary'
                          : 'text-muted-foreground/30'
                          }`}>▼</span>
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No market events found.
                </TableCell>
              </TableRow>
            ) : (
              sortedEvents.map(event => (
                <TableRow key={event.id} className="hover:bg-muted/50 border-border">
                  {columns.map(column => (
                    <TableCell key={column.key as string} className="px-4 py-4 text-sm text-foreground align-top">
                      {column.render
                        ? column.render(event[column.key], event)
                        : String(event[column.key])
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border bg-muted/5 text-xs text-muted-foreground">
        {sortedEvents.length} events
      </div>
    </div>
  );
};

export default EventsTable;
