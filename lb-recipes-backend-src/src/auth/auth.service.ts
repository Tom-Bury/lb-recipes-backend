import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configs } from 'src/config/interfaces/config.interface';
import { JwtService } from '@nestjs/jwt';
import { TUser } from './local.strategy';

export interface TJwtPayload {
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<Configs, true>,
    private readonly jwtService: JwtService,
  ) {}

  validatePassword(password: string): boolean {
    return password === this.configService.get('adminPassword');
  }

  login(user: TUser) {
    const payload: TJwtPayload = { username: user.userName };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
