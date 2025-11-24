import { NextRequest, NextResponse } from 'next/server';
import { MarketEventsService } from '@/services/market-events.service';

const marketEventsService = new MarketEventsService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const event = await marketEventsService.getEventById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Market event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error fetching market event by ID:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market event' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates = body;

    const updatedEvent = await marketEventsService.updateEvent(id, updates);

    if (!updatedEvent) {
      return NextResponse.json(
        { success: false, error: 'Market event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    console.error('Error updating market event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update market event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const deleted = await marketEventsService.deleteEvent(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Market event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Error deleting market event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete market event' },
      { status: 500 }
    );
  }
}
