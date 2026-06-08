import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  MinLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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
const VALID_BG_TYPES = ['flat', 'gradient', 'fill', 'blur', 'pattern', 'image', 'video'] as const;
const VALID_LAYOUTS = ['classic', 'cover'] as const;
const VALID_LAYOUTS_V2 = ['classic', 'hero'] as const;
const VALID_BUTTON_VARIANTS = ['solid', 'glass', 'outline'] as const;
const VALID_BUTTON_SHADOWS = ['none', 'soft', 'strong', 'hard'] as const;
const VALID_TITLE_STYLES = ['text', 'logo'] as const;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

class ImportProfileSectionDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  displayName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  githubUsername?: string;

  @IsString()
  @IsOptional()
  @IsIn(VALID_THEMES)
  theme?: string;

  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: 'accentColor debe ser un color hex válido (#rrggbb)',
  })
  accentColor?: string;

  @IsString()
  @IsOptional()
  @IsIn(VALID_BUTTON_STYLES)
  buttonStyle?: string;

  @IsString()
  @IsOptional()
  @IsIn(VALID_FONTS)
  fontFamily?: string;

  @IsString()
  @IsOptional()
  @IsIn(VALID_BG_TYPES)
  bgType?: string;

  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: 'bgColor debe ser un color hex válido (#rrggbb)',
  })
  bgColor?: string;

  @IsString()
  @IsOptional()
  @IsIn(VALID_LAYOUTS)
  profileLayout?: string;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsString()
  @IsOptional()
  @IsIn(VALID_LAYOUTS_V2)
  layout?: string;

  @IsOptional()
  @ValidateIf((o) => o.title !== null)
  @IsString()
  @MaxLength(100)
  title?: string | null;

  @IsString()
  @IsOptional()
  @IsIn(VALID_TITLE_STYLES)
  titleStyle?: string;

  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: 'titleColor debe ser un color hex válido (#rrggbb)',
  })
  titleColor?: string;

  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: 'pageTextColor debe ser un color hex válido (#rrggbb)',
  })
  pageTextColor?: string;

  @IsString()
  @IsOptional()
  @IsIn(VALID_BUTTON_VARIANTS)
  buttonVariant?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(9999)
  buttonRadius?: number;

  @IsString()
  @IsOptional()
  @IsIn(VALID_BUTTON_SHADOWS)
  buttonShadow?: string;

  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: 'buttonColor debe ser un color hex válido (#rrggbb)',
  })
  buttonColor?: string;

  @IsString()
  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: 'buttonTextColor debe ser un color hex válido (#rrggbb)',
  })
  buttonTextColor?: string;

  @IsBoolean()
  @IsOptional()
  altTitleFont?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(VALID_FONTS)
  titleFont?: string;
}

class ImportLinkDto {
  @IsString()
  @IsNotEmpty()
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

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsIn(['classic', 'featured'])
  layout?: 'classic' | 'featured';
}

class ImportStickerDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  rotation: number;

  @IsOptional()
  @IsNumber()
  scale?: number;

  @IsOptional()
  @IsBoolean()
  animated?: boolean;
}

class ImportProjectDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  githubRepo?: string;

  @IsOptional()
  @IsInt()
  stars?: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class ImportProfileDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ImportProfileSectionDto)
  profile?: ImportProfileSectionDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportLinkDto)
  links?: ImportLinkDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportStickerDto)
  stickers?: ImportStickerDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportProjectDto)
  projects?: ImportProjectDto[];
}
