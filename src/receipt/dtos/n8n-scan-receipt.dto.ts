import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { N8nReceiptItemDto } from './n8n-scan-receipt-item.dto';

export class N8nScanReceiptDto {
  @IsString()
  receiptNumber: string;

  @IsDateString() // expects ISO-ish like "2025-12-09"
  receiptDate: string;

  @IsString()
  supplierName: string;

  @IsString()
  supplierTaxId: string;

  @IsNumber()
  totalAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => N8nReceiptItemDto)
  items: N8nReceiptItemDto[];
}
