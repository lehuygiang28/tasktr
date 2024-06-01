import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getData(): { message: string } {
        return { message: 'Hello API' };
    }

    getPing(): { message: string } {
        return { message: 'pong' };
    }
}
