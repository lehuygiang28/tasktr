import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { AuthRoles, JwtPayloadType } from '../auth';
import { CurrentUser } from '~be/common/utils';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@AuthRoles()
@ApiTags('stats')
@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) {}

    @ApiOkResponse()
    @Get('/')
    getStats(@CurrentUser() user: JwtPayloadType) {
        return this.statsService.getStatsUserDashboard({ user });
    }
}
