import { WorkpointDto } from './workpoint.dto';

export interface PartnerDto {
  id: string;
  name: string;
  fiscalCode: string;
  dueAtSale: string;
  dueAtPurchase: string;
  clientCredit: string;
  fixDiscount: string;
  workpoints?: WorkpointDto[];
  createdAt: string;
}
