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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { PasswordlessStrategy } from './strategies';
import { AuthEmailLoginDto, AuthSignupDto } from './dtos';
import { AuthRegisterConfirmDto } from './dtos/auth-register-confirm.dto';
import { ApiTags } from '@nestjs/swagger';

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

    @Post('login')
    async login(@Req() req, @Res() res, @Body() { destination }: AuthEmailLoginDto) {
        await this.authService.validateLogin({ destination });
        return this.pwdlessStrategy.send(req, res);
    }

    @UseGuards(AuthGuard('pwdless'))
    @Get('login/callback')
    callback(@Req() req) {
        return this.authService.generateTokens(req.user);
    }
}
