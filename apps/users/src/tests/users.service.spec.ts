import { Pagination } from '@deanrtaylor/getpagination-nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from '../entities/user.entity';
import { UsersService } from '../users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository;

  beforeEach(async () => {
    mockUserRepository = {
      find: jest.fn().mockReturnValue(Array.from({ length: 10 }, (i, _v) => i)),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
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

    expect(mockUserRepository.find).toHaveBeenCalled();
    expect(mockUserRepository.find).toHaveBeenCalledWith({
      skip: pagination.skip,
      take: pagination.limit,
    });
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
