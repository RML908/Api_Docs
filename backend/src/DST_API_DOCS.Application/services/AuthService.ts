import { createHash, randomBytes } from 'node:crypto';
import type { IUserRepository } from '../interfaces/repositories/IUserRepository';
import type { IRefreshTokenRepository } from '../interfaces/repositories/IRefreshTokenRepository';
import type { JwtService } from '../../DST_API_DOCS.Infrastructure/auth/JwtService';
import type { PasswordService } from '../../DST_API_DOCS.Infrastructure/auth/PasswordService';
import type { LoginDto, AuthTokensDto, UserProfileDto } from '../dtos/auth/AuthDtos';

export class AuthService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly refreshTokenRepo: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async login(dto: LoginDto, ip?: string): Promise<AuthTokensDto & { user: UserProfileDto }> {
    const user = await this.userRepo.findByUsername(dto.username);
    if (!user) throw new Error('Invalid credentials');

    const valid = await this.passwordService.verify(dto.password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    await this.userRepo.updateLastLogin(user.id);

    const accessToken = this.jwtService.generateAccessToken(user.id, user.role);
    const rawRefresh = randomBytes(48).toString('hex');
    const refreshHash = createHash('sha256').update(rawRefresh).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepo.create({
      userId: user.id,
      tokenHash: refreshHash,
      expiresAt,
      revokedAt: null,
      replacedByTokenHash: null,
      createdByIp: ip ?? null,
    });

    return {
      accessToken,
      refreshToken: rawRefresh,
      expiresIn: 15 * 60, // 15 minutes in seconds
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
  }

  async refresh(rawToken: string, ip?: string): Promise<AuthTokensDto> {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const stored = await this.refreshTokenRepo.findByHash(tokenHash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await this.userRepo.findById(stored.userId);
    if (!user) throw new Error('User not found');

    // Rotate token
    const newRaw = randomBytes(48).toString('hex');
    const newHash = createHash('sha256').update(newRaw).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepo.revoke(stored.id, newHash);
    await this.refreshTokenRepo.create({
      userId: user.id,
      tokenHash: newHash,
      expiresAt,
      revokedAt: null,
      replacedByTokenHash: null,
      createdByIp: ip ?? null,
    });

    const accessToken = this.jwtService.generateAccessToken(user.id, user.role);

    return { accessToken, refreshToken: newRaw, expiresIn: 15 * 60 };
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const stored = await this.refreshTokenRepo.findByHash(tokenHash);
    if (stored) await this.refreshTokenRepo.revoke(stored.id);
  }

  async logoutAll(userId: number): Promise<void> {
    await this.refreshTokenRepo.revokeAllForUser(userId);
  }
}
