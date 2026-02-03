import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import FormData from 'form-data';
import { DataSource } from 'typeorm';
import { N8nScanReceiptDto } from '../dtos/n8n-scan-receipt.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Receipt } from '../entities/receipt.entity';
import { ReceiptItem } from '../entities/receipt-item.entity';
import { AwsS3Service } from 'src/core/aws/aws-s3.service';
import { ReceiptRepository } from '../repositories/receipt.repository';
import { ReceiptItemRepository } from '../repositories/receipt-item.repository';

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly http: HttpService,
    private readonly s3: AwsS3Service,
    private readonly receiptRepository: ReceiptRepository,
    private readonly receiptItemRepository: ReceiptItemRepository,
  ) {}

  async getReceiptForUser(receiptId: number, userId: number): Promise<Receipt> {
    const receipt = await this.receiptRepository.findByIdForUser(
      receiptId,
      userId,
    );

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    return receipt;
  }

  async getAllReceiptsForUser(userId: number): Promise<Receipt[]> {
    return this.receiptRepository.findAllForUser(userId);
  }

  async getReceiptPageForUser(
    userId: number,
    page = 1,
    limit = 20,
  ): Promise<{ data: Receipt[]; total: number; page: number; limit: number }> {
    return this.receiptRepository.findPageForUser(userId, page, limit);
  }

  async getReceiptItems(
    receiptId: number,
    userId: number,
  ): Promise<ReceiptItem[]> {
    const receipt = await this.receiptRepository.findByIdForUser(
      receiptId,
      userId,
    );

    if (!receipt) throw new NotFoundException('Receipt not found');

    return this.receiptItemRepository.findByReceiptId(receiptId);
  }

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
          'https://n8n.blueaisolutions.com/webhook/181d4910-2f17-47f9-ad8c-e0844ae90b5d',
          form,
          { headers: form.getHeaders(), timeout: 30000 },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        'N8N scan failed',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to process receipt with OCR',
      );
    }
  }

  async scanAndSave(file: Express.Multer.File, userId: number) {
    let s3Key: string | undefined = undefined;

    try {
      // Step 1: Upload to S3
      this.logger.log({ userId }, 'Uploading receipt to S3');
      s3Key = await this.s3.upload(userId, file);

      // Step 2: Send to n8n for OCR processing
      this.logger.log({ s3Key }, 'Sending receipt to n8n for OCR');
      const rawResponse = await this.scan(file);
      const scanData = plainToInstance(N8nScanReceiptDto, rawResponse);

      // Step 3: Validate OCR response
      try {
        await validateOrReject(scanData, {
          whitelist: true,
          forbidNonWhitelisted: true,
        });
      } catch (validationErrors) {
        this.logger.error('Invalid scan response from n8n', validationErrors);
        throw new BadRequestException('Invalid scan response from n8n');
      }

      this.logger.log({ s3Key }, 'Saving receipt to database');
      return this.dataSource.transaction(async (manager) => {
        const receiptRepo = manager.getRepository(Receipt);
        const lineRepo = manager.getRepository(ReceiptItem);

        const receipt = receiptRepo.create({
          receiptNumber: scanData.receiptNumber,
          receiptDate: new Date(scanData.receiptDate),
          supplierName: scanData.supplierName,
          supplierTaxId: scanData.supplierTaxId,
          totalAmount: scanData.totalAmount.toFixed(2),
          userId: userId,
          s3Key: s3Key,
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
            receiptId: savedReceipt.id,
          }),
        );

        await lineRepo.save(lines);

        return savedReceipt;
      });
    } catch (error) {
      this.logger.error('Receipt processing failed', error.stack);

      // Rollback: Clean up S3 if we uploaded but failed later
      if (s3Key) {
        await this.cleanupS3(s3Key);
      }

      // Re-throw the error (let global exception filter handle it)
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to process receipt. Please try again.',
      );
    }
  }

  private async cleanupS3(key: string): Promise<void> {
    try {
      this.logger.warn({ key }, 'Rolling back S3 upload');
      await this.s3.deleteObject(key);
    } catch (error) {
      this.logger.error(
        { key, error: error.message },
        'Failed to cleanup S3 object during rollback',
      );
      // Don't throw - this is best effort cleanup
    }
  }
}
