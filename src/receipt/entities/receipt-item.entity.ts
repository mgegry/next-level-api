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

  @Column()
  name: string;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'total_price', type: 'numeric', precision: 12, scale: 2 })
  totalPrice: string;

  @Column({ name: 'item_price', type: 'numeric', precision: 12, scale: 2 })
  itemPrice: string;

  @Column()
  quantity: number;

  @Column({ name: 'category_classification_confidence' })
  categoryCalssificationConfidence: number;

  @Column({ name: 'receipt_id' })
  receiptId: number;

  @ManyToOne(() => Receipt, (receipt) => receipt.receiptItems)
  @JoinColumn({ name: 'receipt_id' })
  receipt: Receipt;
}
