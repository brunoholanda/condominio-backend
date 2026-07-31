import type { RelationOptions } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OccupancyType } from '../../../../domain/enums/occupancy-type';
import { HouseholdMemberOrmEntity } from './household-member.orm-entity';
import { PetOrmEntity } from './pet.orm-entity';
import { UnitEmployeeOrmEntity } from './unit-employee.orm-entity';
import { VehicleOrmEntity } from './vehicle.orm-entity';

/** Children are rewritten as a whole by the repository, so only inserts cascade. */
const CASCADE_CHILDREN: RelationOptions = { cascade: ['insert'], eager: true };

@Entity('residents')
export class ResidentOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index('idx_residents_unit')
  @Column({ name: 'unit', type: 'varchar', length: 20 })
  unit: string;

  @Column({ name: 'occupancy_type', type: 'varchar', length: 10 })
  occupancyType: OccupancyType;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName: string;

  @Column({ name: 'rg', type: 'varchar', length: 20 })
  rg: string;

  @Index('idx_residents_cpf', { unique: true })
  @Column({ name: 'cpf', type: 'varchar', length: 11 })
  cpf: string;

  @Column({ name: 'email', type: 'varchar', length: 254 })
  email: string;

  @Column({ name: 'landline_phone', type: 'varchar', length: 11, nullable: true })
  landlinePhone: string | null;

  @Column({ name: 'mobile_phone', type: 'varchar', length: 11 })
  mobilePhone: string;

  @Column({ name: 'moved_in_at', type: 'date' })
  movedInAt: string;

  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 150 })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 11 })
  emergencyContactPhone: string;

  @Column({ name: 'landlord_name', type: 'varchar', length: 150, nullable: true })
  landlordName: string | null;

  @Column({ name: 'landlord_phone', type: 'varchar', length: 11, nullable: true })
  landlordPhone: string | null;

  @Column({ name: 'data_usage_consent', type: 'boolean' })
  dataUsageConsent: boolean;

  /** Base64 data URL of the handwritten signature, capped at 256 KB by the domain. */
  @Column({ name: 'signature', type: 'text' })
  signature: string;

  @Column({ name: 'signed_at', type: 'date' })
  signedAt: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => HouseholdMemberOrmEntity, (member) => member.resident, CASCADE_CHILDREN)
  householdMembers: HouseholdMemberOrmEntity[];

  @OneToMany(() => UnitEmployeeOrmEntity, (employee) => employee.resident, CASCADE_CHILDREN)
  employees: UnitEmployeeOrmEntity[];

  @OneToMany(() => VehicleOrmEntity, (vehicle) => vehicle.resident, CASCADE_CHILDREN)
  vehicles: VehicleOrmEntity[];

  @OneToMany(() => PetOrmEntity, (pet) => pet.resident, CASCADE_CHILDREN)
  pets: PetOrmEntity[];
}
