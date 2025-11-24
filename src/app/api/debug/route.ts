import { NextResponse } from 'next/server';

export async function GET() {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

  try {
    // Test backend health endpoint
    const healthResponse = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const healthData = await healthResponse.json();

    // Test market events endpoint
    const eventsResponse = await fetch(`${BACKEND_URL}/api/market-events?limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const eventsData = await eventsResponse.json();

    return NextResponse.json({
      backend_url: BACKEND_URL,
      health_check: {
        status: healthResponse.status,
        data: healthData
      },
      events_check: {
        status: eventsResponse.status,
        data: eventsData
      }
    });
  } catch (error) {
    return NextResponse.json({
      backend_url: BACKEND_URL,
      error: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: [
        '1. Check if BACKEND_URL is set correctly in Vercel',
        '2. Verify Railway backend is deployed and running',
        '3. Ensure Railway backend has /health and /api/market-events endpoints',
        '4. Check Railway backend logs for errors'
      ]
    }, { status: 500 });
  }
}
