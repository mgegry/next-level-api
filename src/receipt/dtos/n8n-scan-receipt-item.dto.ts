import { IsInt, IsNumber, IsString, Max, Min } from 'class-validator';

export class N8nReceiptItemDto {
  @IsString()
  productName: string;

  @IsInt()
  categoryId: number;

  @IsInt()
  @Min(0)
  @Max(100)
  confidence: number;

  @IsNumber()
  totalPrice: number;

  @IsNumber()
  itemPrice: number;

  @IsNumber()
  quantity: number;
}
