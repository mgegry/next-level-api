import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsS3Service {
  private readonly logger = new Logger(AwsS3Service.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('S3_RECEIPTS_BUCKET_NAME')!;

    this.s3 = new S3Client({
      region: this.config.get<string>('AWS_REGION')!,
      credentials: {
        accessKeyId: this.config.get<string>('AWS_S3_ACCESS_KEY')!,
        secretAccessKey: this.config.get<string>('AWS_S3_SECRET_ACCESS_KEY')!,
      },
    });
  }

  async presignUpload(userId: number, mimeType: string, ext: string) {
    this.validateImage(mimeType, ext);

    const key = this.makeKey(userId, ext);

    const expiresIn =
      this.config.get<number>('S3_UPLOAD_URL_EXPIRES_SECONDS') ?? 300;

    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3, cmd, { expiresIn });

    return { uploadUrl, key };
  }

  async presignView(key: string) {
    const expiresIn =
      this.config.get<number>('S3_VIEW_URL_EXPIRES_SECONDS') ?? 300;

    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const viewUrl = await getSignedUrl(this.s3, cmd, { expiresIn });
    return { viewUrl };
  }

  async upload(userId: number, file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.split('.').pop() || 'jpg';
    const mimeType = file.mimetype;

    this.validateImage(mimeType, ext);

    const key = this.makeKey(userId, ext);

    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: mimeType,
    });

    await this.s3.send(cmd);

    this.logger.log({ key, userId }, 'File uploaded to S3');

    return key;
  }

  async deleteObject(key: string): Promise<void> {
    const cmd = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3.send(cmd);

    this.logger.log({ key }, 'File deleted from S3');
  }

  private validateImage(mimeType: string, ext: string) {
    const allowedMime = new Set(['image/jpeg', 'image/png', 'image/webp']);
    const allowedExt = new Set(['jpg', 'jpeg', 'png', 'webp']);

    if (!allowedMime.has(mimeType)) {
      this.logger.warn(
        { mimeType },
        'Unsupported mimeType when validating image for AWS S3.',
      );
      throw new BadRequestException('Unsupported mimeType');
    }
    if (!allowedExt.has(ext.toLowerCase())) {
      this.logger.warn(
        { ext },
        'Unsupported extension when validating image for AWS S3.',
      );
      throw new BadRequestException('Unsupported file extension');
    }
  }

  private makeKey(userId: number, ext: string) {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const id = crypto.randomUUID();
    return `uploads/user-${userId}/${date}/${id}.${ext.toLowerCase()}`;
  }
}
