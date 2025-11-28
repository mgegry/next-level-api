import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ErpService } from './erp.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CsrfGuard } from 'src/auth/guards/csrf.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/user.entity';

@Controller('erp')
export class ErpController {
  constructor(private readonly erpService: ErpService) {}

  @Get('dashboard')
  @UseGuards(JwtGuard, CsrfGuard)
  async getDashboard(@CurrentUser() user: User) {
    return this.erpService.getDashboard(user);
  }

  @Get('partners')
  @UseGuards(JwtGuard, CsrfGuard)
  async getPartners(
    @CurrentUser() user: User,
    @Query('pageNumber') pageNumber: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.erpService.getClients(user, pageNumber, pageSize);
  }

  @Get('items')
  @UseGuards(JwtGuard, CsrfGuard)
  async getItems(
    @CurrentUser() user: User,
    @Query('pageNumber') pageNumber: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.erpService.getItems(user, pageNumber, pageSize);
  }
}
