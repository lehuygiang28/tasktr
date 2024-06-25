import { Response } from 'express';
import { Controller, Get, Res } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('/ping')
    getPing(@Res() res: Response) {
        return this.appService.getPing(res);
    }
}
