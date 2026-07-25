import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extrait le token depuis le header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'whispr_secret_key', // Même clé que dans app.module.ts
    });
  }

  // Appelé automatiquement après validation du token
  // Le payload = données décodées du JWT
  async validate(payload: any) {
    if (!payload) throw new UnauthorizedException();
    return { id: payload.sub, email: payload.email, username: payload.username };
  }
}