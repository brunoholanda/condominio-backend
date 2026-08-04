import type { MigrationInterface, QueryRunner } from 'typeorm';

const PORTO_IMPERIAL_ID = 'a0000000-0000-4000-8000-000000000001';
const PORTO_IMPERIAL_SLUG = 'porto-imperial';

/**
 * Turns the single-condo app into a multi-tenant one. Every condo gets its own
 * units and memberships, and the existing residents are folded into the first
 * condo (Porto Imperial) so nothing already collected is lost.
 */
export class MultiTenantFoundation1717000700000 implements MigrationInterface {
  name = 'MultiTenantFoundation1717000700000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "condominiums" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(150) NOT NULL,
        "slug" varchar(80) NOT NULL,
        "building_handover_date" date,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_condominiums_slug" ON "condominiums" ("slug")`,
    );

    await queryRunner.query(`
      CREATE TABLE "condo_units" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "number" varchar(20) NOT NULL
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_condo_units_condo_number" ON "condo_units" ("condominium_id", "number")`,
    );

    await queryRunner.query(`
      CREATE TABLE "memberships" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "role" varchar(20) NOT NULL CHECK ("role" IN ('OWNER', 'MANAGER', 'OPERATOR')),
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_memberships_user_condo" ON "memberships" ("user_id", "condominium_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_memberships_condo" ON "memberships" ("condominium_id")`,
    );

    // Residents start pointing nowhere: filled in below, once Porto Imperial exists.
    await queryRunner.query(`ALTER TABLE "residents" ADD COLUMN "condominium_id" uuid`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_residents_unit"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_residents_cpf"`);

    await queryRunner.query(`
      INSERT INTO "condominiums" ("id", "name", "slug", "building_handover_date")
      VALUES ('${PORTO_IMPERIAL_ID}', 'Condomínio Porto Imperial', '${PORTO_IMPERIAL_SLUG}', '2018-04-01')
    `);

    // 68 units: 101-117, 201-217, 301-317, 401-417.
    await queryRunner.query(`
      INSERT INTO "condo_units" ("condominium_id", "number")
      SELECT '${PORTO_IMPERIAL_ID}', (floor_num::text || lpad(apt_num::text, 2, '0'))
      FROM generate_series(1, 4) AS floor_num, generate_series(1, 17) AS apt_num
    `);

    await queryRunner.query(
      `UPDATE "residents" SET "condominium_id" = '${PORTO_IMPERIAL_ID}' WHERE "condominium_id" IS NULL`,
    );

    await queryRunner.query(`ALTER TABLE "residents" ALTER COLUMN "condominium_id" SET NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE "residents"
      ADD CONSTRAINT "fk_residents_condominium"
      FOREIGN KEY ("condominium_id") REFERENCES "condominiums" ("id") ON DELETE CASCADE
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_residents_condo_unit" ON "residents" ("condominium_id", "unit")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_residents_condo_cpf" ON "residents" ("condominium_id", "cpf")`,
    );

    // Every account that already exists could operate the residents area, so it
    // keeps doing exactly that under the condo the data always belonged to.
    await queryRunner.query(`
      INSERT INTO "memberships" ("user_id", "condominium_id", "role")
      SELECT "id", '${PORTO_IMPERIAL_ID}', 'OPERATOR' FROM "users"
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_residents_condo_cpf"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_residents_condo_unit"`);
    await queryRunner.query(
      `ALTER TABLE "residents" DROP CONSTRAINT IF EXISTS "fk_residents_condominium"`,
    );
    await queryRunner.query(`ALTER TABLE "residents" DROP COLUMN IF EXISTS "condominium_id"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_residents_cpf" ON "residents" ("cpf")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_residents_unit" ON "residents" ("unit")`);

    await queryRunner.query(`DROP TABLE IF EXISTS "memberships"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "condo_units"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "condominiums"`);
  }
}
