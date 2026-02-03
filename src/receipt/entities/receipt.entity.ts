import { ReceiptItem } from 'src/receipt/entities/receipt-item.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Receipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'receipt_number', nullable: true })
  receiptNumber: string;

  @Column({ name: 'receipt_date', type: 'date' })
  receiptDate: Date;

  @Column({ name: 'supplier_name' })
  supplierName: string;

  @Column({ name: 'supplier_tax_id', nullable: true })
  supplierTaxId: string;

  @Column({ name: 'total_amount', type: 'numeric', precision: 12, scale: 2 })
  totalAmount: string;

  @Column({ name: 's3_key' })
  s3Key: string;

  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ReceiptItem, (receiptItem) => receiptItem.receipt)
  receiptItems: ReceiptItem[];
}
