import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Arquivo LGPD do cadastro de morador anterior (retenção 5 anos). */
export class FormerResidents1717002500000 implements MigrationInterface {
  name = 'FormerResidents1717002500000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "former_residents" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "unit" varchar(30) NOT NULL,
        "source_resident_id" uuid NOT NULL,
        "reason" varchar(20) NOT NULL CHECK ("reason" IN ('UPDATE', 'DELETE')),
        "payload" jsonb NOT NULL,
        "superseded_at" timestamptz NOT NULL DEFAULT now(),
        "retain_until" timestamptz NOT NULL,
        "superseded_by_user_id" uuid REFERENCES "users" ("id") ON DELETE SET NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_former_residents_condo_unit"
        ON "former_residents" ("condominium_id", "unit")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_former_residents_retain_until"
        ON "former_residents" ("retain_until")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "former_residents"`);
  }
}
