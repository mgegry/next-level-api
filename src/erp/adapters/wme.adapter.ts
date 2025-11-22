import { HttpService } from '@nestjs/axios';
import { IErpAdapter } from '../erp.interface';
import { firstValueFrom } from 'rxjs';

export class WmeAdaptor implements IErpAdapter {
  constructor(
    private readonly config: Record<string, any>,
    private readonly http: HttpService,
  ) {}

  public async getClients(): Promise<any> {
    const response = await firstValueFrom(
      this.http.get(`${this.config.wme_base_url}/getInfoParteneri`),
    );

    return response.data;
  }
}
