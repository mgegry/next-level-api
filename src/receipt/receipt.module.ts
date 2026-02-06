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
import { AccessControlModule } from 'src/access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receipt, ReceiptItem]),
    AccessControlModule,
    HttpModule,
    AwsModule,
  ],
  providers: [ReceiptService, ReceiptRepository, ReceiptItemRepository],
  controllers: [ReceiptController],
})
export class ReceiptModule {}
