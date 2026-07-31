import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ResidentOrmEntity } from './resident.orm-entity';

@Entity('resident_vehicles')
export class VehicleOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'resident_id', type: 'uuid' })
  residentId: string;

  @Column({ name: 'brand', type: 'varchar', length: 60 })
  brand: string;

  @Column({ name: 'model', type: 'varchar', length: 60 })
  model: string;

  @Column({ name: 'color', type: 'varchar', length: 40 })
  color: string;

  @Index('idx_resident_vehicles_plate')
  @Column({ name: 'plate', type: 'varchar', length: 7 })
  plate: string;

  @ManyToOne(() => ResidentOrmEntity, (resident) => resident.vehicles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resident_id' })
  resident: ResidentOrmEntity;
}
