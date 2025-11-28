import { PaginatedResponseDto } from './dtos/response/common/paginated-response.dto';
import { ItemDto } from './dtos/response/item.dto';
import { PartnerDto } from './dtos/response/partner.dto';

export interface IErpAdapter {
  getClients(
    pageNumber: number,
    pageElementsNumber: number,
  ): Promise<PaginatedResponseDto<PartnerDto>>;

  getItems(
    pageNumber: number,
    pageElementsNumber: number,
  ): Promise<PaginatedResponseDto<ItemDto>>;
}
