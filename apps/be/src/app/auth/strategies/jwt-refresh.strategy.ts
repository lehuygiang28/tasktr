import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { OrNeverType } from '~be/common/utils/types';
import { JwtPayloadType } from './types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            secretOrKey: configService.getOrThrow<string>('AUTH_REFRESH_SECRET'),
        });
    }

    public async validate(payload: JwtPayloadType): Promise<OrNeverType<JwtPayloadType>> {
        if (!payload.userId) {
            throw new UnauthorizedException({
                errors: {
                    token: 'invalidRefreshToken',
                },
                message: 'Your token is invalid',
            });
        }

        return payload;
    }
}
