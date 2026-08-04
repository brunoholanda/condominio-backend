import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * P0/P1: auditoria persistente, notificações, visitantes, chamados do condo,
 * aprovação/anexo em faltas e metadados de retenção de selfies.
 */
export class SecurityAndOpsP0P11717002300000 implements MigrationInterface {
  name = 'SecurityAndOpsP0P11717002300000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "audit_access_logs" (
        "id" uuid PRIMARY KEY,
        "actor_email" varchar(255),
        "actor_user_id" uuid,
        "action" varchar(120) NOT NULL,
        "condominium_id" uuid,
        "target_id" varchar(64),
        "success" boolean NOT NULL DEFAULT true,
        "error_message" varchar(500),
        "ip" varchar(64),
        "user_agent" varchar(500),
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_audit_access_created" ON "audit_access_logs" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_access_condo" ON "audit_access_logs" ("condominium_id", "created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "staff_login_lockouts" (
        "id" uuid PRIMARY KEY,
        "condominium_id" uuid NOT NULL,
        "cpf_hash" varchar(64) NOT NULL,
        "failed_attempts" int NOT NULL DEFAULT 0,
        "locked_until" timestamptz,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_staff_login_lockouts_condo_cpf" UNIQUE ("condominium_id", "cpf_hash")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid PRIMARY KEY,
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "user_id" uuid REFERENCES "users" ("id") ON DELETE CASCADE,
        "title" varchar(200) NOT NULL,
        "body" varchar(2000) NOT NULL,
        "category" varchar(40) NOT NULL,
        "link_path" varchar(255),
        "read_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_notifications_user_unread" ON "notifications" ("user_id", "read_at", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_notifications_condo" ON "notifications" ("condominium_id", "created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "visitor_passes" (
        "id" uuid PRIMARY KEY,
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "visitor_name" varchar(150) NOT NULL,
        "visitor_document" varchar(40),
        "host_name" varchar(150) NOT NULL,
        "unit_number" varchar(40),
        "expected_at" timestamptz NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'PENDING',
        "notes" varchar(1000),
        "created_by_user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE RESTRICT,
        "checked_in_at" timestamptz,
        "checked_in_by_user_id" uuid,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_visitor_passes_condo" ON "visitor_passes" ("condominium_id", "expected_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "condo_work_orders" (
        "id" uuid PRIMARY KEY,
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "title" varchar(200) NOT NULL,
        "description" varchar(5000) NOT NULL,
        "category" varchar(40) NOT NULL,
        "priority" varchar(20) NOT NULL DEFAULT 'NORMAL',
        "status" varchar(20) NOT NULL DEFAULT 'OPEN',
        "unit_number" varchar(40),
        "reporter_name" varchar(150),
        "created_by_user_id" uuid REFERENCES "users" ("id") ON DELETE SET NULL,
        "assigned_to" varchar(150),
        "resolved_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_condo_work_orders_condo" ON "condo_work_orders" ("condominium_id", "status", "created_at")`,
    );

    await queryRunner.query(`
      ALTER TABLE "employee_absences"
        ADD COLUMN "status" varchar(20) NOT NULL DEFAULT 'PENDING',
        ADD COLUMN "attachment_storage_key" varchar(500),
        ADD COLUMN "reviewed_by_user_id" uuid,
        ADD COLUMN "reviewed_at" timestamptz,
        ADD COLUMN "review_notes" varchar(1000)
    `);

    await queryRunner.query(`
      ALTER TABLE "time_punches"
        ADD COLUMN IF NOT EXISTS "selfie_purged_at" timestamptz
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "time_punches" DROP COLUMN IF EXISTS "selfie_purged_at"`);
    await queryRunner.query(`
      ALTER TABLE "employee_absences"
        DROP COLUMN IF EXISTS "status",
        DROP COLUMN IF EXISTS "attachment_storage_key",
        DROP COLUMN IF EXISTS "reviewed_by_user_id",
        DROP COLUMN IF EXISTS "reviewed_at",
        DROP COLUMN IF EXISTS "review_notes"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "condo_work_orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "visitor_passes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_login_lockouts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_access_logs"`);
  }
}
