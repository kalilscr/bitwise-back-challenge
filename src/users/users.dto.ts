import { PickType } from '@nestjs/mapped-types';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsAlpha,
  IsAlphanumeric,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from './users.enum';
import { IUpdateUser, IUser } from './users.interface';

export class CreateUserRequestDTO implements IUser {
  @IsAlphanumeric()
  @MinLength(5)
  @MaxLength(30)
  @IsNotEmpty()
  username: string;

  @IsAlpha()
  @MinLength(3)
  @MaxLength(30)
  @IsNotEmpty()
  name: string;

  @IsAlpha()
  @MinLength(3)
  @MaxLength(30)
  @IsOptional()
  lastName?: string;

  @IsUrl()
  @IsOptional()
  profileImageUrl?: string;

  @IsAlpha('pt-BR')
  @MinLength(3)
  @MaxLength(30)
  @IsOptional()
  bio?: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform((value: TransformFnParams) => value.value.trim().toLowerCase())
  email: string;

  @IsString()
  @IsAlpha()
  @IsOptional()
  //@Transform((value: TransformFnParams) => value.value.trim().toUpperCase())
  @IsIn(['Male', 'Female'])
  gender?: Gender;
}

export class CreateUserFromGithubRequestDTO extends PickType(
  CreateUserRequestDTO,
  ['username' as const],
) {}

export class UpdateUserRequestDTO implements IUpdateUser {
  @IsAlphanumeric()
  @MinLength(5)
  @MaxLength(30)
  @IsOptional()
  username: string;

  @IsAlpha()
  @MinLength(3)
  @MaxLength(30)
  @IsOptional()
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
  @IsOptional()
  @Transform((value: TransformFnParams) => value.value.trim().toLowerCase())
  email: string;

  @IsString()
  @IsAlpha()
  @IsOptional()
  @IsIn(['Male', 'Female'])
  gender: Gender;
}

// export class GetUserRequestDTO {
//   @IsAlphanumeric()
//   @MinLength(5)
//   @MaxLength(30)
//   @IsNotEmpty()
//   username: string;
// }
