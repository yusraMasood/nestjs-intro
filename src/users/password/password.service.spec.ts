import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash password', async () => {
    const mockHash = 'hashed_password';
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);
    const password = 'password123';
    const result = await service.hash(password);
    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(result).toBe(mockHash);
  });

  const testVerifyPassword = async (value) => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(value);
    const result = await service.verify('password', 'hashedPassword');
    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    expect(result).toBe(value);
  };

  it('should correctly verify password', () => {
    {
      /*
			mock bcrypt.compare
			mock the resolved value 
			call the service method -hash
			bcrypt.compare - was called with specific arguments 
			we verify if the service method returned what bcrypt.compare did
			
			*/
    }
    testVerifyPassword(true);
  });
  it('should fail on incorrect password', () => {
    testVerifyPassword(false);
  });
});
