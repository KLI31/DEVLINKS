import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

class ReorderItemDto {
  @IsUUID()
  id: string;

  @IsInt()
  @Min(0)
  displayOrder: number;
}

export class ReorderLinksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  links: ReorderItemDto[];
}
