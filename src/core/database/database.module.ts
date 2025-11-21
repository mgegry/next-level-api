import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from 'src/tenant/tenant.entity';
import { User } from 'src/user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        entities: [User, Tenant],
        autoLoadEntities: true, // Load entities automatically
        synchronize: true, // Use migrations, not auto-sync (FALSE IN PRODUCTION)

        // migrationsRun: true, // Run migrations automatically
        // migrations: ['dist/migrations/*.js'],
      }),
    }),
  ],
})
export class DatabaseModule {}
