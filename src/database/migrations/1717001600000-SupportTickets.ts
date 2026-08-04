import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Chamados de suporte da plataforma (problema ou melhoria). */
export class SupportTickets1717001600000 implements MigrationInterface {
  name = 'SupportTickets1717001600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "support_tickets" (
        "id" uuid NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "category" varchar(20) NOT NULL
          CHECK ("category" IN ('PROBLEM', 'IMPROVEMENT')),
        "subject" varchar(200) NOT NULL,
        "body" text NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'OPEN'
          CHECK ("status" IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
        "condominium_id" uuid NULL REFERENCES "condominiums" ("id") ON DELETE SET NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_support_tickets" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_support_tickets_user" ON "support_tickets" ("user_id", "created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_support_tickets_status" ON "support_tickets" ("status", "created_at")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_support_tickets_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_support_tickets_user"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "support_tickets"`);
  }
}
