# Major Market Events Tracker

A Next.js application that automatically generates and displays weekly major market events using AI.

## 🚀 Features

- **AI-Powered Event Generation**: Uses Gemini/Grok AI to generate market events
- **Next.js API Routes**: Built-in API endpoints with serverless functions
- **Vercel Deployment**: Optimized for Vercel platform
- **Real-time Data**: Supabase-powered PostgreSQL database
- **Interactive UI**: Sortable and filterable event table
- **TypeScript**: Full type safety throughout

## 🏗️ Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS
- **State**: React hooks
- **API**: Next.js API Routes

### Backend (Next.js API Routes)
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Gemini / xAI Grok
- **Deployment**: Vercel serverless functions
- **Caching**: Built-in ISR support

### Database (Supabase)
- **Events Table**: Market event storage with RLS
- **Real-time**: Live updates support
- **Edge Network**: Global CDN

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Setup
Create `.env.local`:
```bash
# Database Configuration (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Configuration
AI_API_KEY=your_gemini_api_key
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-pro-latest
```

### 3. Database Setup
Run this SQL in your Supabase SQL editor:
```sql
-- Create market_events table
CREATE TABLE IF NOT EXISTS market_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  event TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Economic', 'Fed', 'Crypto', 'Retail/Geopolitical', 'Holiday', 'Geopolitical', 'Corporate')),
  description TEXT NOT NULL,
  significance TEXT NOT NULL CHECK (significance IN ('High', 'Medium', 'Low')),
  market_sentiment TEXT NOT NULL CHECK (market_sentiment IN ('Bullish', 'Bearish', 'Neutral', 'Mixed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_market_events_date ON market_events(date);
CREATE INDEX IF NOT EXISTS idx_market_events_type ON market_events(type);
CREATE INDEX IF NOT EXISTS idx_market_events_significance ON market_events(significance);
CREATE INDEX IF NOT EXISTS idx_market_events_created_at ON market_events(created_at DESC);

-- Enable RLS
ALTER TABLE market_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on market_events" ON market_events FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on market_events" ON market_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update on market_events" ON market_events FOR UPDATE USING (true);
```

### 4. Development
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit `http://localhost:3000`

## 🎯 API Endpoints

### Market Events
- `GET /api/market-events` - Get all events (with filtering/pagination)
- `GET /api/market-events/current-week` - Get current week events
- `GET /api/market-events/[id]` - Get specific event
- `POST /api/market-events` - Create new event
- `POST /api/market-events/generate` - Generate AI events
- `PUT /api/market-events/[id]` - Update event
- `DELETE /api/market-events/[id]` - Delete event

### Health Check
- `GET /api/health` - Service health status

## 🚀 Vercel Deployment

### 1. Connect Repository
1. Push code to GitHub/GitLab
2. Connect repository to Vercel
3. Vercel will auto-detect Next.js

### 2. Environment Variables
Set these in Vercel dashboard:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
AI_API_KEY=your_gemini_api_key
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-pro-latest
```

### 3. Deploy
```bash
# Vercel CLI
npm i -g vercel
vercel --prod
```

## 🔧 Configuration

### Vercel Config (optional)
Create `vercel.json`:
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"]
}
```

### Next.js Config
Already optimized for Vercel with:
- API route timeouts
- Environment variable handling
- Static optimization

## 🧪 Testing

```bash
npm run test
npm run test:e2e  # If you add Playwright
```

## 📊 Performance

### Vercel Optimizations
- **Edge Network**: Global CDN
- **ISR**: Incremental Static Regeneration
- **Image Optimization**: Automatic optimization
- **API Caching**: Built-in response caching

### Database Optimizations
- **Indexes**: Optimized queries
- **RLS**: Row Level Security
- **Connection Pooling**: Supabase handles this

## 🔍 Monitoring

### Vercel Analytics
- Real-time performance metrics
- Error tracking
- Function execution times

### Supabase Dashboard
- Query performance
- Database health
- Real-time metrics

## 🚨 Troubleshooting

### Common Issues

1. **API Timeout**
   - AI generation takes ~15-20 seconds
   - Vercel function timeout may need adjustment

2. **Environment Variables**
   - Ensure all env vars are set in Vercel
   - `.env.local` for local, Vercel dashboard for production

3. **Database Connection**
   - Check Supabase URL and keys
   - Verify RLS policies are correct

4. **Cold Starts**
   - Vercel serverless functions may have cold starts
   - Consider keeping functions warm

## 📝 Development Notes

### Migration from Vite
- Moved from client-side routing to Next.js App Router
- API calls now use `/api/*` routes instead of proxy
- Environment variables handled by Next.js
- Components converted to client components with `'use client'`

### AI Integration
- Supports Gemini (Google) and Grok (xAI)
- Configurable via environment variables
- Error handling for API failures
- Response validation and sanitization

### Database
- Supabase client configured for serverless
- Row Level Security enabled
- Optimized queries with proper indexing

## 🎉 Benefits of Next.js + Vercel

- **Zero Config Deployment**: Just push to git
- **Global CDN**: Instant worldwide performance
- **Auto Scaling**: Handles traffic spikes
- **Preview Deployments**: Test changes before production
- **Analytics**: Built-in performance monitoring
- **Edge Functions**: Run code closest to users

## 📞 Support

For issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test Supabase connection
4. Check AI API key validity

---

**Happy deploying! 🎉**