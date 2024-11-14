import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import ormConfig from '../mikro-orm.config';
import { KeyvModule } from './cache/cache.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(ormConfig),
    UsersModule,
    KeyvModule,
  ],
})
export class AppModule {}
