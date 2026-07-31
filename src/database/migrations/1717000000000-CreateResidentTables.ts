import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateResidentTables1717000000000 implements MigrationInterface {
  name = 'CreateResidentTables1717000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "residents" (
        "id" uuid PRIMARY KEY,
        "unit" varchar(20) NOT NULL,
        "occupancy_type" varchar(10) NOT NULL,
        "full_name" varchar(150) NOT NULL,
        "rg" varchar(20) NOT NULL,
        "cpf" varchar(11) NOT NULL,
        "email" varchar(254) NOT NULL,
        "landline_phone" varchar(11),
        "mobile_phone" varchar(11) NOT NULL,
        "moved_in_at" date NOT NULL,
        "emergency_contact_name" varchar(150) NOT NULL,
        "emergency_contact_phone" varchar(11) NOT NULL,
        "landlord_name" varchar(150),
        "landlord_phone" varchar(11),
        "data_usage_consent" boolean NOT NULL,
        "signed_at" date NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "chk_residents_occupancy_type" CHECK ("occupancy_type" IN ('OWNER', 'TENANT')),
        CONSTRAINT "chk_residents_landlord" CHECK (
          "occupancy_type" = 'OWNER'
          OR ("landlord_name" IS NOT NULL AND "landlord_phone" IS NOT NULL)
        )
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "idx_residents_cpf" ON "residents" ("cpf")`);
    await queryRunner.query(`CREATE INDEX "idx_residents_unit" ON "residents" ("unit")`);

    await queryRunner.query(`
      CREATE TABLE "resident_household_members" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "resident_id" uuid NOT NULL REFERENCES "residents" ("id") ON DELETE CASCADE,
        "full_name" varchar(150) NOT NULL,
        "rg" varchar(20) NOT NULL,
        "kinship" varchar(60) NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "resident_employees" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "resident_id" uuid NOT NULL REFERENCES "residents" ("id") ON DELETE CASCADE,
        "full_name" varchar(150) NOT NULL,
        "rg" varchar(20) NOT NULL,
        "role" varchar(60) NOT NULL,
        "work_schedule" varchar(60) NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "resident_vehicles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "resident_id" uuid NOT NULL REFERENCES "residents" ("id") ON DELETE CASCADE,
        "brand" varchar(60) NOT NULL,
        "model" varchar(60) NOT NULL,
        "color" varchar(40) NOT NULL,
        "plate" varchar(7) NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "resident_pets" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "resident_id" uuid NOT NULL REFERENCES "residents" ("id") ON DELETE CASCADE,
        "name" varchar(60) NOT NULL,
        "species" varchar(20) NOT NULL,
        "breed" varchar(60),
        "color" varchar(40) NOT NULL
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_resident_household_members_resident" ON "resident_household_members" ("resident_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_resident_employees_resident" ON "resident_employees" ("resident_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_resident_vehicles_resident" ON "resident_vehicles" ("resident_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_resident_vehicles_plate" ON "resident_vehicles" ("plate")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_resident_pets_resident" ON "resident_pets" ("resident_id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "resident_pets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resident_vehicles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resident_employees"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resident_household_members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "residents"`);
  }
}
