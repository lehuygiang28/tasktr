import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginPasswordlessQueryDto {
    @ApiProperty({
        example: 'token_secret',
        required: true,
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    token: string;
}
