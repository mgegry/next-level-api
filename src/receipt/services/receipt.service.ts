import { BadRequestException, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import FormData from 'form-data';
import { DataSource } from 'typeorm';
import { N8nScanReceiptDto } from '../dtos/n8n-scan-receipt.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Receipt } from '../entities/receipt.entity';
import { ReceiptItem } from '../entities/receipt-item.entity';

@Injectable()
export class ReceiptService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly http: HttpService,
  ) {}

  async scan(file: Express.Multer.File) {
    try {
      const form = new FormData();

      form.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
        knownLength: file.size,
      });

      const response = await firstValueFrom(
        this.http.post<N8nScanReceiptDto>(
          'https://n8n.blueaisolutions.com/webhook-test/181d4910-2f17-47f9-ad8c-e0844ae90b5d',
          form,
          { headers: form.getHeaders() },
        ),
      );
      return response.data;
    } catch (error) {
      console.error('Error details:', error.response?.data);
      throw error;
    }
  }

  async scanAndSave(file: Express.Multer.File) {
    const rawResponse = await this.scan(file);
    const scanData = plainToInstance(N8nScanReceiptDto, rawResponse);

    try {
      await validateOrReject(scanData, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
    } catch {
      throw new BadRequestException('Invalid scan response from n8n');
    }

    return this.dataSource.transaction(async (manager) => {
      const receiptRepo = manager.getRepository(Receipt);
      const lineRepo = manager.getRepository(ReceiptItem);

      const receipt = receiptRepo.create({
        receiptNumber: scanData.receiptNumber,
        receiptDate: new Date(scanData.receiptDate),
        supplierName: scanData.supplierName,
        supplierTaxId: scanData.supplierTaxId,
        totalAmount: scanData.totalAmount.toFixed(2),
      });

      const savedReceipt = await receiptRepo.save(receipt);

      const lines = scanData.items.map((i) =>
        lineRepo.create({
          name: i.productName,
          categoryId: i.categoryId,
          totalPrice: i.totalPrice.toFixed(2),
          itemPrice: i.itemPrice.toFixed(2),
          quantity: i.quantity,
          categoryCalssificationConfidence: i.confidence,
          receipt: savedReceipt, // OR receiptId: savedReceipt.id
        }),
      );

      await lineRepo.save(lines);

      return { receipt: savedReceipt, lines };
    });
  }
}
