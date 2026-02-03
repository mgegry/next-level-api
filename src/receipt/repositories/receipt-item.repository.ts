import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReceiptItem } from '../entities/receipt-item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReceiptItemRepository {
  constructor(
    @InjectRepository(ReceiptItem)
    private readonly repository: Repository<ReceiptItem>,
  ) {}

  async findByReceiptId(receiptId: number): Promise<ReceiptItem[]> {
    return this.repository.find({
      where: { receiptId },
      order: { id: 'ASC' },
    });
  }
}
