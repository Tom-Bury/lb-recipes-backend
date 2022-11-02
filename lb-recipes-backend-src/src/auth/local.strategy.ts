import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

export interface TUser {
  userName: string;
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'password',
      passwordField: 'password',
    });
  }

  validate(password: string): TUser {
    const authenticated = this.authService.validatePassword(password);
    if (!authenticated) {
      throw new UnauthorizedException();
    } else {
      return { userName: 'Liesbury' };
    }
  }
}
