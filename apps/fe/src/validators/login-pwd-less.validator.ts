import { IsEmail, IsNotEmpty } from 'class-validator';
import { AuthLoginPasswordlessDto } from '~be/app/auth/dtos';

export class LoginPwdless implements AuthLoginPasswordlessDto {
    @IsEmail(undefined, { message: 'Email is invalid' })
    @IsNotEmpty({ message: 'Email is required' })
    destination: string;
}
