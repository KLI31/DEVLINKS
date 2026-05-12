import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  bio: string;

  @IsString()
  @MinLength(3, { message: 'username debe tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'username no puede tener más de 30 caracteres' })
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'username debe contener solo letras, números, puntos, guiones y guiones bajos',
  })
  @IsNotEmpty({ message: 'username es requerido' })
  username: string;

  @IsEmail({}, { message: 'email inválido' })
  @IsNotEmpty({ message: 'email es requerido' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MinLength(8, { message: 'password debe tener al menos 8 caracteres' })
  @Matches(/(?=.*[0-9])/, {
    message: 'password debe contener al menos un número',
  })
  @IsNotEmpty({ message: 'password es requerido' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsUrl()
  avatarUrl: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  theme: string;
}
