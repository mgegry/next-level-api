import { Receipt } from '../entities/receipt.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
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

  save(receipt: Receipt): Promise<Receipt> {
    return this.repository.save(receipt);
  }
}
