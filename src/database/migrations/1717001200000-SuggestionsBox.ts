import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Suggestions box on the public condo page: validated by unit + CPF against
 * the resident registry, then stored without keeping the CPF.
 */
export class SuggestionsBox1717001200000 implements MigrationInterface {
  name = 'SuggestionsBox1717001200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "suggestions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "unit_number" varchar(20) NOT NULL,
        "resident_id" uuid REFERENCES "residents" ("id") ON DELETE SET NULL,
        "author_name" varchar(150) NOT NULL,
        "body" text NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'NEW'
          CHECK ("status" IN ('NEW', 'READ')),
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_suggestions_condo_status" ON "suggestions" ("condominium_id", "status", "created_at")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "suggestions"`);
  }
}
