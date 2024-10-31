import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserRequestDTO } from './users.dto';
import { USERS_EXCEPTIONS_MESSAGES } from './users.exception-message';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UserEntity } from '../entities/users.entity';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: EntityRepository<UserEntity>,
  ) {}

  async createUser(user: CreateUserRequestDTO): Promise<void> {
    const userExists = await this.usersRepository.findOne([
      { email: user.email },
      { userName: user.userName },
    ]);

    if (userExists) {
      throw new ConflictException(USERS_EXCEPTIONS_MESSAGES.ALREADY_EXISTS);
    }
  }
}
