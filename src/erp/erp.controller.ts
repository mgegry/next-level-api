import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ErpService } from './erp.service';
import { JwtTenantGuard } from 'src/auth/guards/jwt-tenant.guard';
import { CurrentAccessUser } from 'src/auth/decorators/current-access-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { PaginatedRequestDto } from './dtos/request/paginated-request.dto';
import { PartnersFilterRequestDto } from './dtos/request/partners-filter-request.dto';
import { ItemsFilterRequestDto } from './dtos/request/items-filter-request.dto';

@Controller('erp')
export class ErpController {
  constructor(private readonly erpService: ErpService) {}

  // @Get('dashboard')
  // @UseGuards(JwtGuard)
  // getDashboard(@CurrentUser() user: User) {
  //   return this.erpService.getDashboard(user);
  // }

  // @Get('partners')
  // @UseGuards(JwtGuard)
  // getPartners(
  //   @CurrentUser() user: User,
  //   @Query() pagination: PaginatedRequestDto,
  //   @Query() filters: PartnersFilterRequestDto,
  // ) {
  //   return this.erpService.getPartners(user, pagination, filters);
  // }

  // @Get('items')
  // @UseGuards(JwtGuard)
  // getItems(
  //   @CurrentUser() user: User,
  //   @Query() pagination: PaginatedRequestDto,
  //   @Query() filters: ItemsFilterRequestDto,
  // ) {
  //   return this.erpService.getItems(user, pagination, filters);
  // }

  // @Get('purchase-invoices')
  // @UseGuards(JwtGuard)
  // getPurchaseInvoices(
  //   @CurrentUser() user: User,
  //   @Query() pagination: PaginatedRequestDto,
  //   @Query() filters: ItemsFilterRequestDto,
  // ) {
  //   return this.erpService.getPurchaseInvoices(user, pagination, filters);
  // }
}
