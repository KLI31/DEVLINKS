import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class RegisterAuthDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'username solo puede contener letras, números, puntos, guiones y guiones bajos',
  })
  @IsNotEmpty({ message: 'username es requerido' })
  username: string;

  @IsEmail({}, { message: 'email inválido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'password debe tener mínimo 8 caracteres' })
  @Matches(/(?=.*[0-9])/, {
    message: 'password debe contener al menos un número',
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName: string;
}
