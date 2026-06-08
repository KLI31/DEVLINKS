import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class StickerDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  rotation: number;

  @IsNumber()
  @IsOptional()
  scale?: number;

  @IsBoolean()
  @IsOptional()
  animated?: boolean;
}

export class UpdateStickersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StickerDto)
  stickers: StickerDto[];
}
