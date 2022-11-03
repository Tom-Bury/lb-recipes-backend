import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configs } from './config/interfaces/config.interface';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { TUser } from './auth/local.strategy';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService<Configs, true>,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getRoot(): string {
    return `Running with version ${this.configService.get('version')}`;
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req: { user: TUser }) {
    console.info('Successful login');
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user: TUser }) {
    return req.user;
  }
}
