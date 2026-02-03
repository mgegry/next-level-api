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
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ReceiptService } from './services/receipt.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsS3Service } from 'src/core/aws/aws-s3.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/user.entity';

@Controller('receipts')
export class ReceiptController {
  constructor(
    private readonly receiptService: ReceiptService,
    private readonly s3: AwsS3Service,
  ) {}

  @Post('scan')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  scanReceipt(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.receiptService.scanAndSave(file, user.id);
  }

  @Get()
  @UseGuards(JwtGuard)
  getReceipts(@CurrentUser() user: User) {
    return this.receiptService.getAllReceiptsForUser(user.id);
  }

  @Get(':id/items')
  @UseGuards(JwtGuard)
  getReceiptItems(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.receiptService.getReceiptItems(id, user.id);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  getReceipt(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.receiptService.getReceiptForUser(id, user.id);
  }

  @Post('presign-upload')
  @UseGuards(JwtGuard)
  presignUpload(
    @CurrentUser() user: User,
    @Body() body: { mimeType: string; ext: string },
  ) {
    return this.s3.presignUpload(user.id, body.mimeType, body.ext);
  }

  @Get('presign-view')
  @UseGuards(JwtGuard)
  presignView(@Query('key') key: string) {
    return this.s3.presignView(key);
  }
}
