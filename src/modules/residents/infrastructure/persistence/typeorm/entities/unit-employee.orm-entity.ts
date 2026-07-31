import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ResidentOrmEntity } from './resident.orm-entity';

@Entity('resident_employees')
export class UnitEmployeeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'resident_id', type: 'uuid' })
  residentId: string;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName: string;

  @Column({ name: 'rg', type: 'varchar', length: 20 })
  rg: string;

  @Column({ name: 'role', type: 'varchar', length: 60 })
  role: string;

  @Column({ name: 'work_schedule', type: 'varchar', length: 60 })
  workSchedule: string;

  @ManyToOne(() => ResidentOrmEntity, (resident) => resident.employees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resident_id' })
  resident: ResidentOrmEntity;
}
