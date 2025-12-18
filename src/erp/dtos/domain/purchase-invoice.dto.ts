import { DocumentKind } from './enums/document-kind.enum';
import { PurchaseInvoiceItemDto } from './purchase-invoice-item.dto';

export interface PurchaseInvoiceDto {
  id: string;
  documentKind: DocumentKind;
  supplier: string;
  supplierFiscalCode: string;
  createdAt: string;
  notes: string;
  lastPayment: string;
  total: number;
  purchaseInvoiceItems: PurchaseInvoiceItemDto[];
}
