import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The condo has a fixed set of 68 apartments and each one answers the form once,
 * so the unit becomes a natural key guarded by the database itself.
 */
export class OneFormPerUnit1717000400000 implements MigrationInterface {
  name = 'OneFormPerUnit1717000400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_residents_unit"`);
    await queryRunner.query(`ALTER TABLE "residents" ALTER COLUMN "unit" TYPE varchar(3)`);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_residents_unit" ON "residents" ("unit")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_residents_unit"`);
    await queryRunner.query(`ALTER TABLE "residents" ALTER COLUMN "unit" TYPE varchar(20)`);
    await queryRunner.query(`CREATE INDEX "idx_residents_unit" ON "residents" ("unit")`);
  }
}
