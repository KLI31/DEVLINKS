import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';

export class PinnedRepoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string | null;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url: string;

  @IsString()
  @IsNotEmpty()
  githubRepo: string;

  @IsInt()
  @Min(0)
  stars: number;

  @IsString()
  @IsOptional()
  language: string | null;
}

export class SetPinnedReposDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PinnedRepoDto)
  repos: PinnedRepoDto[];
}
