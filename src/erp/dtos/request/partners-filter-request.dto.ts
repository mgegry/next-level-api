import { IsOptional, IsString } from 'class-validator';

export class PartnersFilterRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  fiscalCode?: string;
}
