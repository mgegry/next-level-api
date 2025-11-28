import { HttpService } from '@nestjs/axios';
import { IErpAdapter } from '../erp-adapter.interface';
import { firstValueFrom } from 'rxjs';
import { PartnerDto } from '../dtos/response/partner.dto';
import { WmeMapper } from '../mappers/wme.mapper';
import { WmePartnerResponseDto } from '../dtos/wme/wme-partner.dto';
import { PaginatedResponseDto } from '../dtos/response/common/paginated-response.dto';
import { WmeItemResponseDto } from '../dtos/wme/wme-item.dto';
import { ItemDto } from '../dtos/response/item.dto';

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
        `${this.config.wme_base_url}/%22getInfoParteneri%22`,
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
}
