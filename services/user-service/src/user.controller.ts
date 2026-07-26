import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('users') // Toutes les routes commencent par /users
export class UserController {
  constructor(private userService: UserService) {}

  // GET /users/me — voir son propre profil
  // @UseGuards(JwtAuthGuard) → route protégée, token obligatoire
  // @CurrentUser() → extrait automatiquement le user du token (grâce au décorateur qu'on a créé)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    return this.userService.getMe(user.id);
  }

  // PUT /users/me — modifier son propre profil
  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.userService.updateMe(user.id, dto);
  }

  // GET /users/search?q=nour — chercher des users par username
  // @Query('q') → extrait le paramètre "q" depuis l'URL (?q=nour)
  @Get('search')
  @UseGuards(JwtAuthGuard)
  async search(@Query('q') query: string) {
    return this.userService.searchUsers(query);
  }

  // GET /users/:username — voir le profil public d'un user
  // @Param('username') → extrait le paramètre depuis l'URL (/users/nour.dev_01)
  @Get(':username')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('username') username: string) {
    return this.userService.getUserByUsername(username);
  }
}