import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { days: string } }
) {
    try {
        const days = parseInt(params.days);

        if (isNaN(days) || days < 1) {
            return NextResponse.json(
                { success: false, error: 'Invalid days parameter. Must be a positive number.' },
                { status: 400 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/api/market-events/old/${days}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying to backend:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete old market events' },
            { status: 500 }
        );
    }
}
