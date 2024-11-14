import { EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CacheService } from '../../cache/cache.service';
import { UserEntity } from '../../entities/users.entity';
import {
  CreateUserFromGithubRequestDTO,
  CreateUserRequestDTO,
  UpdateUserRequestDTO,
} from '../users.dto';
import { Gender } from '../users.enum';
import {
  IGithubUserInfo,
  IGithubUsernamesItems,
  IGithubUsernamesObject,
  IUserEntity,
} from '../users.interface';
import { UsersService } from '../users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: EntityRepository<UserEntity>;

  const mockGithubUserInfo: IGithubUserInfo = {
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    email: 'test@example.com',
    followers: 100,
    following: 50,
    public_repos: 30,
    html_url: 'https://github.com/testuser',
    status: '200',
  } as unknown as IGithubUserInfo;

  const mockGithubUsernamesObject: IGithubUsernamesObject = {
    items: [
      { login: 'test1' },
      { login: 'test2' },
    ] as unknown as IGithubUsernamesItems[],
    total_count: 2,
  } as unknown as IGithubUsernamesObject;

  const mockCacheService = {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: vi.fn(),
            create: vi.fn(),
            nativeUpdate: vi.fn(),
            getEntityManager: vi
              .fn()
              .mockReturnValue({ persistAndFlush: vi.fn(), find: vi.fn() }),
          },
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<EntityRepository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });
  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserRequestDto: CreateUserRequestDTO = {
        username: 'testuser',
        email: 'test@example.com',
        name: 'test',
        lastName: 'test',
        bio: '',
        profileImageUrl: '',
        gender: Gender.MALE,
      };

      vi.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);
      vi.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);
      vi.spyOn(usersRepository, 'create').mockReturnValueOnce({
        id: 1,
      } as unknown as UserEntity);

      const persistAndFlushSpy =
        (usersRepository.getEntityManager().persistAndFlush = vi
          .fn()
          .mockResolvedValue({}));

      await usersService.createUser(createUserRequestDto);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(2);
      expect(usersRepository.findOne).toHaveBeenNthCalledWith(1, {
        username: createUserRequestDto.username,
      });
      expect(usersRepository.findOne).toHaveBeenNthCalledWith(2, {
        email: createUserRequestDto.email,
      });
      expect(usersRepository.create).toHaveBeenCalledWith(createUserRequestDto);
      expect(persistAndFlushSpy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw ConflictException if username or email already exists', async () => {
      const createUserRequestDto: CreateUserRequestDTO = {
        username: 'testuser',
        email: 'test@example.com',
        name: 'test',
        lastName: 'test',
        bio: '',
        profileImageUrl: '',
        gender: Gender.MALE,
      };

      vi.spyOn(usersRepository, 'findOne').mockResolvedValueOnce({
        id: 1,
      } as unknown as UserEntity);
      vi.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        usersService.createUser(createUserRequestDto),
      ).rejects.toThrow(ConflictException);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(2);
      expect(usersRepository.findOne).toHaveBeenNthCalledWith(1, {
        username: createUserRequestDto.username,
      });
      expect(usersRepository.findOne).toHaveBeenNthCalledWith(2, {
        email: createUserRequestDto.email,
      });
    });

    it('should set gender to NOT_SPECIFIED if not provided', async () => {
      const createUserRequestDto: CreateUserRequestDTO = {
        username: 'testuser',
        email: 'test@example.com',
        name: 'test',
        lastName: 'test',
        bio: 'test',
        profileImageUrl: '',
      };

      vi.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);
      vi.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);
      vi.spyOn(usersRepository, 'create').mockReturnValueOnce({
        id: 1,
        gender: Gender.NOT_SPECIFIED,
      } as unknown as UserEntity);

      const persistAndFlushSpy =
        (usersRepository.getEntityManager().persistAndFlush = vi
          .fn()
          .mockResolvedValueOnce(undefined));

      await usersService.createUser(createUserRequestDto);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(2);
      expect(usersRepository.create).toHaveBeenCalledWith({
        ...createUserRequestDto,
        gender: Gender.NOT_SPECIFIED,
      });
      expect(persistAndFlushSpy).toHaveBeenCalledWith({
        id: 1,
        gender: Gender.NOT_SPECIFIED,
      });
    });
  });
  describe('createUserFromGithub', () => {
    it('should create a new user from Github', async () => {
      const createUserDto: CreateUserFromGithubRequestDTO = {
        username: 'testuser',
      };

      vi.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);
      vi.spyOn(usersService, 'fetchGithubUserInfo').mockResolvedValueOnce(
        mockGithubUserInfo,
      );
      vi.spyOn(usersRepository, 'create').mockReturnValueOnce({
        id: 1,
      } as unknown as UserEntity);

      const persistAndFlushSpy =
        (usersRepository.getEntityManager().persistAndFlush = vi
          .fn()
          .mockResolvedValue(undefined));

      await usersService.createUserFromGithub(createUserDto);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        username: createUserDto.username,
      });
      expect(usersRepository.create).toHaveBeenCalled();
      expect(persistAndFlushSpy).toHaveBeenCalled();
    });

    it('should return username suggestions when Github user not found', async () => {
      const createUserDto: CreateUserFromGithubRequestDTO = {
        username: 'nonexistent',
      };

      const notFoundGithubInfo = { ...mockGithubUserInfo, status: '404' };

      vi.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);
      vi.spyOn(usersService, 'fetchGithubUserInfo').mockResolvedValueOnce(
        notFoundGithubInfo,
      );
      vi.spyOn(usersService, 'fetchGithubUsernames').mockResolvedValueOnce(
        mockGithubUsernamesObject,
      );

      const suggestions =
        await usersService.createUserFromGithub(createUserDto);

      expect(suggestions).toEqual(['test1', 'test2']);
    });

    it('should throw ConflictException if username already exists', async () => {
      const createUserDto: CreateUserFromGithubRequestDTO = {
        username: 'testuser',
      };

      vi.spyOn(usersRepository, 'findOne').mockResolvedValueOnce({
        id: 1,
      } as unknown as UserEntity);

      await expect(
        usersService.createUserFromGithub(createUserDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateUserDto: UpdateUserRequestDTO = {
        username: 'newusername',
        email: 'newemail@example.com',
      } as unknown as UpdateUserRequestDTO;

      vi.spyOn(usersRepository, 'findOne')
        .mockResolvedValueOnce({ id: 1 } as unknown as UserEntity) // existing user
        .mockResolvedValueOnce(null) // new username check
        .mockResolvedValueOnce(null); // email check

      await usersService.updateUser(updateUserDto, 'oldusername');

      expect(usersRepository.nativeUpdate).toHaveBeenCalledWith(
        { username: 'oldusername' },
        updateUserDto,
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const updateUserDto: UpdateUserRequestDTO = {
        username: 'newusername',
      } as unknown as UpdateUserRequestDTO;

      vi.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        usersService.updateUser(updateUserDto, 'oldusername'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUser', () => {
    it('should return user with Github info', async () => {
      const mockUser: IUserEntity = {
        id: 1 as unknown as bigint,
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        gender: Gender.NOT_SPECIFIED,
      } as unknown as IUserEntity;

      vi.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(mockUser);
      vi.spyOn(usersService, 'fetchGithubUserInfo').mockResolvedValueOnce(
        mockGithubUserInfo,
      );

      const result = await usersService.getUser('testuser');

      expect(result).toMatchObject({
        ...mockUser,
        qtdFollowers: mockGithubUserInfo.followers,
        qtdFollowing: mockGithubUserInfo.following,
        qtdRepos: mockGithubUserInfo.public_repos,
        publicUrl: mockGithubUserInfo.html_url,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      vi.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(usersService.getUser('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUsersByName', () => {
    it('should return users filtered by name', async () => {
      const mockUsers: IUserEntity[] = [
        {
          id: 1 as unknown as bigint,
          username: 'user1',
          name: 'Test User 1',
          email: 'test1@example.com',
          gender: Gender.NOT_SPECIFIED,
        },
        {
          id: 2 as unknown as bigint,
          username: 'user2',
          name: 'Test User 2',
          email: 'test2@example.com',
          gender: Gender.NOT_SPECIFIED,
        },
        ,
      ] as unknown as IUserEntity[];

      const findSpy = (usersRepository.getEntityManager().find = vi
        .fn()
        .mockResolvedValueOnce(mockUsers));

      const result = await usersService.getUsersByName('Test', 2, 0);

      expect(result).toEqual(mockUsers);
      expect(findSpy).toHaveBeenCalledWith(
        UserEntity,
        { name: { $ilike: '%Test%' } },
        { orderBy: { id: 'desc' }, first: 2, offset: 0 },
      );
    });

    it('should throw UnprocessableEntityException if limit exceeds 10', async () => {
      await expect(usersService.getUsersByName('Test', 11, 0)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('helper methods', () => {
    it('should slice username correctly', async () => {
      const result = await usersService.usernameSlice('testuser');
      expect(result).toBe('test');
    });

    it('should create user factory correctly', async () => {
      const result = await usersService.userFactory(mockGithubUserInfo);
      expect(result).toEqual({
        username: mockGithubUserInfo.login,
        name: mockGithubUserInfo.name,
        profileImageUrl: mockGithubUserInfo.avatar_url,
        bio: mockGithubUserInfo.bio,
        email: mockGithubUserInfo.email,
        gender: Gender.NOT_SPECIFIED,
      });
    });

    it('should map usernames from fetched object correctly', async () => {
      const result = await usersService.mapUsernamesFromFetchedObject(
        mockGithubUsernamesObject,
      );
      expect(result).toEqual(['test1', 'test2']);
    });
  });
});
