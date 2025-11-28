import { HttpService } from '@nestjs/axios';
import { IErpAdapter } from '../erp-adapter.interface';
import { firstValueFrom } from 'rxjs';
import { SoftoneLoginResponseDto } from '../dtos/softone/softone-login-reponse.type';
import { SoftoneAuthenticateResponseDto } from '../dtos/softone/softone-authenticate-reponse.type';
import { PaginatedResponseDto } from '../dtos/response/common/paginated-response.dto';
import { ItemDto } from '../dtos/response/item.dto';
import { DataResponseDto } from '../dtos/response/common/data-resposne.dto';
import { DashboardDataDto } from '../dtos/response/dashboard-data.dto';

export class SoftoneAdapter implements IErpAdapter {
  private clientId: string | null = null;
  private isAuthenticating: boolean = false;
  private authPromise: Promise<string> | null = null;

  constructor(
    private readonly config: Record<string, any>,
    private readonly http: HttpService,
  ) {}

  async getDashboard(): Promise<DataResponseDto<DashboardDataDto>> {
    throw new Error('Method not implemented.');
  }

  async getItems(
    pageNumber: number,
    pageElementsNumber: number,
  ): Promise<PaginatedResponseDto<ItemDto>> {
    throw new Error('Method not implemented.');
  }

  async getClients(): Promise<any> {
    const token = await this.getToken();

    const response = await firstValueFrom(
      this.http.post<any>(this.config.softone_base_url, {
        service: 'getObjects',
        clientID: token,
        appId: this.config.softone_app_id,
      }),
    );

    return response.data;
  }

  async getToken(): Promise<string> {
    if (this.clientId) return this.clientId;

    if (this.isAuthenticating && this.authPromise) {
      return this.authPromise;
    }

    this.isAuthenticating = true;

    this.authPromise = this.authenticateFlow()
      .then((clientId) => {
        this.clientId = clientId;
        return clientId;
      })
      .finally(() => {
        this.isAuthenticating = false;
      });

    return this.authPromise;
  }

  private async authenticateFlow(): Promise<string> {
    const loginResult = await this.login();

    if (!loginResult.success) {
      throw new Error(`SoftOne Login failed: ${loginResult.error}`);
    }

    const loginToken = loginResult.clientID;
    const obj = loginResult.objs?.[0];

    const authenticateResult = await this.authenticate(
      loginToken,
      obj.COMPANY,
      obj.BRANCH,
      obj.MODULE,
      obj.REFID,
    );

    if (!authenticateResult.success) {
      throw new Error(
        `SoftOne Authenticate failed: ${authenticateResult.error}`,
      );
    }

    return authenticateResult.clientID;
  }

  private async login() {
    const body = {
      service: 'login',
      username: this.config.softone_username,
      password: this.config.softone_password,
      appid: this.config.softone_app_id,
    };

    const response = await firstValueFrom(
      this.http.post<SoftoneLoginResponseDto>(
        this.config.softone_base_url,
        body,
      ),
    );

    return response.data;
  }

  private async authenticate(
    clientId: string,
    company: string,
    branch: string,
    module: string,
    refid: string,
  ) {
    const body = {
      service: 'authenticate',
      clientID: clientId,
      company: company,
      branch: branch,
      module: module,
      refid: refid,
    };

    const response = await firstValueFrom(
      this.http.post<SoftoneAuthenticateResponseDto>(
        this.config.softone_base_url,
        body,
      ),
    );

    return response.data;
  }
}
