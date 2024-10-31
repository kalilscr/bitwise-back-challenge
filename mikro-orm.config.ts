import {
  PostgreSqlDriver,
  ReflectMetadataProvider,
} from '@mikro-orm/postgresql';
import { Options, ConnectionOptions } from '@mikro-orm/core';
import { config } from 'dotenv';
import path from 'path';

config();

export const ormConfig: Options = {
  entities: ['./dist/src/entities'],
  entitiesTs: ['./src/entities'],
  baseDir: process.cwd(),
  dbName: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  driver: PostgreSqlDriver,
  metadataProvider: ReflectMetadataProvider,
  migrations: {
    path: './dist/src/migrations',
    pathTs: './src/migrations',
    glob: '!(*.d).{js,ts}',
  },
};
