import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  //3xA
  let dto = new CreateUserDto();
  beforeAll(() => {
    //Arrange
    dto = new CreateUserDto();
    dto.email = 'test@test.com';
    dto.name = 'Piotr';
    dto.password = 'Admin@123';
  });
  it('should validate complete valid data', async () => {
    //Action
    const errors = await validate(dto);

    //Assert
    expect(errors.length).toBe(0);
  });
  it('should fail on invalid email', async () => {
    //Arrange
    dto.email = 'test';
    //Action
    const errors = await validate(dto);
    //Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });
  it('name should not be empty', async () => {
    //Arrange
    dto.email = 'test@test.com';
    dto.name = '';
    //Action
    const errors = await validate(dto);
    //Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  {
    /*
		atleast one uppercase
		one number
		one special character
		*/
  }
  const testPassword = async (password: string, message: string) => {
    dto.password = password;
    //dto.name = 'helllo';
    const errors = await validate(dto);
    const passwordError = errors.find((error) => error.property == 'password');
    expect(passwordError).not.toBeUndefined();
    const messages = Object.values(passwordError?.constraints ?? {});
    expect(messages).toContain(message);
  };
  it('should fail without 1 uppercase letter', async () => {
    await testPassword(
      'abcdef',
      'Password must contain atleast one uppercase letter',
    );
  });
  it('should fail without atleast 1 number', async () => {
    await testPassword('abcdefA', 'Password must contain atleast one number');
  });
  it('should fail without atleast 1 special character', async () => {
    await testPassword(
      'abcdefA1',
      'Password must contain atleast one special character',
    );
  });
});
