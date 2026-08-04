import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Stripe customer/subscription ids for automated SaaS billing. */
export class UserStripeBilling1717001900000 implements MigrationInterface {
  name = 'UserStripeBilling1717001900000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "stripe_customer_id" varchar(64) NULL,
      ADD COLUMN "stripe_subscription_id" varchar(64) NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_users_stripe_customer_id"
      ON "users" ("stripe_customer_id")
      WHERE "stripe_customer_id" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_users_stripe_subscription_id"
      ON "users" ("stripe_subscription_id")
      WHERE "stripe_subscription_id" IS NOT NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_users_stripe_subscription_id"`);
    await queryRunner.query(`DROP INDEX "UQ_users_stripe_customer_id"`);
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "stripe_subscription_id",
      DROP COLUMN "stripe_customer_id"
    `);
  }
}
