import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Wallet } from '@prisma/client';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

interface JwtDto {
  walletId: string;
  sub: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: (req: Request) => req?.cookies?.accessToken,
      ignoreExpiration: false,
      secretOrKey: 'napridbili',
    });
  }

  async validate(payload: JwtDto): Promise<Wallet> {
    const wallet = await this.authService.validateWallet(payload.walletId);
    if (!wallet) {
      throw new UnauthorizedException();
    }

    return wallet;
  }
}
