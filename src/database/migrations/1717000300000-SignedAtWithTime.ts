import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SignedAtWithTime1717000300000 implements MigrationInterface {
  name = 'SignedAtWithTime1717000300000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "residents"
      ALTER COLUMN "signed_at" TYPE timestamptz USING "signed_at"::timestamptz
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "residents"
      ALTER COLUMN "signed_at" TYPE date USING "signed_at"::date
    `);
  }
}
