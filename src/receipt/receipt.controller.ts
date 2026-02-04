import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtTenantGuard } from 'src/auth/guards/jwt-tenant.guard';
import { ReceiptService } from './services/receipt.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsS3Service } from 'src/core/aws/aws-s3.service';
import { User } from 'src/user/entities/user.entity';
import { CurrentAccessUser } from 'src/auth/decorators/current-access-user.decorator';
import type { AccessUser } from 'src/auth/interfaces/access-user.interface';

@Controller('receipts')
export class ReceiptController {
  constructor(
    private readonly receiptService: ReceiptService,
    private readonly s3: AwsS3Service,
  ) {}

  @Post('scan')
  @UseGuards(JwtTenantGuard)
  @UseInterceptors(FileInterceptor('file'))
  scanReceipt(
    @CurrentAccessUser() user: AccessUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.receiptService.scanAndSave(file, user.userId);
  }

  @Get()
  @UseGuards(JwtTenantGuard)
  getReceipts(@CurrentAccessUser() user: AccessUser) {
    return this.receiptService.getAllReceiptsForUser(user.userId);
  }

  @Get(':id/items')
  @UseGuards(JwtTenantGuard)
  getReceiptItems(
    @CurrentAccessUser() user: AccessUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.receiptService.getReceiptItems(id, user.userId);
  }

  @Get(':id')
  @UseGuards(JwtTenantGuard)
  getReceipt(
    @CurrentAccessUser() user: AccessUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.receiptService.getReceiptForUser(id, user.userId);
  }

  // @Post('presign-upload')
  // @UseGuards(JwtGuard)
  // presignUpload(
  //   @CurrentAccessUser() user: AccessUser,
  //   @Body() body: { mimeType: string; ext: string },
  // ) {
  //   return this.s3.presignUpload(user.id, body.mimeType, body.ext);
  // }

  // @Get('presign-view')
  // @UseGuards(JwtGuard)
  // presignView(@Query('key') key: string) {
  //   return this.s3.presignView(key);
  // }
}
