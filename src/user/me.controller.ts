import { Controller, Get, UseGuards } from '@nestjs/common';
import { MeService } from './services/me.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CurrentAccessUser } from 'src/auth/decorators/current-access-user.decorator';
import type { AccessUser } from 'src/auth/interfaces/access-user.interface';
import { MyTenantDto } from './dtos/my-tenant.dto';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get('tenants')
  @UseGuards(JwtGuard)
  getMyTenants(@CurrentAccessUser() user: AccessUser): Promise<MyTenantDto[]> {
    return this.meService.getMyTenants(user.userId);
  }
}
