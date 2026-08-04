import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Short-lived tokens so a desktop delivery protocol can be signed on a phone. */
export class PackageSigningSessions1717001800000 implements MigrationInterface {
  name = 'PackageSigningSessions1717001800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "package_signing_sessions" (
        "id" uuid NOT NULL,
        "package_id" uuid NOT NULL,
        "token" varchar(64) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "consumed_at" timestamptz NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_package_signing_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_package_signing_sessions_token" UNIQUE ("token"),
        CONSTRAINT "FK_package_signing_sessions_package"
          FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_package_signing_sessions_package"
      ON "package_signing_sessions" ("package_id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "package_signing_sessions"`);
  }
}
