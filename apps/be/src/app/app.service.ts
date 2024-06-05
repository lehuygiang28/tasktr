import { Response } from 'express';

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getPing(res: Response) {
        res.header('Cache-Control', 'no-store, max-age=0, must-revalidate').send('pong');
        return;
    }
}
