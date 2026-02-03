import { Receipt } from '../entities/receipt.entity';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ReceiptRepository {
  constructor(
    @InjectRepository(Receipt)
    private readonly repository: Repository<Receipt>,
  ) {}

  create(data: Partial<Receipt>): Receipt {
    return this.repository.create(data);
  }

  async save(receipt: Receipt): Promise<Receipt> {
    return this.repository.save(receipt);
  }

  async findByIdForUser(
    receiptId: number,
    userId: number,
  ): Promise<Receipt | null> {
    return this.repository.findOne({
      where: { id: receiptId, userId: userId },
    });
  }

  async findPageForUser(
    userId: number,
    page = 1,
    limit = 20,
  ): Promise<{ data: Receipt[]; total: number; page: number; limit: number }> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);

    const [data, total] = await this.repository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' }, // remove if you don't have createdAt
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return { data, total, page: safePage, limit: safeLimit };
  }

  async findAllForUser(userId: number): Promise<Receipt[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' }, // remove if you don't have createdAt
    });
  }
}
