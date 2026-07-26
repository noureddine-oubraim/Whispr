import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    // Injection du repository → permet de faire des requêtes sur la table users
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ─── GET MY PROFILE ─────────────────────────────────────────
  async getMe(userId: string) {
    // Cherche le user par son id (extrait du JWT)
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Si pas trouvé → erreur 404
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Retourne le profil sans le password_hash
    const { password_hash, ...profile } = user;
    return profile;
  }

  // ─── UPDATE MY PROFILE ──────────────────────────────────────
  async updateMe(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Si l'user veut changer son username → vérifie qu'il est disponible
    if (dto.username && dto.username !== user.username) {
      const exists = await this.userRepository.findOne({
        where: { username: dto.username },
      });
      // Si le username est déjà pris par quelqu'un d'autre → erreur 409
      if (exists) throw new ConflictException('Username déjà utilisé');
    }

    // Object.assign → copie les champs du DTO dans l'objet user
    // Seulement les champs envoyés sont modifiés, les autres restent intacts
    Object.assign(user, dto);
    await this.userRepository.save(user);

    // Retourne le profil mis à jour sans le password_hash
    const { password_hash, ...profile } = user;
    return profile;
  }

  // ─── GET USER BY USERNAME ────────────────────────────────────
  async getUserByUsername(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Retourne uniquement les infos publiques (pas le password, pas l'email)
    return {
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    };
  }

  // ─── SEARCH USERS ───────────────────────────────────────────
  async searchUsers(query: string) {
    // Like(`%${query}%`) → cherche les users dont le username CONTIENT le query
    // Exemple: query = "nour" → trouve "nour.dev", "noureddine", "anour"
    const users = await this.userRepository.find({
      where: { username: Like(`%${query}%`) },
      // Limite à 10 résultats pour ne pas surcharger
      take: 10,
    });

    // Retourne uniquement les infos publiques pour chaque user trouvé
    return users.map(({ id, username, avatar_url }) => ({
      id,
      username,
      avatar_url,
    }));
  }
}