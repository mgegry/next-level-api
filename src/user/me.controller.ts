import { Controller, Get, UseGuards } from '@nestjs/common';
import { MeService } from './services/me.service';
import { JwtBootstrapGuard } from 'src/auth/guards/jwt-bootstrap.guard';
import { CurrentAccessUser } from 'src/auth/decorators/current-access-user.decorator';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get('tenants')
  @UseGuards(JwtBootstrapGuard) // <-- bootstrap is enough
  getMyTenants(@CurrentAccessUser() user: any) {
    return this.meService.getMyTenants(user.userId);
  }
}
