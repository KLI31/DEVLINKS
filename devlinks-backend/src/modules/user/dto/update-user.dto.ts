import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

const VALID_THEMES = ['dark', 'light', 'midnight', 'ocean', 'rose'] as const;
const VALID_BUTTON_STYLES = [
  'rounded-fill',
  'pill-fill',
  'sharp-fill',
  'rounded-outline',
  'pill-outline',
  'sharp-outline',
] as const;
const VALID_FONTS = [
  'inter',
  'poppins',
  'mono',
  'playfair',
  'jetbrains-mono',
  'fraunces',
  'space-grotesk',
  'fira-code',
  'outfit',
  'dm-sans',
] as const;
const VALID_BG_TYPES = ['flat', 'gradient'] as const;
const VALID_LAYOUTS = ['classic', 'cover'] as const;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export class UpdateUserDto extends PartialType(CreateUserDto) {
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
  @IsOptional()
  @IsIn(VALID_THEMES)
  theme: string;

  @IsString()
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

  // ── Appearance ─────────────────────────────────────────
  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: 'accentColor debe ser un color hex válido (#rrggbb)',
  })
  accentColor: string;

  @IsString()
  @IsOptional()
  @IsIn(VALID_BUTTON_STYLES)
  buttonStyle: string;

  @IsString()
  @IsOptional()
  @IsIn(VALID_FONTS)
  fontFamily: string;

  @IsString()
  @IsOptional()
  @IsIn(VALID_BG_TYPES)
  bgType: string;

  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: 'bgColor debe ser un color hex válido (#rrggbb)',
  })
  bgColor: string;

  @IsString()
  @IsOptional()
  @IsIn(VALID_LAYOUTS)
  profileLayout: string;

  @IsString()
  @IsOptional()
  coverImageUrl: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location: string;
}
