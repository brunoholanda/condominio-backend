import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Localização/geofence do condomínio, funcionários (RH) e ponto eletrônico. */
export class CondoLocationAndStaff1717002100000 implements MigrationInterface {
  name = 'CondoLocationAndStaff1717002100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "condominiums"
        ADD COLUMN "address" varchar(255),
        ADD COLUMN "latitude" numeric(10,7),
        ADD COLUMN "longitude" numeric(10,7),
        ADD COLUMN "geofence_radius_meters" integer
    `);

    await queryRunner.query(`
      CREATE TABLE "condo_employees" (
        "id" uuid PRIMARY KEY,
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "full_name" varchar(150) NOT NULL,
        "cpf" varchar(11) NOT NULL,
        "rg" varchar(20),
        "birth_date" date,
        "gender" varchar(20),
        "marital_status" varchar(30),
        "nationality" varchar(80),
        "phone" varchar(20),
        "email" varchar(150),
        "address" varchar(255),
        "city" varchar(100),
        "state" varchar(2),
        "zip_code" varchar(8),
        "job_title" varchar(100) NOT NULL,
        "department" varchar(100),
        "admission_date" date,
        "contract_type" varchar(20) NOT NULL DEFAULT 'CLT',
        "work_schedule" varchar(200),
        "notes" text,
        "salary" numeric(12,2),
        "benefits" jsonb NOT NULL DEFAULT '[]',
        "bank_name" varchar(100),
        "bank_code" varchar(10),
        "agency" varchar(20),
        "account_number" varchar(30),
        "account_type" varchar(20),
        "pix_key" varchar(120),
        "pin_hash" varchar(255) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_condo_employees_condo_cpf" ON "condo_employees" ("condominium_id", "cpf")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_condo_employees_condo" ON "condo_employees" ("condominium_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "time_punches" (
        "id" uuid PRIMARY KEY,
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "employee_id" uuid NOT NULL REFERENCES "condo_employees" ("id") ON DELETE CASCADE,
        "type" varchar(20) NOT NULL,
        "status" varchar(20) NOT NULL,
        "punched_at" timestamptz NOT NULL,
        "latitude" numeric(10,7) NOT NULL,
        "longitude" numeric(10,7) NOT NULL,
        "accuracy_meters" numeric(10,2),
        "distance_meters" numeric(10,2) NOT NULL,
        "selfie_storage_key" varchar(500),
        "device_user_agent" varchar(500),
        "rejected_reason" varchar(255),
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_time_punches_employee_day" ON "time_punches" ("employee_id", "punched_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_time_punches_condo_day" ON "time_punches" ("condominium_id", "punched_at")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "time_punches"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "condo_employees"`);
    await queryRunner.query(`
      ALTER TABLE "condominiums"
        DROP COLUMN IF EXISTS "geofence_radius_meters",
        DROP COLUMN IF EXISTS "longitude",
        DROP COLUMN IF EXISTS "latitude",
        DROP COLUMN IF EXISTS "address"
    `);
  }
}
