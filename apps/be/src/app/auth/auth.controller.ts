import {
    Controller,
    Req,
    Res,
    Post,
    Get,
    Body,
    UseGuards,
    HttpStatus,
    HttpCode,
    SerializeOptions,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { PasswordlessStrategy } from './strategies';
import {
    AuthEmailLoginDto,
    AuthLoginPasswordlessDto,
    AuthLoginPasswordlessQueryDto,
    AuthSignupDto,
    LoginResponseDto,
    RefreshTokenDto,
} from './dtos';
import { AuthRegisterConfirmDto } from './dtos/auth-register-confirm.dto';
import { ApiOkResponse, ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtPayloadType } from './strategies/types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly pwdlessStrategy: PasswordlessStrategy,
    ) {}

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('register')
    async register(@Body() dto: AuthSignupDto) {
        return this.authService.register(dto);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('register/confirm')
    async registerConfirm(@Body() { hash }: AuthRegisterConfirmDto) {
        return this.authService.registerConfirm(hash);
    }

    @ApiOkResponse({ type: LoginResponseDto })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() { destination, password }: AuthEmailLoginDto): Promise<LoginResponseDto> {
        return this.authService.validatePassword({ destination, password });
    }

    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    @Post('login/pwdless')
    async loginPwdless(@Body() { destination }: AuthLoginPasswordlessDto, @Req() req, @Res() res) {
        await this.authService.validatePasswordless({ destination });
        return this.pwdlessStrategy.send(req, res);
    }

    @UseGuards(AuthGuard('pwdless'))
    @ApiQuery({ type: AuthLoginPasswordlessQueryDto })
    @ApiOkResponse({ type: LoginResponseDto })
    @Get('login/pwdless')
    callback(@Req() req) {
        return this.authService.generateTokens(req.user);
    }

    @ApiBody({
        type: RefreshTokenDto,
    })
    @UseGuards(AuthGuard('jwt-refresh'))
    @SerializeOptions({
        groups: ['me'],
    })
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: LoginResponseDto })
    public refresh(
        @Req() request: { user: JwtPayloadType },
    ): Promise<Omit<LoginResponseDto, 'user'>> {
        return this.authService.refreshToken(request.user);
    }
}
