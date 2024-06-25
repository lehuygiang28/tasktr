import { type NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns/format';
import { toZonedTime } from 'date-fns-tz';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const zonedDate = toZonedTime(
        new Date(),
        req.body['tz'] || process.env['TZ'] || 'Asia/Ho_Chi_Minh',
    );
    return NextResponse.json({
        message: 'pong',
        time: format(zonedDate, 'HH:mm:ss:SSS dd/MM/yyyy'),
    });
}
