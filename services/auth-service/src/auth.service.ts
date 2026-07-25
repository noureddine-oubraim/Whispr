import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    // Injection du repository User → permet de faire des requêtes SQL sur la table users
    @InjectRepository(User)
    private userRepository: Repository<User>,

    // Injection du service JWT → pour générer et vérifier les tokens
    private jwtService: JwtService,

    // Injection de Redis → pour stocker les refresh tokens
    @InjectRedis() private redis: Redis,
  ) {}

  // ─── REGISTER ───────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // Vérifie si un user avec le même email ou username existe déjà
    const exists = await this.userRepository.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });

    // Si oui → on lance une erreur 409 Conflict
    if (exists) throw new ConflictException('Email ou username déjà utilisé');

    // Hash le mot de passe avant de le stocker (jamais stocker en clair)
    // 10 = nombre de "rounds" de hashage (plus c'est élevé, plus c'est sécurisé mais lent)
    const password_hash = await bcrypt.hash(dto.password, 10);

    // Crée l'objet user en mémoire (pas encore en base)
    const user = this.userRepository.create({ ...dto, password_hash });

    // Sauvegarde en base PostgreSQL
    await this.userRepository.save(user);

    return { message: 'Compte créé avec succès' };
  }

  // ─── LOGIN ──────────────────────────────────────────────────
  async login(dto: LoginDto) {
  // Cherche le user par email OU par username selon ce qui est fourni
  const user = await this.userRepository.findOne({
    where: dto.email
      ? { email: dto.email }       // Login par email
      : { username: dto.username }, // Login par username
  });

  // Si pas trouvé → erreur 401
  if (!user) throw new UnauthorizedException('Identifiants invalides');

  // Compare le mot de passe avec le hash stocké
  const valid = await bcrypt.compare(dto.password, user.password_hash);
  if (!valid) throw new UnauthorizedException('Identifiants invalides');

  return this.generateTokens(user);
}

  // ─── REFRESH ────────────────────────────────────────────────
  async refresh(refreshToken: string) {
    // Vérifie que le refresh token existe dans Redis
    // Redis stocke: clé = "refresh:{token}" → valeur = userId
    const stored = await this.redis.get(`refresh:${refreshToken}`);

    // Si pas trouvé (expiré ou logout) → erreur 401
    if (!stored) throw new UnauthorizedException('Refresh token invalide');

    // Récupère le user correspondant depuis PostgreSQL
    const user = await this.userRepository.findOne({ where: { id: stored } });
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');

    // Génère de nouveaux tokens (rotation des tokens)
    return this.generateTokens(user);
  }

  // ─── LOGOUT ─────────────────────────────────────────────────
  async logout(refreshToken: string) {
    // Supprime le refresh token de Redis
    // → même si quelqu'un a le token, il ne pourra plus l'utiliser
    await this.redis.del(`refresh:${refreshToken}`);

    return { message: 'Déconnecté avec succès' };
  }

  // ─── GENERATE TOKENS (méthode privée) ───────────────────────
  private async generateTokens(user: User) {
    // Payload = données encodées dans le JWT (visibles si décodé, donc pas de mot de passe)
    const payload = { sub: user.id, email: user.email, username: user.username };

    // Access token → expire dans 15 minutes (court pour la sécurité)
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Refresh token → expire dans 7 jours (long pour le confort)
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Stocke le refresh token dans Redis avec expiration automatique de 7 jours
    // setex(clé, durée_en_secondes, valeur)
    await this.redis.setex(`refresh:${refreshToken}`, 7 * 24 * 60 * 60, user.id);

    // Retourne les tokens + infos basiques du user (sans password_hash)
    return { accessToken, refreshToken, user: { id: user.id, username: user.username, email: user.email } };
  }
}