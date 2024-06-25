import { Response } from 'express';
import { Injectable } from '@nestjs/common';
import { format } from 'date-fns/format';
import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class AppService {
    getPing(res: Response) {
        const zonedDate = toZonedTime(new Date(), process.env?.TZ || 'Asia/Ho_Chi_Minh');
        res.json({
            message: 'pong',
            time: format(zonedDate, 'HH:mm:ss:SSS dd/MM/yyyy'),
        });
        return;
    }
}
