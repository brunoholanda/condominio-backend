import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ResidentOrmEntity } from './resident.orm-entity';

@Entity('resident_household_members')
export class HouseholdMemberOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'resident_id', type: 'uuid' })
  residentId: string;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName: string;

  @Column({ name: 'rg', type: 'varchar', length: 20 })
  rg: string;

  @Column({ name: 'kinship', type: 'varchar', length: 60 })
  kinship: string;

  @ManyToOne(() => ResidentOrmEntity, (resident) => resident.householdMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resident_id' })
  resident: ResidentOrmEntity;
}
