import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequestDTO } from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  public async createUser(@Body() user: CreateUserRequestDTO): Promise<void> {
    await this.usersService.createUser(user);
  }
}
