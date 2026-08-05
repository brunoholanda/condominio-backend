import 'reflect-metadata';

import { hash } from 'bcryptjs';
import { config as loadEnvFile } from 'dotenv';
import type { Repository } from 'typeorm';

import type { SeedAccount } from '../../config/environment';
import { validateEnvironment } from '../../config/environment';
import { assertPasswordPolicy } from '../../modules/auth/domain/password-policy';
import { User } from '../../modules/auth/domain/entities/user';
import { PlatformRole } from '../../modules/auth/domain/enums/platform-role';
import { SubscriptionPlan } from '../../modules/auth/domain/enums/subscription-plan';
import { SubscriptionStatus } from '../../modules/auth/domain/enums/subscription-status';
import { UserOrmEntity } from '../../modules/auth/infrastructure/persistence/typeorm/entities/user.orm-entity';
import { Condominium } from '../../modules/condominiums/domain/entities/condominium';
import { Membership } from '../../modules/condominiums/domain/entities/membership';
import { MembershipRole } from '../../modules/condominiums/domain/enums/membership-role';
import { MembershipOrmEntity } from '../../modules/condominiums/infrastructure/persistence/typeorm/entities/membership.orm-entity';
import { TypeormCondominiumRepository } from '../../modules/condominiums/infrastructure/persistence/typeorm/typeorm-condominium.repository';
import { TypeormMembershipRepository } from '../../modules/condominiums/infrastructure/persistence/typeorm/typeorm-membership.repository';
import { buildPortoImperialUnits } from '../../modules/residents/domain/value-objects/unit';
import { MemoryCacheStore } from '../../shared/infrastructure/cache/memory-cache.store';
import dataSource from '../data-source';

const SALT_ROUNDS = 10;
const PORTO_IMPERIAL_SLUG = 'porto-imperial';
const PORTO_IMPERIAL_NAME = 'Condomínio Porto Imperial';

/**
 * Contas bootstrap fixas do seed (produção e desenvolvimento).
 *
 * - SYSTEM_OWNER = dono/gestor da plataforma (admin global). Só Holanda.
 * - PRIME_FULL = assinante Prime com gestão plena do condomínio; NUNCA system owner.
 *
 * Não use “primeiro da lista” para decidir papéis — a ordem de SEED_ACCOUNTS não importa.
 */
const BOOTSTRAP = {
  systemOwnerEmail: 'holanda_rodrigues@hotmail.com',
  primeFullAccessEmail: 'hellennamello@hotmail.com',
} as const;

