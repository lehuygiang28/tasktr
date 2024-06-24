import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns/format';

export async function GET(request: NextRequest) {
    return new NextResponse(`pong ${format(new Date(), 'HH:mm:ss:SSS dd/MM/yyyy')}`, {
        headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
            'Content-Type': 'text/plain',
        },
    });
}
