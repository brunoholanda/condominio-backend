import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Justificativas de falta / ausência de funcionários do condomínio. */
export class EmployeeAbsences1717002200000 implements MigrationInterface {
  name = 'EmployeeAbsences1717002200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "employee_absences" (
        "id" uuid PRIMARY KEY,
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "employee_id" uuid NOT NULL REFERENCES "condo_employees" ("id") ON DELETE CASCADE,
        "reason" varchar(40) NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "notes" varchar(1000),
        "created_by_user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE RESTRICT,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_employee_absences_condo" ON "employee_absences" ("condominium_id", "start_date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_employee_absences_employee" ON "employee_absences" ("employee_id", "start_date")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "employee_absences"`);
  }
}
