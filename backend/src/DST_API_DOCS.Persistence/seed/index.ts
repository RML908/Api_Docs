import { getDatabaseContext } from '../context/DatabaseContext';
import { usersTable, groupsTable, endpointsTable } from '../schema';
import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../../DST_API_DOCS.Domain/constants/DomainConstants';

async function seed() {
  const db = getDatabaseContext();
  console.log('Seeding database...');

  // Admin user
  const passwordHash = await bcrypt.hash('Admin@12345', BCRYPT_SALT_ROUNDS);
  const [admin] = await db
    .insert(usersTable)
    .values({
      username: 'admin',
      email: 'admin@dst-api-docs.local',
      passwordHash,
      role: 'admin',
    })
    .onConflictDoNothing()
    .returning();

  if (!admin) {
    console.log('Admin user already exists, skipping seed');
    return;
  }

  // Seed groups
  const [group1] = await db
    .insert(groupsTable)
    .values({ name: 'Authentication', description: 'Auth endpoints', icon: '🔐', sortOrder: 0, isDeleted: false, deletedAt: null, createdBy: admin.id, updatedBy: null })
    .returning();

  const [group2] = await db
    .insert(groupsTable)
    .values({ name: 'Users', description: 'User management', icon: '👤', sortOrder: 1, isDeleted: false, deletedAt: null, createdBy: admin.id, updatedBy: null })
    .returning();

  // Seed endpoints
  await db.insert(endpointsTable).values([
    {
      groupId: group1!.id,
      method: 'POST',
      path: '/api/v1/auth/login',
      summary: 'Login',
      description: 'Authenticate with username and password to receive JWT tokens',
      status: 'published',
      version: 'v1',
      responseStatus: 200,
      sortOrder: 0,
      isDeleted: false,
      deletedAt: null,
      createdBy: admin.id,
      updatedBy: null,
    },
    {
      groupId: group1!.id,
      method: 'POST',
      path: '/api/v1/auth/refresh',
      summary: 'Refresh Token',
      description: 'Exchange a refresh token for new access/refresh tokens',
      status: 'published',
      version: 'v1',
      responseStatus: 200,
      sortOrder: 1,
      isDeleted: false,
      deletedAt: null,
      createdBy: admin.id,
      updatedBy: null,
    },
    {
      groupId: group2!.id,
      method: 'GET',
      path: '/api/v1/auth/me',
      summary: 'Current User',
      description: 'Get the currently authenticated user profile',
      status: 'published',
      version: 'v1',
      responseStatus: 200,
      sortOrder: 0,
      isDeleted: false,
      deletedAt: null,
      createdBy: admin.id,
      updatedBy: null,
    },
  ]);

  console.log('Seed completed successfully');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
