import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/user/role.enum';

@Controller('erp')
export class ErpController {
  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return [];
  }
}
