import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateAuthDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
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

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  bio: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username: string;
}
