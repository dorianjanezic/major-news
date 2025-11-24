import { NextRequest, NextResponse } from 'next/server';
import { MarketEventsService } from '@/services/market-events.service';

const marketEventsService = new MarketEventsService();

export async function GET(request: NextRequest) {
  try {
    const events = await marketEventsService.getCurrentWeekEvents();

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Error fetching current week events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch current week events' },
      { status: 500 }
    );
  }
}
