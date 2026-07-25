import { Controller, Post, Get, Body, HttpCode, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth') // Toutes les routes commencent par /auth
export class AuthController {

  constructor(private authService: AuthService) {}

  // POST /auth/register
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /auth/login
  @Post('login')
  @HttpCode(200) // Par défaut NestJS retourne 201 pour POST, on force 200 pour login
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // POST /auth/refresh
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    // @Body('refreshToken') → extrait uniquement le champ refreshToken du body
    return this.authService.refresh(refreshToken);
  }

  // POST /auth/logout
  @Post('logout')
  @HttpCode(200)
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  // GET /auth/me — route protégée, nécessite un token valide
@Get('me')
@UseGuards(JwtAuthGuard)
async me(@Request() req) {
  // req.user est injecté automatiquement par JwtStrategy.validate()
  return req.user;
}
}