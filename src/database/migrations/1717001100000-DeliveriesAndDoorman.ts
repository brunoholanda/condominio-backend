import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the DOORMAN membership role and the packages desk used by the lobby
 * to register parcels and protocol handovers with a handwritten signature.
 */
export class DeliveriesAndDoorman1717001100000 implements MigrationInterface {
  name = 'DeliveriesAndDoorman1717001100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "memberships"
      DROP CONSTRAINT IF EXISTS "memberships_role_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "memberships"
      ADD CONSTRAINT "memberships_role_check"
      CHECK ("role" IN ('OWNER', 'MANAGER', 'OPERATOR', 'DOORMAN'))
    `);

    await queryRunner.query(`
      CREATE TABLE "packages" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "unit_number" varchar(20) NOT NULL,
        "description" varchar(200) NOT NULL,
        "carrier" varchar(100),
        "status" varchar(20) NOT NULL DEFAULT 'WAITING'
          CHECK ("status" IN ('WAITING', 'DELIVERED')),
        "received_at" timestamptz NOT NULL DEFAULT now(),
        "received_by_user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE RESTRICT,
        "delivered_at" timestamptz,
        "delivered_by_user_id" uuid REFERENCES "users" ("id") ON DELETE RESTRICT,
        "recipient_name" varchar(150),
        "signature" text,
        "notes" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_packages_condo_status" ON "packages" ("condominium_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_packages_condo_unit" ON "packages" ("condominium_id", "unit_number")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "packages"`);
    await queryRunner.query(`
      ALTER TABLE "memberships"
      DROP CONSTRAINT IF EXISTS "memberships_role_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "memberships"
      ADD CONSTRAINT "memberships_role_check"
      CHECK ("role" IN ('OWNER', 'MANAGER', 'OPERATOR'))
    `);
  }
}
