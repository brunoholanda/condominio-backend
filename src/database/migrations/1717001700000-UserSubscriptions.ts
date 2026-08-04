import type { MigrationInterface, QueryRunner } from 'typeorm';

/** SaaS plan, trial window and subscription status on platform accounts. */
export class UserSubscriptions1717001700000 implements MigrationInterface {
  name = 'UserSubscriptions1717001700000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "plan" varchar(16) NOT NULL DEFAULT 'lite'
        CHECK ("plan" IN ('lite', 'prime', 'gestor')),
      ADD COLUMN "subscription_status" varchar(24) NOT NULL DEFAULT 'TRIALING'
        CHECK ("subscription_status" IN ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED')),
      ADD COLUMN "trial_ends_at" timestamptz NULL,
      ADD COLUMN "subscription_updated_at" timestamptz NULL
    `);

    await queryRunner.query(`
      UPDATE "users"
      SET
        "plan" = 'lite',
        "subscription_status" = 'TRIALING',
        "trial_ends_at" = COALESCE("created_at", NOW()) + INTERVAL '30 days',
        "subscription_updated_at" = NOW()
      WHERE "trial_ends_at" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "trial_ends_at" SET NOT NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "subscription_updated_at",
      DROP COLUMN "trial_ends_at",
      DROP COLUMN "subscription_status",
      DROP COLUMN "plan"
    `);
  }
}
