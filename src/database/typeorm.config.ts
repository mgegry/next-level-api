import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { config } from 'dotenv';

const envFile =
  process.env.NODE_ENV === 'production'
    ? 'config/.env.production'
    : 'config/.env.development';

config({ path: envFile });

const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: parseInt(configService.get<string>('DB_PORT') ?? '5432', 5432),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASS')?.toString(),
  database: configService.get<string>('DB_NAME'),
  synchronize: false,
  entities: ['**/*.entity.ts'],
  migrations: [__dirname + '/database/migration/**/*{.js,.ts}'],
  migrationsRun: false,
  logging: true,
});

export default AppDataSource;
