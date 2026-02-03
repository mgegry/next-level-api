import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Receipt } from './entities/receipt.entity';
import { ReceiptItem } from './entities/receipt-item.entity';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './services/receipt.service';
import { ReceiptRepository } from './repositories/receipt.repository';
import { HttpModule } from '@nestjs/axios';
import { ReceiptItemRepository } from './repositories/receipt-item.repository';
import { AwsModule } from 'src/core/aws/aws.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receipt, ReceiptItem]),
    HttpModule,
    AwsModule,
  ],
  exports: [TypeOrmModule],
  controllers: [ReceiptController],
  providers: [ReceiptService, ReceiptRepository, ReceiptItemRepository],
})
export class ReceiptModule {}
