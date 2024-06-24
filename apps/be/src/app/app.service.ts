import { Response } from 'express';
import { Injectable } from '@nestjs/common';
import { format } from 'date-fns/format';

@Injectable()
export class AppService {
    getPing(res: Response) {
        res.header('Cache-Control', 'no-store, max-age=0, must-revalidate')
            .header('Content-Type', 'text/plain')
            .send(`pong ${format(new Date(), 'HH:mm:ss:SSS dd/MM/yyyy')}`);
        return;
    }
}
