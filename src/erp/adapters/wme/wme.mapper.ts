import { WorkpointDto } from 'src/erp/dtos/domain/workpoint.dto';
import { WmeItemDto } from './dtos/wme-item.dto';
import { WmePartnerDto } from './dtos/wme-partner.dto';
import { WmeWorkpointDto } from './dtos/wme-workpoint.dto';
import { PartnerDto } from 'src/erp/dtos/domain/partner.dto';
import { ItemDto } from 'src/erp/dtos/domain/item.dto';
import {
  WmePurchaseInvoiceDto,
  WmePurchaseInvoiceItemDto,
} from './dtos/wme-purchase-invoice.dto';
import { PurchaseInvoiceDto } from 'src/erp/dtos/domain/purchase-invoice.dto';
import { DocumentKind } from 'src/erp/dtos/domain/enums/document-kind.enum';
import { PurchaseInvoiceItemDto } from 'src/erp/dtos/domain/purchase-invoice-item.dto';

export class WmeMapper {
  static toPartnerDto(raw: WmePartnerDto): PartnerDto {
    return {
      id: raw.Cod,
      name: raw.Denumire,
      fiscalCode: raw.CodFiscal,
      dueAtSale: raw.ScadentaLaVanzare,
      dueAtPurchase: raw.ScadentaLaCumparare,
      clientCredit: raw.CreditClient,
      fixDiscount: raw.DiscountFix,
      workpoints: raw.Sedii?.map((wp) => WmeMapper.toWorkpointDto(wp)),
      createdAt: raw.DataAdaugarii,
    };
  }

  static toWorkpointDto(raw: WmeWorkpointDto): WorkpointDto {
    return {
      id: raw.CodSediu,
      name: raw.Denumire,
      county: raw.Judet,
      street: raw.Strada,
      number: raw.Numar,
      agentFirstName: raw.Agent?.Prenume ?? '',
      agentLastName: raw.Agent?.Nume ?? '',
    };
  }

  static toItemDto(raw: WmeItemDto): ItemDto {
    return {
      id: raw.CodArticol,
      name: raw.Denumire,
      salePrice: raw.PretVanzare,
      priceWithVAT: raw.PretCuTVA,
      foreignCurrencyPrice: raw.PretValuta,
      vatPercentage: raw.ProcentTVA,
    };
  }

  static toPurchaseInvoiceDto(raw: WmePurchaseInvoiceDto): PurchaseInvoiceDto {
    let documentKind = DocumentKind.PurchaseInvoice;

    if (raw.TipDocument == 'BON FISCAL') documentKind = DocumentKind.Receipt;

    return {
      id: raw.CodIntr,
      documentKind: documentKind,
      supplier: raw.Furnizor,
      supplierFiscalCode: raw.IDFurnizor,
      createdAt: raw.Data,
      notes: raw.Observatii,
      lastPayment: raw.UltimaPlata,
      total: parseFloat(Number(raw.Valoare.replace(',', '.')).toFixed(2)),
      purchaseInvoiceItems: raw.Items?.map((i) =>
        WmeMapper.toPurchaseInvoiceItemDto(i),
      ),
    };
  }

  static toPurchaseInvoiceItemDto(
    raw: WmePurchaseInvoiceItemDto,
  ): PurchaseInvoiceItemDto {
    return {
      id: raw.CodLinieDocument,
      name: raw.Denumire,
      price: Number(raw.Pret.replace(',', '.')),
      quantity: Number(raw.Cant.replace(',', '.')),
      taxable: raw.Impozabil == 'DA' ? true : false,
      measureUnit: raw.UM,
      vatPercentage: raw.ProcTVA,
    };
  }
}
