import { dataSourceMockFactory } from '@app/common/utils/mock-datasource';
import { Pagination } from '@deanrtaylor/getpagination-nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Role } from '../entities/roles.entity';
import { UserRole } from '../entities/user-roles.entity';
import { User } from '../entities/user.entity';
import { UsersService } from '../users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository;
  let mockUserRolesRepository;
  let mockRolesRepository;

  beforeEach(async () => {
    mockUserRepository = {
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest
          .fn()
          .mockResolvedValue(Array.from({ length: 10 }, (i, _v) => i)),
      })),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    mockUserRolesRepository = {};
    mockRolesRepository = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: mockUserRolesRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRolesRepository,
        },
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('#findAll should call usersRepository', async () => {
    const pagination: Partial<Pagination> = { skip: 0, limit: 20 };

    await service.findAll(pagination);

    expect(mockUserRepository.createQueryBuilder).toHaveBeenCalled();
  });

  it('#findAll should return an array', async () => {
    const pagination: Partial<Pagination> = { skip: 0, limit: 10 };

    const users = await service.findAll(pagination);

    expect(users.length).toBeGreaterThan(1);
  });

  it('#findAll should paginate results', async () => {
    const limit = 10;
    const pagination: Partial<Pagination> = { skip: 0, limit };

    const users = await service.findAll(pagination);

    expect(users.length).toBe(limit);
  });
});
