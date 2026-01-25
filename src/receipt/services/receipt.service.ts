import { Injectable } from '@nestjs/common';
import { ReceiptRepository } from '../repositories/receipt.repository';
import { CreateReceiptDto } from '../dtos/create-receipt.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import FormData from 'form-data';

@Injectable()
export class ReceiptService {
  constructor(
    private readonly receiptRepository: ReceiptRepository,
    private readonly http: HttpService,
  ) {}

  async create(createReceiptDto: CreateReceiptDto) {
    const newReceipt = this.receiptRepository.create(createReceiptDto);
    return await this.receiptRepository.save(newReceipt);
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
        this.http.post(
          'https://n8n.blueaisolutions.com/webhook-test/181d4910-2f17-47f9-ad8c-e0844ae90b5d',
          form,
        ),
      );
      return response.data;
    } catch (error) {
      console.error('Error details:', error.response?.data);
      throw error;
    }
  }
}
