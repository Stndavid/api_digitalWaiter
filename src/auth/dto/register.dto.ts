import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt, Matches } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @MinLength(6)
  confirmPassword: string;

  @IsNotEmpty()
  @IsString()
  cedula: string;

  @IsString()
  telefono: string;

  @IsInt()
  roleId: number;
}
