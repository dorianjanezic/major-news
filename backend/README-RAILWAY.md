# Railway Deployment Guide

## 🚀 Deploy Backend to Railway

### 1. Connect to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

### 2. Create Railway Project
```bash
# Go to backend directory
cd backend

# Initialize Railway project
railway init

# Link to existing project or create new one
railway link
```

### 3. Set Environment Variables
```bash
# Set required environment variables
railway variables set SUPABASE_URL=your_supabase_url
railway variables set SUPABASE_ANON_KEY=your_supabase_anon_key
railway variables set AI_PROVIDER=xai
railway variables set AI_API_KEY=your_xai_api_key
railway variables set NODE_ENV=production
railway variables set EVENT_GENERATION_CRON="0 9 * * 0"  # Every Sunday at 9 AM UTC
```

### 4. Deploy
```bash
# Deploy to Railway
railway deploy

# Check deployment status
railway status

# View logs
railway logs
```

### 5. Verify Deployment
- **On Startup**: Backend will generate current week events automatically
- **Every Sunday at 9 AM UTC**: Backend will generate upcoming week events
- **Frontend**: Will display all events (current + upcoming weeks)

## 🔧 Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGciOiJIUzI1NiIs...` |
| `AI_PROVIDER` | AI provider (`xai`, `gemini`) | `xai` |
| `AI_API_KEY` | XAI API key | `xai-...` |
| `NODE_ENV` | Environment | `production` |
| `EVENT_GENERATION_CRON` | Cron schedule for weekly generation | `0 9 * * 0` |

## 📅 Automated Schedule

- **Startup**: Generate current week events (if none exist)
- **Every Sunday 9 AM UTC**: Generate upcoming week events
- **Frontend**: Shows all events automatically

## 🐛 Troubleshooting

```bash
# Check logs
railway logs

# Restart deployment
railway restart

# Check environment variables
railway variables
```
