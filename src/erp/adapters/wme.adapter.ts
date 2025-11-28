import { HttpService } from '@nestjs/axios';
import { IErpAdapter } from '../erp-adapter.interface';
import { firstValueFrom, Observable } from 'rxjs';
import { PartnerDto } from '../dtos/response/partner.dto';
import { WmeMapper } from '../mappers/wme.mapper';
import { WmePartnerResponseDto } from '../dtos/wme/wme-partner.dto';
import { PaginatedResponseDto } from '../dtos/response/common/paginated-response.dto';
import { WmeItemResponseDto } from '../dtos/wme/wme-item.dto';
import { ItemDto } from '../dtos/response/item.dto';
import { WmeAccountsReceivableResponseDto } from '../dtos/wme/wme-accounts-receivable.dto';
import { DataResponseDto } from '../dtos/response/common/data-resposne.dto';
import { DashboardDataDto } from '../dtos/response/dashboard-data.dto';

export class WmeAdapter implements IErpAdapter {
  constructor(
    private readonly config: Record<string, any>,
    private readonly http: HttpService,
  ) {}

  async getItems(
    pageNumber: number,
    pageElementsNumber: number,
  ): Promise<PaginatedResponseDto<ItemDto>> {
    const payload = {
      Paginare: {
        Pagina: pageNumber,
        Inregistrari: pageElementsNumber,
      },
    };

    const response = await firstValueFrom(
      this.http.post<WmeItemResponseDto>(
        `${this.config.wme_base_url}/%22GetInfoArticole%22`,
        payload,
      ),
    );

    const items = response.data.InfoArticole.map(WmeMapper.toItemDto);
    const pagination = response.data.Paginare;

    return {
      data: items,
      pagination: {
        totalPages: Number(pagination.TotalPagini),
        page: Number(pagination.Pagina),
      },
    };
  }

  async getClients(
    pageNumber: number,
    pageElementsNumber: number,
  ): Promise<PaginatedResponseDto<PartnerDto>> {
    const payload = {
      Paginare: {
        Pagina: pageNumber,
        Inregistrari: pageElementsNumber,
      },
    };

    const response = await firstValueFrom(
      this.http.post<WmePartnerResponseDto>(
        `${this.config.wme_base_url}/%22GetInfoParteneri%22`,
        payload,
      ),
    );

    const partners = response.data.InfoParteneri.map(WmeMapper.toPartnerDto);
    const pagination = response.data.Paginare;

    return {
      data: partners,
      pagination: {
        totalPages: Number(pagination.TotalPagini),
        page: Number(pagination.Pagina),
      },
    };
  }

  async getDashboard(): Promise<DataResponseDto<DashboardDataDto>> {
    const responseAccountsRceivable = await this.getAccountsReceivable();

    let currencyAccountReceivableAdvancePaymentDictonary: Record<
      string,
      number
    > = {};
    let currencyAccountReceivableInvoicesDictonary: Record<string, number> = {};

    for (const item of responseAccountsRceivable.InfoSolduri) {
      switch (item.TipDocument) {
        case 'Avans':
          if (item.Moneda in currencyAccountReceivableAdvancePaymentDictonary) {
            currencyAccountReceivableAdvancePaymentDictonary[item.Moneda] +=
              Number(item.Rest.replace(',', '.'));
          } else {
            currencyAccountReceivableAdvancePaymentDictonary[item.Moneda] =
              Number(item.Rest.replace(',', '.'));
          }
          break;

        case 'Factura':
          if (item.Moneda in currencyAccountReceivableInvoicesDictonary) {
            currencyAccountReceivableInvoicesDictonary[item.Moneda] += Number(
              item.Rest.replace(',', '.'),
            );
          } else {
            currencyAccountReceivableInvoicesDictonary[item.Moneda] = Number(
              item.Rest.replace(',', '.'),
            );
          }
          break;
      }
    }

    // ✅ Convert dictionary → array of objects
    const advancePaymentsArrayReceivable = Object.entries(
      currencyAccountReceivableAdvancePaymentDictonary,
    ).map(([currency, amount]) => ({
      currency,
      amount: Math.round(amount),
    }));

    const invoicesArrayPayableReceivable = Object.entries(
      currencyAccountReceivableInvoicesDictonary,
    ).map(([currency, amount]) => ({
      currency,
      amount: Math.round(amount),
    }));

    const responseAccountsPayable = await this.getAccountPayable();

    let currencyAccountPayableAdvancePaymentDictonary: Record<string, number> =
      {};
    let currencyAccountPayableInvoicesDictonary: Record<string, number> = {};

    for (const item of responseAccountsPayable.InfoSolduri) {
      switch (item.TipDocument) {
        case 'Avans':
          if (item.Moneda in currencyAccountPayableAdvancePaymentDictonary) {
            currencyAccountPayableAdvancePaymentDictonary[item.Moneda] +=
              Number(item.Rest.replace(',', '.'));
          } else {
            currencyAccountPayableAdvancePaymentDictonary[item.Moneda] = Number(
              item.Rest.replace(',', '.'),
            );
          }
          break;

        case 'Factura':
          if (item.Moneda in currencyAccountPayableInvoicesDictonary) {
            currencyAccountPayableInvoicesDictonary[item.Moneda] += Number(
              item.Rest.replace(',', '.'),
            );
          } else {
            currencyAccountPayableInvoicesDictonary[item.Moneda] = Number(
              item.Rest.replace(',', '.'),
            );
          }
          break;
      }
    }

    // ✅ Convert dictionary → array of objects
    const advancePaymentsArrayPayable = Object.entries(
      currencyAccountPayableAdvancePaymentDictonary,
    ).map(([currency, amount]) => ({
      currency,
      amount: Math.round(amount),
    }));

    const invoicesArrayPayable = Object.entries(
      currencyAccountPayableInvoicesDictonary,
    ).map(([currency, amount]) => ({
      currency,
      amount: Math.round(amount),
    }));

    return {
      data: {
        amountAccountsReceivableInvoices: invoicesArrayPayableReceivable,
        amountAccountReceivableAdvancePayments: advancePaymentsArrayReceivable,
        amountAccountsPayableInvoices: invoicesArrayPayable,
        amountAccountPayableAdvancePayments: advancePaymentsArrayPayable,
      },
    };
  }

  private async getAccountsReceivable(): Promise<WmeAccountsReceivableResponseDto> {
    const response = await firstValueFrom(
      this.http.get<WmeAccountsReceivableResponseDto>(
        `${this.config.wme_base_url}/GetSolduriClienti`,
      ),
    );

    return response.data;
  }

  private async getAccountPayable(): Promise<any> {
    const response = await firstValueFrom(
      this.http.get<WmeAccountsReceivableResponseDto>(
        `${this.config.wme_base_url}/GetSolduriFurnizori`,
      ),
    );

    return response.data;
  }
}
