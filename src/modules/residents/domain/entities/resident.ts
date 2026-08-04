import { randomUUID } from 'node:crypto';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import {
  optionalText,
  requireDate,
  requireEnum,
  requireNotInFuture,
  requireText,
  requireTrue,
} from '../../../../shared/domain/guards';
import { Cpf } from '../../../../shared/domain/value-objects/cpf';
import { EmailAddress } from '../../../../shared/domain/value-objects/email-address';
import { PhoneNumber } from '../../../../shared/domain/value-objects/phone-number';
import { SignatureImage } from '../../../../shared/domain/value-objects/signature-image';
import { OccupancyType } from '../enums/occupancy-type';
import { Unit } from '../value-objects/unit';
import type { ContactPersonProps } from './contact-person';
import { ContactPerson } from './contact-person';
import type { HouseholdMemberProps } from './household-member';
import { HouseholdMember } from './household-member';
import type { PetProps } from './pet';
import { Pet } from './pet';
import type { UnitEmployeeProps } from './unit-employee';
import { UnitEmployee } from './unit-employee';
import type { VehicleProps } from './vehicle';
import { Vehicle } from './vehicle';

/** Raw input accepted by the aggregate, mirroring the paper form. */
export interface ResidentProps {
  condominiumId: string;
  unit: string;
  occupancyType: OccupancyType | string;
  fullName: string;
  rg: string;
  cpf: string;
  email: string;
  landlinePhone?: string | null;
  mobilePhone: string;
  movedInAt: Date | string;
  emergencyContact: ContactPersonProps;
  landlord?: ContactPersonProps | null;
  householdMembers?: HouseholdMemberProps[];
  employees?: UnitEmployeeProps[];
  vehicles?: VehicleProps[];
  pets?: PetProps[];
  dataUsageConsent: boolean;
  signature: string;
}

