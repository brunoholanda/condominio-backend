import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

/** Links an existing account to a unit. The person must already have signed up. */
export class CreateResidentAccountDto {
  @ApiProperty({ example: 'morador@exemplo.com.br' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '101' })
  @IsString()
  @Length(1, 20)
  unitNumber: string;
}
