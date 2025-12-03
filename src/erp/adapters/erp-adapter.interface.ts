import { DataResponseDto } from '../dtos/common/data-resposne.dto';
import { PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import { DashboardDataDto } from '../dtos/domain/dashboard-data.dto';
import { ItemDto } from '../dtos/domain/item.dto';
import { PartnerDto } from '../dtos/domain/partner.dto';
import { PaginatedRequestDto } from '../dtos/request/paginated-request.dto';

export interface IErpAdapter {
  getDashboard(): Promise<DataResponseDto<DashboardDataDto>>;

  getPartners(
    pagination: PaginatedRequestDto,
    filters: any,
  ): Promise<PaginatedResponseDto<PartnerDto>>;

  getItems(
    pagination: PaginatedRequestDto,
    filters: any,
  ): Promise<PaginatedResponseDto<ItemDto>>;

  getPurchaseInvoices(
    pagination: PaginatedRequestDto,
    filters: any,
  ): Promise<PaginatedResponseDto<any>>;
}
