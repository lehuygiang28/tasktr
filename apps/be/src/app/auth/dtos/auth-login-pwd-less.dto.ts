import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '~be/common/utils/transformers';

export class AuthLoginPasswordlessDto {
    @ApiProperty({
        example: 'test@gmail.com',
        description: 'User email',
        required: true,
        type: String,
    })
    @Transform(lowerCaseTransformer)
    @IsEmail()
    @IsNotEmpty()
    destination: string;
}
