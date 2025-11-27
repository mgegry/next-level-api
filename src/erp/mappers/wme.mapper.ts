import { PartnerDto } from '../dtos/response/partner.dto';
import { WorkpointDto } from '../dtos/response/workpoint.dto';
import { WmePartnerDto } from '../dtos/wme/wme-partner.dto';
import { WmeWorkpointDto } from '../dtos/wme/wme-workpoint.dto';

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
}
