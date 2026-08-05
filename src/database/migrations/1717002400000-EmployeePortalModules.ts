import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Flags de módulo no funcionário + rastreio de ações feitas pelo portal CPF+PIN. */
export class EmployeePortalModules1717002400000 implements MigrationInterface {
  name = 'EmployeePortalModules1717002400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "condo_employees"
        ADD COLUMN "can_access_time_clock" boolean NOT NULL DEFAULT true,
        ADD COLUMN "can_access_visitors" boolean NOT NULL DEFAULT false,
        ADD COLUMN "can_access_deliveries" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "condo_employees"
        ALTER COLUMN "pin_hash" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "visitor_passes"
        ALTER COLUMN "created_by_user_id" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "visitor_passes"
        ADD COLUMN "created_by_employee_id" uuid REFERENCES "condo_employees" ("id") ON DELETE SET NULL,
        ADD COLUMN "checked_in_by_employee_id" uuid REFERENCES "condo_employees" ("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "packages"
        ALTER COLUMN "received_by_user_id" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "packages"
        ADD COLUMN "received_by_employee_id" uuid REFERENCES "condo_employees" ("id") ON DELETE SET NULL,
        ADD COLUMN "delivered_by_employee_id" uuid REFERENCES "condo_employees" ("id") ON DELETE SET NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "packages"
        DROP COLUMN IF EXISTS "delivered_by_employee_id",
        DROP COLUMN IF EXISTS "received_by_employee_id"
    `);
    await queryRunner.query(`
      UPDATE "packages" SET "received_by_user_id" = '00000000-0000-0000-0000-000000000000'
      WHERE "received_by_user_id" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "packages"
        ALTER COLUMN "received_by_user_id" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "visitor_passes"
        DROP COLUMN IF EXISTS "checked_in_by_employee_id",
        DROP COLUMN IF EXISTS "created_by_employee_id"
    `);
    await queryRunner.query(`
      UPDATE "visitor_passes" SET "created_by_user_id" = '00000000-0000-0000-0000-000000000000'
      WHERE "created_by_user_id" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "visitor_passes"
        ALTER COLUMN "created_by_user_id" SET NOT NULL
    `);

    await queryRunner.query(`
      UPDATE "condo_employees" SET "pin_hash" = '' WHERE "pin_hash" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "condo_employees"
        ALTER COLUMN "pin_hash" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "condo_employees"
        DROP COLUMN IF EXISTS "can_access_deliveries",
        DROP COLUMN IF EXISTS "can_access_visitors",
        DROP COLUMN IF EXISTS "can_access_time_clock"
    `);
  }
}
