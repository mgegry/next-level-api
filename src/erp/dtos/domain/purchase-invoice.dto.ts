import { DocumentKind } from './enums/document-kind.enum';

export interface PurchaseInvoiceDto {
  id: string;
  documentKind: DocumentKind;
}
