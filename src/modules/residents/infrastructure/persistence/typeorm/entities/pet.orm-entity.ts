import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PetSpecies } from '../../../../domain/enums/pet-species';
import { ResidentOrmEntity } from './resident.orm-entity';

@Entity('resident_pets')
export class PetOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'resident_id', type: 'uuid' })
  residentId: string;

  @Column({ name: 'name', type: 'varchar', length: 60 })
  name: string;

  @Column({ name: 'species', type: 'varchar', length: 20 })
  species: PetSpecies;

  @Column({ name: 'breed', type: 'varchar', length: 60, nullable: true })
  breed: string | null;

  @Column({ name: 'color', type: 'varchar', length: 40 })
  color: string;

  @ManyToOne(() => ResidentOrmEntity, (resident) => resident.pets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resident_id' })
  resident: ResidentOrmEntity;
}
