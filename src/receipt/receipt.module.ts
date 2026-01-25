import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Receipt } from './entities/receipt.entity';
import { ReceiptItem } from './entities/receipt-item.entity';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './services/receipt.service';
import { ReceiptRepository } from './repositories/receipt.repository';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Receipt, ReceiptItem]), HttpModule],
  exports: [TypeOrmModule],
  controllers: [ReceiptController],
  providers: [ReceiptService, ReceiptRepository],
})
export class ReceiptModule {}
