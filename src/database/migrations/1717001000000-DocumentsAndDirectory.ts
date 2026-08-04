import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Published documents (notices, minutes) and the useful contacts hub of each condo. */
export class DocumentsAndDirectory1717001000000 implements MigrationInterface {
  name = 'DocumentsAndDirectory1717001000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "documents" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "type" varchar(30) NOT NULL
          CHECK ("type" IN ('ANNOUNCEMENT', 'ASSEMBLY_MINUTES', 'ASSEMBLY_NOTICE', 'OTHER')),
        "title" varchar(200) NOT NULL,
        "body" text NOT NULL,
        "storage_key" varchar(500),
        "published_at" timestamptz,
        "is_public" boolean NOT NULL DEFAULT false,
        "created_by_user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE RESTRICT,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_documents_condo" ON "documents" ("condominium_id")`);
    await queryRunner.query(
      `CREATE INDEX "idx_documents_condo_public" ON "documents" ("condominium_id", "is_public")`,
    );

    await queryRunner.query(`
      CREATE TABLE "useful_contacts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "label" varchar(150) NOT NULL,
        "phone" varchar(20),
        "url" varchar(500),
        "category" varchar(20) NOT NULL
          CHECK ("category" IN ('DOORMAN', 'SYNDIC', 'ADMIN', 'CUSTOM')),
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_useful_contacts_condo" ON "useful_contacts" ("condominium_id", "sort_order")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "useful_contacts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "documents"`);
  }
}
