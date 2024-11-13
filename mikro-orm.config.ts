import { Migrator } from '@mikro-orm/migrations';
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
import {
  PostgreSqlDriver,
  ReflectMetadataProvider,
  defineConfig,
} from '@mikro-orm/postgresql';
import { config } from 'dotenv';

config();

// export default defineConfig({
//   entities: ['./dist/src/entities'],
//   entitiesTs: ['./src/entities'],
//   baseDir: process.cwd(),
//   dbName: process.env.DATABASE_NAME,
//   host: process.env.DATABASE_HOST,
//   port: parseInt(process.env.DATABASE_PORT),
//   user: process.env.DATABASE_USERNAME,
//   password: process.env.DATABASE_PASSWORD,
//   driver: PostgreSqlDriver,
//   metadataProvider: ReflectMetadataProvider,
//   migrations: {
//     path: './dist/src/migrations',
//     pathTs: './src/migrations',
//     glob: '!(*.d).{js,ts}',
//   },
//   extensions: [Migrator],
// });

const ormConfig: MikroOrmModuleSyncOptions = {
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
  extensions: [Migrator],
};

export default ormConfig;
