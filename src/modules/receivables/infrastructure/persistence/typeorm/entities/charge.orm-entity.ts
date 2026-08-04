import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { ChargeStatus } from '../../../../domain/enums/charge-status';

@Entity('charges')
export class ChargeOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index('idx_charges_condo')
  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ name: 'batch_id', type: 'uuid', nullable: true })
  batchId: string | null;

  @Column({ name: 'unit_number', type: 'varchar', length: 20 })
  unitNumber: string;

  @Column({ name: 'resident_id', type: 'uuid', nullable: true })
  residentId: string | null;

  @Column({ name: 'payer_name', type: 'varchar', length: 150 })
  payerName: string;

  @Column({ name: 'payer_cpf', type: 'varchar', length: 11, nullable: true })
  payerCpf: string | null;

  @Column({ name: 'description', type: 'varchar', length: 200 })
  description: string;

  @Column({ name: 'amount_cents', type: 'int' })
  amountCents: number;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'PENDING' })
  status: ChargeStatus;

  @Column({ name: 'asaas_payment_id', type: 'varchar', length: 64, nullable: true, unique: true })
  asaasPaymentId: string | null;

  @Column({ name: 'asaas_customer_id', type: 'varchar', length: 64, nullable: true })
  asaasCustomerId: string | null;

  @Column({ name: 'pix_payload', type: 'text', nullable: true })
  pixPayload: string | null;

  @Column({ name: 'pix_qr_code_base64', type: 'text', nullable: true })
  pixQrCodeBase64: string | null;

  @Column({ name: 'pix_expiration_date', type: 'timestamptz', nullable: true })
  pixExpirationDate: Date | null;

  @Column({ name: 'invoice_url', type: 'varchar', length: 500, nullable: true })
  invoiceUrl: string | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
