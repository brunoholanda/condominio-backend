import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Guarda a segunda etapa do login. O registro é descartável: some quando o
 * código é usado, quando outro login é iniciado ou quando vence.
 */
export class LoginChallenges1717000600000 implements MigrationInterface {
  name = 'LoginChallenges1717000600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "login_challenges" (
        "id" uuid PRIMARY KEY,
        "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "code_hash" varchar(255) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "attempts" smallint NOT NULL DEFAULT 0,
        "resends" smallint NOT NULL DEFAULT 0,
        "consumed_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_login_challenges_user" ON "login_challenges" ("user_id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "login_challenges"`);
  }
}
