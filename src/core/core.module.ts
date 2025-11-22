import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CryptoModule } from './crypto/crypto.module';

@Module({
  imports: [DatabaseModule, CryptoModule]
})
export class CoreModule {}