interface SeedProfile {
  asSystemOwner: boolean;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  condoRole: MembershipRole;
  label: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Resolve papéis e plano pelo e-mail bootstrap (fonte da verdade).
 * Contas extras em SEED_ACCOUNTS ficam OPERATOR no demo, plano Lite, sem SYSTEM_OWNER.
 */
function resolveSeedProfile(account: SeedAccount): SeedProfile {
  const email = normalizeEmail(account.email);

  if (email === BOOTSTRAP.systemOwnerEmail) {
    return {
      asSystemOwner: true,
      plan: SubscriptionPlan.Gestor,
      subscriptionStatus: SubscriptionStatus.Active,
      condoRole: MembershipRole.Owner,
      label: 'SYSTEM_OWNER · plano Gestor · OWNER do demo',
    };
  }

  if (email === BOOTSTRAP.primeFullAccessEmail) {
    return {
      asSystemOwner: false,
      plan: SubscriptionPlan.Prime,
      subscriptionStatus: SubscriptionStatus.Active,
      condoRole: MembershipRole.Owner,
      label: 'plano Prime (ACTIVE) · OWNER do demo · sem SYSTEM_OWNER',
    };
  }

  return {
    asSystemOwner: false,
    plan: SubscriptionPlan.Lite,
    subscriptionStatus: SubscriptionStatus.Trialing,
    condoRole: MembershipRole.Operator,
    label: 'plano Lite · OPERATOR do demo · sem SYSTEM_OWNER',
  };
}

/** Creates the account or refreshes password / platform role / plan. */
async function upsertUser(
  users: Repository<UserOrmEntity>,
  account: SeedAccount,
  profile: SeedProfile,
): Promise<User> {
  const email = normalizeEmail(account.email);
  const password = assertPasswordPolicy(account.password);

  const existing = await users.findOne({ where: { email } });
  const passwordHash = await hash(password, SALT_ROUNDS);

  let user = existing
    ? User.restore({
        id: existing.id,
        name: existing.name,
        email: existing.email,
        passwordHash: existing.passwordHash,
        cpf: existing.cpf,
        platformRole: (existing.platformRole as PlatformRole | null) ?? null,
        isActive: existing.isActive ?? true,
        plan: (existing.plan as SubscriptionPlan) ?? undefined,
        subscriptionStatus: (existing.subscriptionStatus as SubscriptionStatus) ?? undefined,
        trialEndsAt: existing.trialEndsAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subscriptionUpdatedAt: existing.subscriptionUpdatedAt ?? null,
        stripeCustomerId: existing.stripeCustomerId ?? null,
        stripeSubscriptionId: existing.stripeSubscriptionId ?? null,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
      }).changePassword(passwordHash)
    : User.create({ name: account.name, email, passwordHash });

  // Nome do seed prevalece (corrige grafia em re-seeds).
  if (user.name !== account.name.trim()) {
    user = User.restore({
      ...user.toSnapshot(),
      name: account.name.trim(),
    });
  }

  if (profile.asSystemOwner) {
    user = user.withPlatformRole(PlatformRole.SystemOwner).activate();
  } else {
    // Garante que contas Prime/outras nunca fiquem como donas da plataforma.
    user = user.withPlatformRole(null).activate();
  }

  user = user.withSubscription({
    plan: profile.plan,
    status: profile.subscriptionStatus,
  });

  const { createdAt: _createdAt, updatedAt: _updatedAt, ...row } = user.toSnapshot();

  await users.save({
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    cpf: row.cpf,
    platformRole: row.platformRole,
    isActive: row.isActive,
    plan: row.plan,
    subscriptionStatus: row.subscriptionStatus,
    trialEndsAt: row.trialEndsAt,
    subscriptionUpdatedAt: row.subscriptionUpdatedAt,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
  });

  console.log(`Conta pronta: ${email} (${existing ? 'atualizada' : 'criada'}) · ${profile.label}`);

  return user;
}

async function ensurePortoImperial(
  condominiums: TypeormCondominiumRepository,
): Promise<Condominium> {
  const existing = await condominiums.findBySlug(PORTO_IMPERIAL_SLUG);
  const unitNumbers = buildPortoImperialUnits();

  if (existing) {
    if (existing.unitNumbers.length === 0) {
      await condominiums.replaceUnits(existing.id, unitNumbers);
      console.log(`Unidades do ${PORTO_IMPERIAL_NAME} recriadas (${unitNumbers.length}).`);
    }

    return existing;
  }

  const condominium = await condominiums.save(
    Condominium.create({
      name: PORTO_IMPERIAL_NAME,
      slug: PORTO_IMPERIAL_SLUG,
      unitNumbers,
      buildingHandoverDate: '2018-04-01',
      address: 'Porto Imperial — endereço seed',
      latitude: -22.906847,
      longitude: -43.172897,
      geofenceRadiusMeters: 100,
    }),
  );

  console.log(`${PORTO_IMPERIAL_NAME} criado com ${unitNumbers.length} unidades.`);

  return condominium;
}

async function ensureMembership(
  memberships: TypeormMembershipRepository,
  userId: string,
  condominiumId: string,
  role: MembershipRole,
): Promise<void> {
  const existing = await memberships.findByUserAndCondo(userId, condominiumId);

  if (existing) {
    if (existing.role === role) {
      return;
    }

    await memberships.save(existing.withRole(role));
    console.log(`Vínculo atualizado: usuário ${userId} agora é ${role} do ${PORTO_IMPERIAL_NAME}.`);
    return;
  }

  await memberships.save(Membership.create({ userId, condominiumId, role }));
  console.log(`Vínculo criado: usuário ${userId} como ${role} do ${PORTO_IMPERIAL_NAME}.`);
}

/**
 * Provisiona SEED_ACCOUNTS + condomínio demo Porto Imperial.
 *
 * Papéis de plataforma (produção):
 * - holanda_rodrigues@hotmail.com → SYSTEM_OWNER (único dono/gestor do sistema)
 * - hellennamello@hotmail.com → plano Prime ACTIVE, OWNER do demo, SEM SYSTEM_OWNER
 *
 * Idempotente: reexecutar atualiza senha, plano, papel e vínculos.
 */
async function seedUsers(): Promise<void> {
  loadEnvFile();

  const { SEED_ACCOUNTS: accounts } = validateEnvironment(process.env);

  if (accounts.length === 0) {
    throw new Error('Nenhuma conta em SEED_ACCOUNTS: preencha a variável antes de rodar o seed.');
  }

  const emails = accounts.map((account) => normalizeEmail(account.email));
  const missingOwner = !emails.includes(BOOTSTRAP.systemOwnerEmail);
  const missingPrime = !emails.includes(BOOTSTRAP.primeFullAccessEmail);

  if (missingOwner || missingPrime) {
    console.warn(
      [
        'AVISO: SEED_ACCOUNTS incompleto para o bootstrap de produção.',
        missingOwner ? `  - Falta ${BOOTSTRAP.systemOwnerEmail} (SYSTEM_OWNER)` : null,
        missingPrime ? `  - Falta ${BOOTSTRAP.primeFullAccessEmail} (plano Prime)` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }

  await dataSource.initialize();

  try {
    const users = dataSource.getRepository(UserOrmEntity);
    const cache = new MemoryCacheStore();
    const condominiums = new TypeormCondominiumRepository(dataSource, cache);
    const memberships = new TypeormMembershipRepository(
      dataSource.getRepository(MembershipOrmEntity),
      cache,
    );

    const condominium = await ensurePortoImperial(condominiums);

    console.log('--- Bootstrap de papéis (seed) ---');
    console.log(`SYSTEM_OWNER: ${BOOTSTRAP.systemOwnerEmail}`);
    console.log(`Prime (sem SYSTEM_OWNER): ${BOOTSTRAP.primeFullAccessEmail}`);
    console.log('----------------------------------');

    for (const account of accounts) {
      const profile = resolveSeedProfile(account);
      const user = await upsertUser(users, account, profile);
      await ensureMembership(memberships, user.id, condominium.id, profile.condoRole);
    }
  } finally {
    await dataSource.destroy();
  }
}

seedUsers().catch((error: unknown) => {
  console.error('Falha ao executar o seed de usuários:', error);
  process.exitCode = 1;
});
