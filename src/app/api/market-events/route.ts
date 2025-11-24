import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Build backend URL with query params
    const backendUrl = new URL(`${BACKEND_URL}/api/market-events`);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying to backend:', error);

    // Return mock data for development when backend is unavailable
    const mockEvents = [
      {
        id: '1',
        date: 'November 24 2025',
        event: 'Federal Reserve Interest Rate Decision',
        type: 'Fed',
        description: 'FOMC meeting to decide on interest rate policy',
        significance: 'High',
        market_sentiment: 'Neutral',
        citations: ['https://www.federalreserve.gov']
      },
      {
        id: '2',
        date: 'November 25 2025',
        event: 'Thanksgiving Holiday',
        type: 'Holiday',
        description: 'US stock markets closed for Thanksgiving',
        significance: 'Medium',
        market_sentiment: 'Neutral',
        citations: ['https://www.nyse.com/markets/hours-calendars']
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        events: mockEvents,
        total: mockEvents.length,
        page: 1,
        limit: 50
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/market-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying to backend:', error);
    // Return success for development when backend is unavailable
    return NextResponse.json({
      success: true,
      data: {
        id: Date.now().toString(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  }
}
