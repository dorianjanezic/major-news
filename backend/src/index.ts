import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { schedulerService } from './services/scheduler.service';
import debug from 'debug';

const log = debug('market-events:main');

const PORT = process.env.PORT || 3001;

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'AI_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file');
  process.exit(1);
}

// Start the server
const server = app.listen(PORT, async () => {
  log(`🚀 Server running on port ${PORT}`);
  log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'gemini'}`);
  log(`🗄️ Database: Supabase`);

  // Generate current week events on startup (if not already generated)
  try {
    await schedulerService.generateCurrentWeekEvents();
    log('✅ Current week events generated/verified');
  } catch (error) {
    log('❌ Error generating current week events:', error);
  }
});

// Start the weekly event generation scheduler
schedulerService.startWeeklyEventGeneration();
log('📅 Weekly upcoming event generation scheduler started');

// Graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('SIGINT received, shutting down gracefully');
  server.close(() => {
    log('Process terminated');
    process.exit(0);
  });
});

export default server;
