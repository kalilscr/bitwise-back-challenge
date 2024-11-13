import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserEntity } from '../entities/users.entity';
import {
  CreateUserFromGithubRequestDTO,
  CreateUserRequestDTO,
  UpdateUserRequestDTO as UpdateUserRequestDTO,
} from './users.dto';
import { Gender } from './users.enum';
import { USERS_EXCEPTION_MESSAGES } from './users.exception-message';
import {
  IGetUserResponse,
  IGithubUserInfo,
  IGithubUsernamesObject,
  IUser,
  IUserEntity,
} from './users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: EntityRepository<UserEntity>,
  ) {}

  public async createUser(user: CreateUserRequestDTO): Promise<void> {
    const usernameExists = await this.usersRepository.findOne({
      username: user.username,
    });

    const userEmailExists = await this.usersRepository.findOne({
      email: user.email,
    });

    if (usernameExists || userEmailExists) {
      throw new ConflictException(USERS_EXCEPTION_MESSAGES.ALREADY_EXISTS);
    }

    if (!user.gender) {
      user.gender = Gender.NOT_SPECIFIED;
    }
    const createdUser = this.usersRepository.create(user);
    await this.usersRepository.getEntityManager().persistAndFlush(createdUser);
  }

  public async createUserFromGithub(
    user: CreateUserFromGithubRequestDTO,
  ): Promise<void | string[]> {
    const userExists = await this.usersRepository.findOne({
      username: user.username,
    });

    if (userExists) {
      throw new ConflictException(USERS_EXCEPTION_MESSAGES.ALREADY_EXISTS);
    }

    const fetchedUser = await this.fetchGithubUserInfo(user.username);

    if (fetchedUser.status === '404') {
      const usernameSlice = await this.usernameSlice(user.username);

      const fetchedUsernames = await this.fetchGithubUsernames(usernameSlice);
      // todo: se o status de retorno não for 200 fazer o tratamento e retornar mensagem de sugestoes indisponiveis no momento.

      const suggestions =
        await this.mapUsernamesFromFetchedObject(fetchedUsernames);
      return suggestions;
    }
    const userFactory = await this.userFactory(fetchedUser);

    const createdUser = this.usersRepository.create(userFactory);
    await this.usersRepository.getEntityManager().persistAndFlush(createdUser);
  }

  public async fetchGithubUserInfo(username: string): Promise<IGithubUserInfo> {
    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    };
    try {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        method: 'GET',
        headers: headers,
      });

      return await response.json();
    } catch (err) {
      console.error('Error to fetch user:', err);
    }
  }

  public async fetchGithubUsernames(
    nameSlice: string,
  ): Promise<IGithubUsernamesObject> {
    const perPage = 10;
    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    };
    try {
      const response = await fetch(
        `https://api.github.com/search/users?q=${nameSlice}+in:login&per_page=${perPage}`,
        {
          method: 'GET',
          headers: headers,
        },
      );

      return await response.json();
    } catch (err) {
      console.error('Error to fetch users:', err);
    }
  }

  public async mapUsernamesFromFetchedObject(
    fetchedObject: IGithubUsernamesObject,
  ): Promise<string[]> {
    const mappedUsernames: string[] = fetchedObject.items.map(
      (item) => item.login,
    );

    return mappedUsernames;
  }

  public async usernameSlice(notFoundUsername: string): Promise<string> {
    const midpoint = Math.ceil(notFoundUsername.length / 2);
    const firstHalf = notFoundUsername.slice(0, midpoint);
    //const secondHalf = notFoundUsername.slice(midpoint);

    return firstHalf;
  }

  public async userFactory(data: IGithubUserInfo): Promise<IUser> {
    const user: IUser = {
      username: data.login,
      name: data.name,
      profileImageUrl: data.avatar_url,
      bio: data.bio,
      email: data.email,
      gender: Gender.NOT_SPECIFIED,
    };

    return user;
  }

  public async updateUser(
    user: UpdateUserRequestDTO,
    username: string,
  ): Promise<void> {
    const userExists = await this.usersRepository.findOne({
      username: username,
    });

    if (!userExists) {
      throw new NotFoundException(USERS_EXCEPTION_MESSAGES.NOT_FOUND);
    }

    const newUsernameExists = await this.usersRepository.findOne({
      username: user.username,
    });

    const userEmailExists = await this.usersRepository.findOne({
      email: user.email,
    });

    if (newUsernameExists || userEmailExists) {
      throw new ConflictException(USERS_EXCEPTION_MESSAGES.ALREADY_EXISTS);
    }

    await this.usersRepository.nativeUpdate({ username: username }, user);
  }

  public async getUser(username: string): Promise<IGetUserResponse> {
    const userExists = await this.usersRepository.findOne({
      username: username,
    });

    if (!userExists) {
      throw new NotFoundException(USERS_EXCEPTION_MESSAGES.NOT_FOUND);
    }

    const userInfo = await this.fetchGithubUserInfo(username);

    const user = await this.getUserResponseFactory(userExists, userInfo);

    return user;
  }

  public async getUserResponseFactory(
    user: IUserEntity,
    githubUserInfo: IGithubUserInfo,
  ) {
    const newUser: IGetUserResponse = {
      ...user,
      qtdFollowers: githubUserInfo.followers,
      qtdFollowing: githubUserInfo.following,
      qtdRepos: githubUserInfo.public_repos,
      publicUrl: githubUserInfo.html_url,
    };
    return newUser;
  }

  public async getUsersByName(
    keyword: string,
    limit: number,
    after: number,
  ): Promise<IUserEntity[]> {
    if (limit > 10) {
      throw new UnprocessableEntityException(
        USERS_EXCEPTION_MESSAGES.LIMIT_EXCEEDED,
      );
    }
    const users = await this.usersRepository
      .getEntityManager()
      .find(
        UserEntity,
        { name: { $ilike: `%${keyword}%` } },
        { orderBy: { id: 'desc' }, first: limit, offset: after },
      );

    return users;
  }
}
