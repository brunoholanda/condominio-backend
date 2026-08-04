import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Platform-wide system owner role and account activation flag. */
export class SystemOwnerAndActiveAccounts1717001500000 implements MigrationInterface {
  name = 'SystemOwnerAndActiveAccounts1717001500000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "platform_role" varchar(32) NULL
        CHECK ("platform_role" IS NULL OR "platform_role" IN ('SYSTEM_OWNER')),
      ADD COLUMN "is_active" boolean NOT NULL DEFAULT true
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "platform_role",
      DROP COLUMN "is_active"
    `);
  }
}
