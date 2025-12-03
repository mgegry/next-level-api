import { IsOptional, IsString } from 'class-validator';

export class ItemsFilterRequestDto {
  @IsOptional()
  @IsString()
  name?: string;
}
