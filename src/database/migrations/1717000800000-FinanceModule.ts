import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Payables of each condo, their status trail and the files attached to them. */
export class FinanceModule1717000800000 implements MigrationInterface {
  name = 'FinanceModule1717000800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "payables" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "description" varchar(200) NOT NULL,
        "vendor" varchar(150) NOT NULL,
        "category" varchar(60) NOT NULL,
        "amount_cents" integer NOT NULL,
        "due_date" date NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'PENDING'
          CHECK ("status" IN ('PENDING', 'PAID', 'CANCELLED')),
        "paid_at" timestamptz,
        "notes" text,
        "created_by_user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE RESTRICT,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_payables_condo" ON "payables" ("condominium_id")`);
    await queryRunner.query(
      `CREATE INDEX "idx_payables_condo_status" ON "payables" ("condominium_id", "status")`,
    );

    await queryRunner.query(`
      CREATE TABLE "payable_status_history" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "payable_id" uuid NOT NULL REFERENCES "payables" ("id") ON DELETE CASCADE,
        "from_status" varchar(20),
        "to_status" varchar(20) NOT NULL,
        "changed_by_user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE RESTRICT,
        "changed_at" timestamptz NOT NULL DEFAULT now(),
        "note" text
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_payable_status_history_payable" ON "payable_status_history" ("payable_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "attachments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "payable_id" uuid NOT NULL REFERENCES "payables" ("id") ON DELETE CASCADE,
        "type" varchar(20) NOT NULL
          CHECK ("type" IN ('INVOICE', 'SERVICE_NOTE', 'CONTRACT', 'OTHER')),
        "file_name" varchar(255) NOT NULL,
        "mime_type" varchar(100) NOT NULL,
        "size_bytes" integer NOT NULL,
        "storage_key" varchar(500) NOT NULL,
        "uploaded_by_user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE RESTRICT,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_attachments_payable" ON "attachments" ("payable_id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "attachments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payable_status_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payables"`);
  }
}
