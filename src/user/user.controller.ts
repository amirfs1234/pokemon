import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { LOGIN_SUCCESSFUL, REGISTRATION_SUCCESSFUL } from 'src/constants';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async createUser(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const user = await this.userService.createUser(email, password);
    return { message: REGISTRATION_SUCCESSFUL };
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const user = await this.userService.login(email, password);
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    return { message: LOGIN_SUCCESSFUL }; 
  }
}
