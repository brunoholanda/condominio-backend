import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResidentSignature1717000200000 implements MigrationInterface {
  name = 'AddResidentSignature1717000200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "residents" ADD COLUMN "signature" text NOT NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "residents" DROP COLUMN "signature"`);
  }
}
