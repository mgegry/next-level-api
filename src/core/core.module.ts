import { Module } from '@nestjs/common';
import { CryptoModule } from './crypto/crypto.module';
import { LoggerModule } from './logger/logger.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { AwsModule } from './aws/aws.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [CryptoModule, LoggerModule, AwsModule, RedisModule],
  providers: [AllExceptionsFilter],
})
export class CoreModule {}
