import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
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
const VALID_BUTTON_VARIANTS = ['solid', 'glass', 'outline'] as const;
const VALID_BUTTON_SHADOWS = ['none', 'soft', 'strong', 'hard'] as const;
const VALID_TITLE_STYLES = ['text', 'logo'] as const;
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
const VALID_BG_TYPES = ['flat', 'gradient', 'fill', 'blur', 'pattern', 'image', 'video'] as const;
const VALID_LAYOUTS = ['classic', 'cover'] as const;
const VALID_LAYOUTS_V2 = ['classic', 'hero'] as const;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export class UpdateUserDto extends PartialType(CreateUserDto) {
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

  // ── New customization fields ────────────────────────────
  @IsString()
  @IsOptional()
  @IsIn(VALID_LAYOUTS_V2)
  layout: string;

  @IsOptional()
  @ValidateIf((o) => o.title !== null)
  @IsString()
  @MaxLength(100)
  title: string | null;

  @IsString()
  @IsOptional()
  @IsIn(VALID_TITLE_STYLES)
  titleStyle: string;

  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: 'titleColor debe ser un color hex válido (#rrggbb)',
  })
  titleColor: string;

  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: 'pageTextColor debe ser un color hex válido (#rrggbb)',
  })
  pageTextColor: string;

  @IsString()
  @IsOptional()
  @IsIn(VALID_BUTTON_VARIANTS)
  buttonVariant: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(9999)
  buttonRadius: number;

  @IsString()
  @IsOptional()
  @IsIn(VALID_BUTTON_SHADOWS)
  buttonShadow: string;

  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: 'buttonColor debe ser un color hex válido (#rrggbb)',
  })
  buttonColor: string;

  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: 'buttonTextColor debe ser un color hex válido (#rrggbb)',
  })
  buttonTextColor: string;

  @IsBoolean()
  @IsOptional()
  altTitleFont: boolean;

  @IsString()
  @IsOptional()
  @IsIn(VALID_FONTS)
  titleFont: string;
}
