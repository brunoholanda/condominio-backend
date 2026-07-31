import 'reflect-metadata';

import { hash } from 'bcryptjs';
import { config as loadEnvFile } from 'dotenv';

import { validateEnvironment } from '../../config/environment';
import { assertPasswordPolicy } from '../../modules/auth/domain/password-policy';
import { User } from '../../modules/auth/domain/entities/user';
import { UserOrmEntity } from '../../modules/auth/infrastructure/persistence/typeorm/entities/user.orm-entity';
import dataSource from '../data-source';

const SALT_ROUNDS = 10;

/**
 * Creates (or refreshes the password of) the account that can reach the
 * residents area. Idempotent: running it twice leaves the same single account.
 */
async function seedAdminUser(): Promise<void> {
  loadEnvFile();

  const env = validateEnvironment(process.env);
  const email = env.SEED_ADMIN_EMAIL.trim().toLowerCase();
  const password = assertPasswordPolicy(env.SEED_ADMIN_PASSWORD);

  await dataSource.initialize();

  try {
    const users = dataSource.getRepository(UserOrmEntity);
    const existing = await users.findOne({ where: { email } });
    const passwordHash = await hash(password, SALT_ROUNDS);

    const user = existing
      ? User.restore(existing).changePassword(passwordHash)
      : User.create({ name: env.SEED_ADMIN_NAME, email, passwordHash });

    const { createdAt: _createdAt, updatedAt: _updatedAt, ...row } = user.toSnapshot();

    await users.save(row);

    console.log(`Usuário administrador pronto: ${email} (${existing ? 'atualizado' : 'criado'})`);
  } finally {
    await dataSource.destroy();
  }
}

seedAdminUser().catch((error: unknown) => {
  console.error('Falha ao executar o seed do usuário administrador:', error);
  process.exitCode = 1;
});
