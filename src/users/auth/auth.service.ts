import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../create-user.dto';
import { User } from '../user.entity';
import { PasswordService } from '../password/password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtToken: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  public async register(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userService.findOneByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const user = await this.userService.create(createUserDto);

    //return token/user with token/ only user

    return user;
  }
  public async login(email: string, password: string): Promise<string> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    if (!(await this.passwordService.verify(password, user.password))) {
      throw new UnauthorizedException('Invalid Password');
    }
    return this.generateToken(user);
  }
  private async generateToken(user: User): Promise<string> {
    const payload = { sub: user?.id, name: user?.name };
    return await this.jwtToken.signAsync(payload);
  }
}

{
  /*
	
	1. User Registeration
	 -Make sure User doesnt exist yet
	  -store the user
		-(optional) generate the token 
	2. Generating token
	*/
}
