import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CreateUserFromGithubRequestDTO,
  CreateUserRequestDTO,
  UpdateUserRequestDTO,
} from './users.dto';
import { IGetUserResponse, IUserEntity } from './users.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  public async createUser(@Body() user: CreateUserRequestDTO): Promise<void> {
    await this.usersService.createUser(user);
  }

  @Post('create-from-github')
  public async createUserFromGithub(
    @Body() user: CreateUserFromGithubRequestDTO,
  ): Promise<void | string[]> {
    return await this.usersService.createUserFromGithub(user);
  }

  @Patch('update/:username')
  public async updateUser(
    @Body() user: UpdateUserRequestDTO,
    @Param('username') username: string,
  ): Promise<void> {
    await this.usersService.updateUser(user, username);
  }

  @Get('search/:username')
  public async getUser(
    @Param('username') username: string,
  ): Promise<IGetUserResponse> {
    return await this.usersService.getUser(username);
  }

  @Get('search')
  public async getUsersByName(
    @Query('keyword') keyword: string,
    @Query('limit') limit: string,
    @Query('after') after: string,
  ): Promise<IUserEntity[]> {
    return await this.usersService.getUsersByName(
      keyword,
      parseInt(limit),
      parseInt(after),
    );
  }
}
