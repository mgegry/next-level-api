import { Module } from '@nestjs/common';
import { CryptoModule } from './crypto/crypto.module';
import { LoggerModule } from './logger/logger.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

@Module({
  imports: [CryptoModule, LoggerModule],
  providers: [AllExceptionsFilter],
})
export class CoreModule {}
