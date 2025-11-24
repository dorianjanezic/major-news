export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      market_events: {
        Row: {
          id: string
          date: string
          event: string
          type: 'Economic' | 'Fed' | 'Crypto' | 'Retail/Geopolitical' | 'Holiday' | 'Geopolitical' | 'Corporate' | 'Corporate'
          description: string
          significance: 'High' | 'Medium' | 'Low'
          market_sentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'Mixed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          event: string
          type: 'Economic' | 'Fed' | 'Crypto' | 'Retail/Geopolitical' | 'Holiday' | 'Geopolitical' | 'Corporate' | 'Corporate'
          description: string
          significance: 'High' | 'Medium' | 'Low'
          market_sentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'Mixed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          event?: string
          type?: 'Economic' | 'Fed' | 'Crypto' | 'Retail/Geopolitical' | 'Holiday' | 'Geopolitical'
          description?: string
          significance?: 'High' | 'Medium' | 'Low'
          market_sentiment?: 'Bullish' | 'Bearish' | 'Neutral' | 'Mixed'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
