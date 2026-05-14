import {
  IsString,
  IsUrl,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateLinkDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'La URL no es válida' },
  )
  @MaxLength(2048)
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  previewImage?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
