import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ReceiptService } from './services/receipt.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post('scan')
  // @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  scanReceipt(@UploadedFile() file: Express.Multer.File) {
    return this.receiptService.scanAndSave(file);
  }
}
