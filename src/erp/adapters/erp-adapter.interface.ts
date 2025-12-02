import { DataResponseDto } from '../dtos/response/common/data-resposne.dto';
import { PaginatedResponseDto } from '../dtos/response/common/paginated-response.dto';
import { DashboardDataDto } from '../dtos/response/dashboard-data.dto';
import { ItemDto } from '../dtos/response/item.dto';
import { PartnerDto } from '../dtos/response/partner.dto';

export interface IErpAdapter {
  getPartners(
    pageNumber: number,
    pageElementsNumber: number,
    filters: any,
  ): Promise<PaginatedResponseDto<PartnerDto>>;

  getItems(
    pageNumber: number,
    pageElementsNumber: number,
    filters: any,
  ): Promise<PaginatedResponseDto<ItemDto>>;

  getDashboard(): Promise<DataResponseDto<DashboardDataDto>>;
}
