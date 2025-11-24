import { z } from 'zod';

// Zod schemas for runtime validation
export const MarketEventSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.string(), // Date in format like "November 24 2025" or "November 24-29 2025"
  event: z.string(),
  type: z.enum(['Economic', 'Fed', 'Crypto', 'Retail/Geopolitical', 'Holiday', 'Geopolitical', 'Corporate']), // Specific event types supported by database
  description: z.string(),
  significance: z.enum(['High', 'Medium', 'Low']),
  market_sentiment: z.enum(['Bullish', 'Bearish', 'Neutral', 'Mixed']),
  citations: z.array(z.string().url()).optional(), // Array of citation URLs
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// TypeScript types inferred from schemas
export type MarketEvent = z.infer<typeof MarketEventSchema>;
export type CreateMarketEvent = Omit<MarketEvent, 'id' | 'created_at' | 'updated_at'>;
export type UpdateMarketEvent = Partial<CreateMarketEvent>;

// API response types
export interface MarketEventsResponse {
  events: MarketEvent[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
