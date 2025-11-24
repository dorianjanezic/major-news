import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function DELETE(request: NextRequest) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/market-events/delete-all`, {
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
            { success: false, error: 'Failed to delete market events' },
            { status: 500 }
        );
    }
}
