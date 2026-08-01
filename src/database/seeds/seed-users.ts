import 'reflect-metadata';

import { hash } from 'bcryptjs';
import { config as loadEnvFile } from 'dotenv';
import type { Repository } from 'typeorm';

import type { SeedAccount } from '../../config/environment';
import { validateEnvironment } from '../../config/environment';
import { assertPasswordPolicy } from '../../modules/auth/domain/password-policy';
import { User } from '../../modules/auth/domain/entities/user';
import { UserOrmEntity } from '../../modules/auth/infrastructure/persistence/typeorm/entities/user.orm-entity';
import dataSource from '../data-source';

const SALT_ROUNDS = 10;

/** Creates the account or refreshes the password of whoever already exists. */
async function upsert(users: Repository<UserOrmEntity>, account: SeedAccount): Promise<void> {
  const email = account.email.trim().toLowerCase();
  const password = assertPasswordPolicy(account.password);

  const existing = await users.findOne({ where: { email } });
  const passwordHash = await hash(password, SALT_ROUNDS);

  const user = existing
    ? User.restore(existing).changePassword(passwordHash)
    : User.create({ name: account.name, email, passwordHash });

  const { createdAt: _createdAt, updatedAt: _updatedAt, ...row } = user.toSnapshot();

  await users.save(row);

  console.log(`Conta pronta: ${email} (${existing ? 'atualizada' : 'criada'})`);
}

/**
 * Gives every account listed in `SEED_ACCOUNTS` access to the residents area.
 * Idempotent: running it again only refreshes the passwords.
 */
async function seedUsers(): Promise<void> {
  loadEnvFile();

  const { SEED_ACCOUNTS: accounts } = validateEnvironment(process.env);

  if (accounts.length === 0) {
    throw new Error('Nenhuma conta em SEED_ACCOUNTS: preencha a variável antes de rodar o seed.');
  }

  await dataSource.initialize();

  try {
    const users = dataSource.getRepository(UserOrmEntity);

    for (const account of accounts) {
      await upsert(users, account);
    }
  } finally {
    await dataSource.destroy();
  }
}

seedUsers().catch((error: unknown) => {
  console.error('Falha ao executar o seed de usuários:', error);
  process.exitCode = 1;
});
