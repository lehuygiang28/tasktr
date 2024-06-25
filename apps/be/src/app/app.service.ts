import { Request, Response } from 'express';
import { Injectable } from '@nestjs/common';
import { format } from 'date-fns/format';
import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class AppService {
    getPing(req: Request, res: Response) {
        const zonedDate = toZonedTime(
            new Date(),
            req.body['tz'] || process.env['TZ'] || 'Asia/Ho_Chi_Minh',
        );
        res.json({
            message: 'pong',
            time: format(zonedDate, 'HH:mm:ss:SSS dd/MM/yyyy'),
        });
        return;
    }
}
