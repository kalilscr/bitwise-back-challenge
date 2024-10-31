import {
  IsAlpha,
  IsAlphanumeric,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from './users.enum';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateUserRequestDTO {
  @IsAlphanumeric()
  @MinLength(5)
  @MaxLength(30)
  @IsNotEmpty()
  userName: string;

  @IsAlpha()
  @MinLength(3)
  @MaxLength(30)
  @IsNotEmpty()
  name: string;

  @IsAlpha()
  @MinLength(3)
  @MaxLength(30)
  @IsOptional()
  lastName: string;

  @IsUrl()
  @IsOptional()
  profileImageUrl: string;

  @IsAlpha()
  @MinLength(3)
  @MaxLength(30)
  @IsOptional()
  bio: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform((value: TransformFnParams) => value.value.trim().toLowerCase())
  email: string;

  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;
}
