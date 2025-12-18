export interface PurchaseInvoiceItemDto {
  id: string;
  name: string;
  price: number;
  quantity: number;
  taxable: boolean;
  measureUnit: string;
  vatPercentage: string;
}
