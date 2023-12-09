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
      find: jest.fn(),
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

  it('Should call usersRepository', async () => {
    const pagination: Partial<Pagination> = { skip: 0, limit: 10 };

    await service.findAll(pagination);

    expect(mockUserRepository.find).toHaveBeenCalled();
    expect(mockUserRepository.find).toHaveBeenCalledWith({
      skip: pagination.skip,
      take: pagination.limit,
    });
  });
});
