import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { INVALID_CREDENTIALS } from 'src/constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    return this.authService.login(user);
  }
}
