import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
  @IsEmail({}, { message: 'email inválido' })
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
