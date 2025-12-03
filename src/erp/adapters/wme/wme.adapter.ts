import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WmeMapper } from './wme.mapper';
import { WmePartnerResponseDto } from './dtos/wme-partner.dto';
import { WmeItemResponseDto } from './dtos/wme-item.dto';
import { WmeAccountsReceivableResponseDto } from './dtos/wme-accounts-receivable.dto';
import { PaginatedRequestDto } from 'src/erp/dtos/request/paginated-request.dto';
import { IErpAdapter } from '../erp-adapter.interface';
import { ItemsFilterRequestDto } from 'src/erp/dtos/request/items-filter-request.dto';
import { PartnersFilterRequestDto } from 'src/erp/dtos/request/partners-filter-request.dto';
import { ItemDto } from 'src/erp/dtos/domain/item.dto';
import { PartnerDto } from 'src/erp/dtos/domain/partner.dto';
import { DashboardDataDto } from 'src/erp/dtos/domain/dashboard-data.dto';
import { PaginatedResponseDto } from 'src/erp/dtos/common/paginated-response.dto';
import { DataResponseDto } from 'src/erp/dtos/common/data-resposne.dto';

export class WmeAdapter implements IErpAdapter {
  constructor(
    private readonly config: Record<string, any>,
    private readonly http: HttpService,
  ) {}

  getPurchaseInvoices(
    pagination: PaginatedRequestDto,
    filters: any,
  ): Promise<PaginatedResponseDto<any>> {
    throw new Error('Method not implemented.');
  }

  async getItems(
    pagination: PaginatedRequestDto,
    filters: ItemsFilterRequestDto,
  ): Promise<PaginatedResponseDto<ItemDto>> {
    const payload = {
      Paginare: {
        Pagina: pagination.pageNumber,
        Inregistrari: pagination.pageSize,
      },
      Denumire: filters.name ?? '',
    };

    const response = await firstValueFrom(
      this.http.post<WmeItemResponseDto>(
        `${this.config.wme_base_url}/%22GetInfoArticole%22`,
        payload,
      ),
    );

    const itemsResponse = response.data.InfoArticole.map(WmeMapper.toItemDto);
    const paginationResponse = response.data.Paginare;

    return {
      data: itemsResponse,
      pagination: {
        totalPages: Number(paginationResponse.TotalPagini),
        page: Number(paginationResponse.Pagina),
      },
    };
  }

  async getPartners(
    pagination: PaginatedRequestDto,
    filters: PartnersFilterRequestDto,
  ): Promise<PaginatedResponseDto<PartnerDto>> {
    const payload = {
      Paginare: {
        Pagina: pagination.pageNumber,
        Inregistrari: pagination.pageSize,
      },
      Denumire: filters.name ?? '',
      CodFiscal: filters.fiscalCode ?? '',
    };

    const response = await firstValueFrom(
      this.http.post<WmePartnerResponseDto>(
        `${this.config.wme_base_url}/%22GetInfoParteneri%22`,
        payload,
      ),
    );

    const partnersResponse = response.data.InfoParteneri.map(
      WmeMapper.toPartnerDto,
    );
    const paginationResponse = response.data.Paginare;

    return {
      data: partnersResponse,
      pagination: {
        totalPages: Number(paginationResponse.TotalPagini),
        page: Number(paginationResponse.Pagina),
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
