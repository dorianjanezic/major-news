import { NextResponse } from 'next/server';
import { testSupabaseConnection } from '@/utils/supabase';

export async function GET() {
  try {
    // Test database connection
    const dbHealthy = await testSupabaseConnection();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
