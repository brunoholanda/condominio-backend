import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Inclui o tipo DATA_INVENTORY no check de documentos. */
export class DocumentDataInventoryType1717002600000 implements MigrationInterface {
  name = 'DocumentDataInventoryType1717002600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "documents" DROP CONSTRAINT IF EXISTS "documents_type_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "documents"
        ADD CONSTRAINT "documents_type_check"
        CHECK ("type" IN (
          'ANNOUNCEMENT',
          'ASSEMBLY_MINUTES',
          'ASSEMBLY_NOTICE',
          'OTHER',
          'DATA_INVENTORY'
        ))
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "documents" WHERE "type" = 'DATA_INVENTORY'
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" DROP CONSTRAINT IF EXISTS "documents_type_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "documents"
        ADD CONSTRAINT "documents_type_check"
        CHECK ("type" IN (
          'ANNOUNCEMENT',
          'ASSEMBLY_MINUTES',
          'ASSEMBLY_NOTICE',
          'OTHER'
        ))
    `);
  }
}
