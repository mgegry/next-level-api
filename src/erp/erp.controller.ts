import { Controller, Get, Request } from '@nestjs/common';
import { ErpService } from './erp.service';

@Controller('erp')
export class ErpController {
  constructor(private readonly erpService: ErpService) {}

  @Get('clients')
  async test(@Request() req) {
    return this.erpService.getClients(req);
  }
}