/** Flat, primitive-only view of the aggregate, consumed by persistence and presentation. */
export interface ResidentSnapshot {
  id: string;
  condominiumId: string;
  unit: string;
  occupancyType: OccupancyType;
  fullName: string;
  rg: string;
  cpf: string;
  email: string;
  landlinePhone: string | null;
  mobilePhone: string;
  movedInAt: Date;
  emergencyContact: { name: string; phone: string };
  landlord: { name: string; phone: string } | null;
  householdMembers: HouseholdMemberProps[];
  employees: UnitEmployeeProps[];
  vehicles: VehicleProps[];
  pets: PetProps[];
  dataUsageConsent: boolean;
  signature: string;
  signedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ResidentState {
  id: string;
  condominiumId: string;
  unit: Unit;
  occupancyType: OccupancyType;
  fullName: string;
  rg: string;
  cpf: Cpf;
  email: EmailAddress;
  landlinePhone: PhoneNumber | null;
  mobilePhone: PhoneNumber;
  movedInAt: Date;
  emergencyContact: ContactPerson;
  landlord: ContactPerson | null;
  householdMembers: HouseholdMember[];
  employees: UnitEmployee[];
  vehicles: Vehicle[];
  pets: Pet[];
  dataUsageConsent: boolean;
  signature: SignatureImage;
  signedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate root of the resident registration form.
 *
 * Children (household members, employees, vehicles and pets) have no identity of
 * their own: they only exist as part of a resident and are always replaced as a
 * whole, which keeps the consistency boundary explicit.
 */
export class Resident {
  private constructor(private readonly state: ResidentState) {}

  static create(props: ResidentProps): Resident {
    const now = new Date();

    return new Resident({
      ...Resident.parse(props),
      id: randomUUID(),
      // The signature is dated here, by the server clock: it records when the
      // form was signed and is never taken from the client.
      signedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Rebuilds an aggregate already persisted, preserving its identity and timestamps. */
  static restore(snapshot: ResidentSnapshot): Resident {
    return new Resident({
      ...Resident.parse(snapshot),
      id: snapshot.id,
      signedAt: snapshot.signedAt,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  /** Returns a new aggregate with the same identity and the incoming data applied. */
  withData(props: ResidentProps): Resident {
    return new Resident({
      ...Resident.parse(props),
      id: this.state.id,
      signedAt: this.state.signedAt,
      createdAt: this.state.createdAt,
      updatedAt: new Date(),
    });
  }

  private static parse(
    props: ResidentProps,
  ): Omit<ResidentState, 'id' | 'signedAt' | 'createdAt' | 'updatedAt'> {
    const occupancyType = requireEnum('tipo de ocupação', props.occupancyType, OccupancyType);
    const vehicles = (props.vehicles ?? []).map((vehicle) => Vehicle.create(vehicle));

    Resident.assertPlatesAreUnique(vehicles);

    return {
      condominiumId: requireText('condomínio', props.condominiumId, { min: 1, max: 64 }),
      unit: Unit.create(props.unit, 'unidade/apartamento'),
      occupancyType,
      fullName: requireText('nome completo', props.fullName, { min: 3, max: 150 }),
      rg: requireText('RG', props.rg, { min: 5, max: 20 }),
      cpf: Cpf.create(props.cpf),
      email: EmailAddress.create(props.email),
      landlinePhone: Resident.parseOptionalPhone(props.landlinePhone),
      mobilePhone: PhoneNumber.create(props.mobilePhone, 'celular'),
      movedInAt: requireNotInFuture(
        'data da mudança',
        requireDate('data da mudança', props.movedInAt),
      ),
      emergencyContact: ContactPerson.create(props.emergencyContact, 'contato de emergência'),
      landlord: Resident.parseLandlord(occupancyType, props.landlord),
      householdMembers: (props.householdMembers ?? []).map((member) =>
        HouseholdMember.create(member),
      ),
      employees: (props.employees ?? []).map((employee) => UnitEmployee.create(employee)),
      vehicles,
      pets: (props.pets ?? []).map((pet) => Pet.create(pet)),
      dataUsageConsent: requireTrue(
        'autorização de uso dos dados',
        props.dataUsageConsent,
        'É necessário autorizar o uso dos dados para concluir o cadastro.',
      ),
      signature: SignatureImage.create(props.signature),
    };
  }

  private static parseOptionalPhone(value?: string | null): PhoneNumber | null {
    const text = optionalText('telefone', value, { min: 10, max: 20 });

    return text === null ? null : PhoneNumber.create(text, 'telefone');
  }

  /** A tenant must always disclose who owns or manages the unit. */
  private static parseLandlord(
    occupancyType: OccupancyType,
    landlord?: ContactPersonProps | null,
  ): ContactPerson | null {
    if (occupancyType === OccupancyType.Owner) {
      return null;
    }

    if (!landlord) {
      throw new BusinessRuleError(
        'Para inquilinos é obrigatório informar o proprietário ou a administradora do imóvel.',
      );
    }

    return ContactPerson.create(landlord, 'proprietário/administradora');
  }

  private static assertPlatesAreUnique(vehicles: Vehicle[]): void {
    const plates = vehicles.map((vehicle) => vehicle.plate.value);
    const duplicated = plates.find((plate, index) => plates.indexOf(plate) !== index);

    if (duplicated) {
      throw new BusinessRuleError(`A placa ${duplicated} foi informada mais de uma vez.`);
    }
  }

  get id(): string {
    return this.state.id;
  }

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  get unit(): Unit {
    return this.state.unit;
  }

  get cpf(): Cpf {
    return this.state.cpf;
  }

  get fullName(): string {
    return this.state.fullName;
  }

  get isTenant(): boolean {
    return this.state.occupancyType === OccupancyType.Tenant;
  }

  toSnapshot(): ResidentSnapshot {
    const { state } = this;

    return {
      id: state.id,
      condominiumId: state.condominiumId,
      unit: state.unit.value,
      occupancyType: state.occupancyType,
      fullName: state.fullName,
      rg: state.rg,
      cpf: state.cpf.value,
      email: state.email.value,
      landlinePhone: state.landlinePhone?.value ?? null,
      mobilePhone: state.mobilePhone.value,
      movedInAt: state.movedInAt,
      emergencyContact: {
        name: state.emergencyContact.name,
        phone: state.emergencyContact.phone.value,
      },
      landlord: state.landlord
        ? { name: state.landlord.name, phone: state.landlord.phone.value }
        : null,
      householdMembers: state.householdMembers.map((member) => ({ ...member })),
      employees: state.employees.map((employee) => ({ ...employee })),
      vehicles: state.vehicles.map((vehicle) => ({
        brand: vehicle.brand,
        model: vehicle.model,
        color: vehicle.color,
        plate: vehicle.plate.value,
      })),
      pets: state.pets.map((pet) => ({ ...pet })),
      dataUsageConsent: state.dataUsageConsent,
      signature: state.signature.value,
      signedAt: state.signedAt,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    };
  }
}
