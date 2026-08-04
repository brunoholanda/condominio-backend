import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Cobranças PIX por unidade (Asaas), lotes e credenciais por condomínio. */
export class ReceivablesPix1717002000000 implements MigrationInterface {
  name = 'ReceivablesPix1717002000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "condo_asaas_settings" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "condominium_id" uuid NOT NULL UNIQUE REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "api_key" text NOT NULL,
        "wallet_id" varchar(64),
        "enabled" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "charge_batches" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "reference_month" date NOT NULL,
        "description" varchar(200) NOT NULL,
        "due_date" date NOT NULL,
        "default_amount_cents" integer NOT NULL,
        "created_by_user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE RESTRICT,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_charge_batches_condo" ON "charge_batches" ("condominium_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "charges" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "condominium_id" uuid NOT NULL REFERENCES "condominiums" ("id") ON DELETE CASCADE,
        "batch_id" uuid REFERENCES "charge_batches" ("id") ON DELETE SET NULL,
        "unit_number" varchar(20) NOT NULL,
        "resident_id" uuid,
        "payer_name" varchar(150) NOT NULL,
        "payer_cpf" varchar(11),
        "description" varchar(200) NOT NULL,
        "amount_cents" integer NOT NULL,
        "due_date" date NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'PENDING'
          CHECK ("status" IN ('PENDING', 'PAID', 'CANCELLED')),
        "asaas_payment_id" varchar(64) UNIQUE,
        "asaas_customer_id" varchar(64),
        "pix_payload" text,
        "pix_qr_code_base64" text,
        "pix_expiration_date" timestamptz,
        "invoice_url" varchar(500),
        "paid_at" timestamptz,
        "created_by_user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE RESTRICT,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_charges_condo" ON "charges" ("condominium_id")`);
    await queryRunner.query(
      `CREATE INDEX "idx_charges_condo_status" ON "charges" ("condominium_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_charges_condo_unit" ON "charges" ("condominium_id", "unit_number")`,
    );

    await queryRunner.query(`
      CREATE TABLE "charge_status_history" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "charge_id" uuid NOT NULL REFERENCES "charges" ("id") ON DELETE CASCADE,
        "from_status" varchar(20),
        "to_status" varchar(20) NOT NULL,
        "changed_by_user_id" uuid REFERENCES "users" ("id") ON DELETE RESTRICT,
        "changed_at" timestamptz NOT NULL DEFAULT now(),
        "note" text
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_charge_status_history_charge" ON "charge_status_history" ("charge_id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "charge_status_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "charges"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "charge_batches"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "condo_asaas_settings"`);
  }
}
