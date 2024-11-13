import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  PostgreSqlDriver,
  ReflectMetadataProvider,
} from '@mikro-orm/postgresql';
import {
  ConflictException,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { UserEntity } from '../src/entities/users.entity';
import { UsersController } from '../src/users/users.controller';
import {
  CreateUserFromGithubRequestDTO,
  CreateUserRequestDTO,
  UpdateUserRequestDTO,
} from '../src/users/users.dto';
import { USERS_EXCEPTION_MESSAGES } from '../src/users/users.exception-message';
import { UsersModule } from '../src/users/users.module';
import { UsersService } from '../src/users/users.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  //let controller: UsersController;
  //let usersService: UsersService;

  const mockUsersService = {
    createUser: vi.fn(),
    createUserFromGithub: vi.fn(),
    updateUser: vi.fn(),
    getUser: vi.fn(),
    getUsersByName: vi.fn(),
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MikroOrmModule.forRoot({
          entities: [UserEntity],
          entitiesTs: [UserEntity],
          dbName: process.env.DATABASE_NAME,
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT),
          user: process.env.DATABASE_USERNAME,
          password: process.env.DATABASE_PASSWORD,
          driver: PostgreSqlDriver,
          metadataProvider: ReflectMetadataProvider,
        }),
      ],
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    // app.enableCors({ origin: '*' });
    app.useGlobalPipes(new ValidationPipe());
    //app.enableShutdownHooks();
    //controller = moduleFixture.get<UsersController>(UsersController);
    //usersService = moduleFixture.get<UsersService>(UsersService);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /users/create', () => {
    const createUserDto: CreateUserRequestDTO = {
      username: 'testuser',
      name: 'nametestuser',
      email: 'test@example.com',
    };

    it('should create a new user', async () => {
      await request(await app.getHttpServer())
        .post('/users/create')
        .send(createUserDto)
        .expect(201);

      expect(mockUsersService.createUser).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle validation errors', async () => {
      const invalidUser = {
        username: '',
        email: 'invalid-email',
      };

      await request(app.getHttpServer())
        .post('/users/create')
        .send(invalidUser)
        .expect(400);
    });
  });

  describe('POST /users/create-from-github', () => {
    const githubUserDto: CreateUserFromGithubRequestDTO = {
      username: 'githubUsername',
    };

    it('should create a user from GitHub', async () => {
      mockUsersService.createUserFromGithub.mockResolvedValueOnce(undefined);

      await request(app.getHttpServer())
        .post('/users/create-from-github')
        .send(githubUserDto)
        .expect(201);

      expect(mockUsersService.createUserFromGithub).toHaveBeenCalledWith(
        githubUserDto,
      );
    });

    it('should handle create from GitHub validation errors', async () => {
      mockUsersService.createUserFromGithub.mockRejectedValueOnce(
        new ConflictException(USERS_EXCEPTION_MESSAGES.ALREADY_EXISTS),
      );

      await request(app.getHttpServer())
        .post('/users/create-from-github')
        .send(githubUserDto)
        .expect(409)
        .expect((response) => {
          expect(response.body).toEqual({
            error: 'Conflict',
            message: USERS_EXCEPTION_MESSAGES.ALREADY_EXISTS,
            statusCode: 409,
          });
        });
    });
  });

  describe('PATCH /users/update/:username', () => {
    const username = 'testuser';
    const updateUserDto: UpdateUserRequestDTO = {
      email: 'updated@example.com',
    } as unknown as UpdateUserRequestDTO;

    it('should update a user', async () => {
      mockUsersService.updateUser.mockResolvedValueOnce(undefined);

      await request(app.getHttpServer())
        .patch(`/users/update/${username}`)
        .send(updateUserDto)
        .expect(200);

      expect(mockUsersService.updateUser).toHaveBeenCalledWith(
        updateUserDto,
        username,
      );
    });
  });

  describe('GET /users/search/:username', () => {
    const username = 'testuser';
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    };

    it('should get a user by username', async () => {
      mockUsersService.getUser.mockResolvedValueOnce(mockUser);

      await request(app.getHttpServer())
        .get(`/users/search/${username}`)
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual(mockUser);
        });

      expect(mockUsersService.getUser).toHaveBeenCalledWith(username);
    });

    it('should handle user not found', async () => {
      mockUsersService.getUser.mockRejectedValueOnce(
        new NotFoundException(USERS_EXCEPTION_MESSAGES.NOT_FOUND),
      );

      await request(app.getHttpServer())
        .get(`/users/search/${username}`)
        .expect(404);
    });
  });

  describe('GET /users/search', () => {
    const searchParams = {
      keyword: 'test',
      limit: '10',
      after: '0',
    };

    const mockUsers = [
      { id: 1, username: 'testuser1', email: 'test1@example.com' },
      { id: 2, username: 'testuser2', email: 'test2@example.com' },
    ];

    it('should search users by name with pagination', async () => {
      mockUsersService.getUsersByName.mockResolvedValueOnce(mockUsers);

      await request(app.getHttpServer())
        .get('/users/search')
        .query(searchParams)
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual(mockUsers);
        });

      expect(mockUsersService.getUsersByName).toHaveBeenCalledWith(
        searchParams.keyword,
        parseInt(searchParams.limit),
        parseInt(searchParams.after),
      );
    });

    it('should return empty array if missing query parameters', async () => {
      mockUsersService.getUsersByName.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer())
        .get('/users/search')
        .expect(200);
      expect(response.body).toEqual([]);
    });
  });
});
