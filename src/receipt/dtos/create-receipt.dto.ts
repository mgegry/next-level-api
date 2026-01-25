import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumberString,
} from 'class-validator';

export class CreateReceiptDto {
  @IsString()
  @IsOptional()
  receiptNumber?: string;

  @IsDateString()
  @IsNotEmpty()
  @Type(() => Date)
  receiptDate: Date; // Received as ISO string from JSON, converted to Date by TypeORM

  @IsString()
  @IsNotEmpty()
  supplierName: string;

  @IsString()
  @IsOptional()
  supplierTaxId?: string;

  @IsNumberString()
  @IsNotEmpty()
  totalAmount: string;
}
