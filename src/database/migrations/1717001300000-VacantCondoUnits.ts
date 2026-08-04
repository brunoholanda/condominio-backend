import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Allows staff to mark catalog units as vacant so they leave the pending list. */
export class VacantCondoUnits1717001300000 implements MigrationInterface {
  name = 'VacantCondoUnits1717001300000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "condo_units"
      ADD COLUMN "is_vacant" boolean NOT NULL DEFAULT false
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "condo_units" DROP COLUMN "is_vacant"`);
  }
}
