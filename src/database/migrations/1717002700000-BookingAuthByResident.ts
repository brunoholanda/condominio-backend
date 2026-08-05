import type { MigrationInterface, QueryRunner } from 'typeorm';

/** OTP de reservas por CPF + bookings.resident_id (sem ResidentAccount). */
export class BookingAuthByResident1717002700000 implements MigrationInterface {
  name = 'BookingAuthByResident1717002700000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "booking_auth_challenges" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "resident_id" uuid NOT NULL REFERENCES "residents" ("id") ON DELETE CASCADE,
        "code_hash" varchar(255) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "attempts" integer NOT NULL DEFAULT 0,
        "resends" integer NOT NULL DEFAULT 0,
        "consumed_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_booking_auth_challenges_condo"
        ON "booking_auth_challenges" ("condominium_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_booking_auth_challenges_resident"
        ON "booking_auth_challenges" ("resident_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings" ADD COLUMN "resident_id" uuid
    `);

    // Reservas antigas sem Resident correspondente são removidas (legado ResidentAccount).
    await queryRunner.query(`DELETE FROM "bookings" WHERE "resident_id" IS NULL`);

    await queryRunner.query(`
      ALTER TABLE "bookings"
        ALTER COLUMN "resident_id" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "bookings"
        ADD CONSTRAINT "fk_bookings_resident"
        FOREIGN KEY ("resident_id") REFERENCES "residents" ("id") ON DELETE RESTRICT
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_bookings_resident" ON "bookings" ("resident_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_resident_account_id_fkey"
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bookings_resident_account"`);
    await queryRunner.query(`
      ALTER TABLE "bookings" DROP COLUMN IF EXISTS "resident_account_id"
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "bookings" ADD COLUMN "resident_account_id" uuid
    `);
    await queryRunner.query(`DELETE FROM "bookings"`);
    await queryRunner.query(`
      ALTER TABLE "bookings" ALTER COLUMN "resident_account_id" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "bookings"
        ADD CONSTRAINT "bookings_resident_account_id_fkey"
        FOREIGN KEY ("resident_account_id") REFERENCES "resident_accounts" ("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_bookings_resident_account" ON "bookings" ("resident_account_id")
    `);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "fk_bookings_resident"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bookings_resident"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "resident_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_auth_challenges"`);
  }
}
