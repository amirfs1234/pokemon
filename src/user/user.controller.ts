import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async createUser(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const user = await this.userService.createUser(email, password);
    return { message: 'Registration successful', userId: user.id };
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
    return { message: 'Login successful', user }; 
  }
}
