import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '~be/common/utils/transformers';

export class AuthEmailLoginDto {
    @ApiProperty({
        example: 'test@techcell.cloud',
        description: 'User email',
        required: true,
        type: String,
    })
    @Transform(lowerCaseTransformer)
    @IsEmail()
    @IsNotEmpty()
    destination: string;
}
