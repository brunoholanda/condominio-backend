import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Which service shortcuts appear on the public condo hub (/c/:slug). */
export class PublicHubLinks1717001400000 implements MigrationInterface {
  name = 'PublicHubLinks1717001400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "condominiums"
      ADD COLUMN "public_hub_links" jsonb NOT NULL
      DEFAULT '["cadastro","documentos","transparencia","sugestoes","reservas"]'::jsonb
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "condominiums" DROP COLUMN "public_hub_links"`);
  }
}
