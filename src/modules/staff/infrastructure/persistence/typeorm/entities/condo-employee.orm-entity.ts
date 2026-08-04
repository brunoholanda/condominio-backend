import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('condo_employees')
@Index('idx_condo_employees_condo_cpf', ['condominiumId', 'cpf'], { unique: true })
export class CondoEmployeeOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName: string;

  @Column({ name: 'cpf', type: 'varchar', length: 11 })
  cpf: string;

  @Column({ name: 'rg', type: 'varchar', length: 20, nullable: true })
  rg: string | null;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: string | null;

  @Column({ name: 'gender', type: 'varchar', length: 20, nullable: true })
  gender: string | null;

  @Column({ name: 'marital_status', type: 'varchar', length: 30, nullable: true })
  maritalStatus: string | null;

  @Column({ name: 'nationality', type: 'varchar', length: 80, nullable: true })
  nationality: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'email', type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ name: 'address', type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ name: 'state', type: 'varchar', length: 2, nullable: true })
  state: string | null;

  @Column({ name: 'zip_code', type: 'varchar', length: 8, nullable: true })
  zipCode: string | null;

  @Column({ name: 'job_title', type: 'varchar', length: 100 })
  jobTitle: string;

  @Column({ name: 'department', type: 'varchar', length: 100, nullable: true })
  department: string | null;

  @Column({ name: 'admission_date', type: 'date', nullable: true })
  admissionDate: string | null;

  @Column({ name: 'contract_type', type: 'varchar', length: 20, default: 'CLT' })
  contractType: string;

  @Column({ name: 'work_schedule', type: 'varchar', length: 200, nullable: true })
  workSchedule: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'salary', type: 'numeric', precision: 12, scale: 2, nullable: true })
  salary: string | null;

  @Column({ name: 'benefits', type: 'jsonb', default: () => "'[]'" })
  benefits: { name: string; value?: number | null }[];

  @Column({ name: 'bank_name', type: 'varchar', length: 100, nullable: true })
  bankName: string | null;

  @Column({ name: 'bank_code', type: 'varchar', length: 10, nullable: true })
  bankCode: string | null;

  @Column({ name: 'agency', type: 'varchar', length: 20, nullable: true })
  agency: string | null;

  @Column({ name: 'account_number', type: 'varchar', length: 30, nullable: true })
  accountNumber: string | null;

  @Column({ name: 'account_type', type: 'varchar', length: 20, nullable: true })
  accountType: string | null;

  @Column({ name: 'pix_key', type: 'varchar', length: 120, nullable: true })
  pixKey: string | null;

  @Column({ name: 'pin_hash', type: 'varchar', length: 255 })
  pinHash: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
