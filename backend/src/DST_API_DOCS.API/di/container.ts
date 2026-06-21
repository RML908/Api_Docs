import { JwtService } from '../../DST_API_DOCS.Infrastructure/auth/JwtService';
import { PasswordService } from '../../DST_API_DOCS.Infrastructure/auth/PasswordService';
import { UserRepository } from '../../DST_API_DOCS.Persistence/repositories/UserRepository';
import { RefreshTokenRepository } from '../../DST_API_DOCS.Persistence/repositories/RefreshTokenRepository';
import { GroupRepository } from '../../DST_API_DOCS.Persistence/repositories/GroupRepository';
import { EndpointRepository } from '../../DST_API_DOCS.Persistence/repositories/EndpointRepository';
import { ChangelogRepository } from '../../DST_API_DOCS.Persistence/repositories/ChangelogRepository';
import { ApiKeyRepository } from '../../DST_API_DOCS.Persistence/repositories/ApiKeyRepository';
import { AuthService } from '../../DST_API_DOCS.Application/services/AuthService';
import { GroupService } from '../../DST_API_DOCS.Application/services/GroupService';
import { EndpointService } from '../../DST_API_DOCS.Application/services/EndpointService';
import { ChangelogService } from '../../DST_API_DOCS.Application/services/ChangelogService';
import { ApiKeyService } from '../../DST_API_DOCS.Application/services/ApiKeyService';
import { StatsService } from '../../DST_API_DOCS.Application/services/StatsService';

// Infrastructure
export const jwtService = new JwtService();
export const passwordService = new PasswordService();

// Repositories
export const userRepository = new UserRepository();
export const refreshTokenRepository = new RefreshTokenRepository();
export const groupRepository = new GroupRepository();
export const endpointRepository = new EndpointRepository();
export const changelogRepository = new ChangelogRepository();
export const apiKeyRepository = new ApiKeyRepository();

// Services
export const authService = new AuthService(userRepository, refreshTokenRepository, jwtService, passwordService);
export const groupService = new GroupService(groupRepository);
export const endpointService = new EndpointService(endpointRepository, groupRepository);
export const changelogService = new ChangelogService(changelogRepository);
export const apiKeyService = new ApiKeyService(apiKeyRepository);
export const statsService = new StatsService(endpointRepository);
