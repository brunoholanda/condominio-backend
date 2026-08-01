import type { DeepPartial } from 'typeorm';

import { toIsoDate } from '../../../../../shared/application/date-format';
import type { ResidentSnapshot } from '../../../domain/entities/resident';
import { Resident } from '../../../domain/entities/resident';
import type { ResidentOrmEntity } from './entities/resident.orm-entity';

/** Translates between the persistence rows and the resident aggregate. */
export class ResidentMapper {
  static toDomain(row: ResidentOrmEntity): Resident {
    const snapshot: ResidentSnapshot = {
      id: row.id,
      unit: row.unit,
      occupancyType: row.occupancyType,
      fullName: row.fullName,
      rg: row.rg,
      cpf: row.cpf,
      email: row.email,
      landlinePhone: row.landlinePhone,
      mobilePhone: row.mobilePhone,
      movedInAt: new Date(row.movedInAt),
      emergencyContact: { name: row.emergencyContactName, phone: row.emergencyContactPhone },
      landlord:
        row.landlordName && row.landlordPhone
          ? { name: row.landlordName, phone: row.landlordPhone }
          : null,
      householdMembers: (row.householdMembers ?? []).map(({ fullName, rg, kinship }) => ({
        fullName,
        rg,
        kinship,
      })),
      employees: (row.employees ?? []).map(({ fullName, rg, role, workSchedule }) => ({
        fullName,
        rg,
        role,
        workSchedule,
      })),
      vehicles: (row.vehicles ?? []).map(({ brand, model, color, plate }) => ({
        brand,
        model,
        color,
        plate,
      })),
      pets: (row.pets ?? []).map(({ name, species, breed, color }) => ({
        name,
        species,
        breed,
        color,
      })),
      dataUsageConsent: row.dataUsageConsent,
      signature: row.signature,
      signedAt: new Date(row.signedAt),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return Resident.restore(snapshot);
  }

  /**
   * `createdAt`/`updatedAt` are intentionally left out: they are owned by the
   * database through TypeORM's date columns.
   */
  static toPersistence(resident: Resident): DeepPartial<ResidentOrmEntity> {
    const snapshot = resident.toSnapshot();

    return {
      id: snapshot.id,
      unit: snapshot.unit,
      occupancyType: snapshot.occupancyType,
      fullName: snapshot.fullName,
      rg: snapshot.rg,
      cpf: snapshot.cpf,
      email: snapshot.email,
      landlinePhone: snapshot.landlinePhone,
      mobilePhone: snapshot.mobilePhone,
      movedInAt: toIsoDate(snapshot.movedInAt),
      emergencyContactName: snapshot.emergencyContact.name,
      emergencyContactPhone: snapshot.emergencyContact.phone,
      landlordName: snapshot.landlord?.name ?? null,
      landlordPhone: snapshot.landlord?.phone ?? null,
      dataUsageConsent: snapshot.dataUsageConsent,
      signature: snapshot.signature,
      signedAt: snapshot.signedAt,
      householdMembers: snapshot.householdMembers,
      employees: snapshot.employees,
      vehicles: snapshot.vehicles,
      pets: snapshot.pets.map((pet) => ({ ...pet, breed: pet.breed ?? null })),
    };
  }
}
