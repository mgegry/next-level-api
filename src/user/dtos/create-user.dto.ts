import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../role.enum';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  refreshTokenHash?: string | null;

  @IsString()
  @MinLength(6)
  password: string; // Plain text password from client

  @IsEnum(Role)
  role: Role;

  @IsNumber()
  tenantId: number;
}
