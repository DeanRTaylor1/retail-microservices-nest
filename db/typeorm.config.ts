import 'reflect-metadata';
import { join } from 'node:path';

import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config({
  path: join(
    process.cwd(),
    `.env.${process.env.NODE_ENV ?? 'development'}.local`,
  ),
});

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as 'postgres',
  host: 'localhost',
  port: Number(process.env.DB_PORT),
  username: process.env.POSTGRES_USER,
  password: String(process.env.POSTGRES_PASSWORD),
  database: process.env.POSTGRES_DB,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [],
  migrations: [__dirname + '/migrations/**/*.ts'],
  subscribers: [],
});
