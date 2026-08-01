import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Quem opera os dados dos moradores responde por isso com o próprio CPF. A
 * coluna nasce nula porque as contas existentes só se identificam no próximo
 * acesso, e o índice único impede que duas contas apontem para a mesma pessoa.
 */
export class AddUserCpf1717000500000 implements MigrationInterface {
  name = 'AddUserCpf1717000500000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "cpf" varchar(11)`);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_users_cpf" ON "users" ("cpf")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_cpf"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "cpf"`);
  }
}
