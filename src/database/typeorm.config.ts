import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import path from 'path';

import { config } from 'dotenv';

const envFile =
  process.env.NODE_ENV === 'production' ? 'config/.env.prod' : 'config/.env';

// 👇 Absolute path from project root
config({
  path: path.resolve(process.cwd(), envFile),
});

const configService = new ConfigService();

// TODO: GET INFORMATION FROM ENVIRONMENT VARIABLES

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'db_erphub',
  // host: configService.get<string>('DATABASE_HOST'),
  // port: parseInt(configService.get<string>('DB_PORT') ?? '5432', 5432),
  // username: configService.get<string>('DB_USER'),
  // password: configService.get<string>('DB_PASS')?.toString(),
  // database: configService.get<string>('DB_NAME'),
  synchronize: false,
  entities: ['**/*.entity.ts'],
  migrations: ['src/database/migrations/*-migration.ts'],
  migrationsRun: false,
  logging: true,
});

export default AppDataSource;
