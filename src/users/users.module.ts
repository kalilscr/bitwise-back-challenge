import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { KeyvModule } from '../cache/cache.module';
import { CacheService } from '../cache/cache.service';
import { UserEntity } from '../entities/users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity]), KeyvModule],
  controllers: [UsersController],
  providers: [UsersService, CacheService],
})
export class UsersModule {}
