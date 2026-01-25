import { Receipt } from 'src/receipt/entities/receipt.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'receipt_item' })
export class ReceiptItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'receipt_id' })
  receiptId: number;

  @ManyToOne(() => Receipt, (receipt) => receipt.receiptItems)
  @JoinColumn({ name: 'receipt_id' })
  receipt: Receipt;
}
