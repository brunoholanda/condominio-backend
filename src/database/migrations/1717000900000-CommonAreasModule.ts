import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Resident self-service accounts, the areas they can book and the bookings themselves. */
export class CommonAreasModule1717000900000 implements MigrationInterface {
  name = 'CommonAreasModule1717000900000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "resident_accounts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "unit_number" varchar(20) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_resident_accounts_user_condo" ON "resident_accounts" ("user_id", "condominium_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_resident_accounts_condo_unit" ON "resident_accounts" ("condominium_id", "unit_number")`,
    );

    await queryRunner.query(`
      CREATE TABLE "common_areas" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "name" varchar(150) NOT NULL,
        "description" text,
        "rules" text,
        "cost_cents" integer NOT NULL DEFAULT 0,
        "capacity" integer NOT NULL DEFAULT 1,
        "active" boolean NOT NULL DEFAULT true,
        "auto_approve" boolean NOT NULL DEFAULT false,
        "min_advance_hours" integer NOT NULL DEFAULT 0,
        "cancel_before_hours" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_common_areas_condo" ON "common_areas" ("condominium_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "common_area_id" uuid NOT NULL REFERENCES "common_areas" ("id") ON DELETE CASCADE,
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "unit_number" varchar(20) NOT NULL,
        "resident_account_id" uuid NOT NULL REFERENCES "resident_accounts" ("id") ON DELETE CASCADE,
        "starts_at" timestamptz NOT NULL,
        "ends_at" timestamptz NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'REQUESTED'
          CHECK ("status" IN ('REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED')),
        "cost_snapshot_cents" integer NOT NULL DEFAULT 0,
        "rules_accepted_at" timestamptz NOT NULL,
        "notes" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_area_period" ON "bookings" ("common_area_id", "starts_at", "ends_at")`,
    );
    await queryRunner.query(`CREATE INDEX "idx_bookings_condo" ON "bookings" ("condominium_id")`);
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_resident_account" ON "bookings" ("resident_account_id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "bookings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "common_areas"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resident_accounts"`);
  }
}
