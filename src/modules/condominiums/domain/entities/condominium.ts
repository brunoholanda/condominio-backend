import { randomUUID } from 'node:crypto';

import { BusinessRuleError, InvalidFieldError } from '../../../../shared/domain/domain-error';
import { optionalText, requireDate, requireText } from '../../../../shared/domain/guards';
import {
  DEFAULT_PUBLIC_HUB_LINKS,
  normalizePublicHubLinks,
  type PublicHubLink,
} from '../public-qr-target';
import { Slug } from '../value-objects/slug';

const MAX_UNIT_LENGTH = 20;
const MIN_GEOFENCE_RADIUS = 50;
const MAX_GEOFENCE_RADIUS = 2000;
const DEFAULT_GEOFENCE_RADIUS = 100;

export interface CondominiumLocationProps {
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters?: number;
}

export interface CondominiumProps {
  name: string;
  slug: string;
  unitNumbers: string[];
  buildingHandoverDate?: Date | string | null;
  publicHubLinks?: PublicHubLink[];
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadiusMeters?: number | null;
}

export interface CondominiumSnapshot {
  id: string;
  name: string;
  slug: string;
  unitNumbers: string[];
  buildingHandoverDate: Date | null;
  publicHubLinks: PublicHubLink[];
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  geofenceRadiusMeters: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CondominiumState {
  id: string;
  name: string;
  slug: Slug;
  unitNumbers: string[];
  buildingHandoverDate: Date | null;
  publicHubLinks: PublicHubLink[];
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  geofenceRadiusMeters: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Aggregate root of a condo tenant: its identity, public slug and unit catalog. */
export class Condominium {
  private constructor(private readonly state: CondominiumState) {}

  static create(props: CondominiumProps): Condominium {
    const now = new Date();
    const parsed = Condominium.parse(props);

    if (!parsed.address || parsed.latitude === null || parsed.longitude === null) {
      throw new InvalidFieldError(
        'localização',
        'Informe o endereço e as coordenadas do condomínio para o ponto eletrônico.',
      );
    }

    return new Condominium({
      ...parsed,
      geofenceRadiusMeters: parsed.geofenceRadiusMeters ?? DEFAULT_GEOFENCE_RADIUS,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: CondominiumSnapshot): Condominium {
    return new Condominium({
      ...Condominium.parse(snapshot),
      id: snapshot.id,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  /** Returns a new aggregate with the same identity, applying the incoming data. */
  withData(props: CondominiumProps): Condominium {
    return new Condominium({
      ...Condominium.parse(props),
      id: this.state.id,
      createdAt: this.state.createdAt,
      updatedAt: new Date(),
    });
  }

  private static parse(
    props: CondominiumProps,
  ): Omit<CondominiumState, 'id' | 'createdAt' | 'updatedAt'> {
    const location = Condominium.parseLocation(props);

    return {
      name: requireText('nome', props.name, { min: 3, max: 150 }),
      slug: Slug.create(props.slug),
      unitNumbers: Condominium.parseUnitNumbers(props.unitNumbers),
      buildingHandoverDate: Condominium.parseHandoverDate(props.buildingHandoverDate),
      publicHubLinks: normalizePublicHubLinks(
        props.publicHubLinks ?? DEFAULT_PUBLIC_HUB_LINKS,
      ),
      ...location,
    };
  }

  private static parseLocation(props: CondominiumProps): {
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    geofenceRadiusMeters: number | null;
  } {
    const address = optionalText('endereço', props.address, { min: 5, max: 255 });
    const latitude = Condominium.parseCoordinate('latitude', props.latitude, -90, 90);
    const longitude = Condominium.parseCoordinate('longitude', props.longitude, -180, 180);
    const hasAny =
      address !== null || latitude !== null || longitude !== null || props.geofenceRadiusMeters != null;

    if (!hasAny) {
      return {
        address: null,
        latitude: null,
        longitude: null,
        geofenceRadiusMeters: null,
      };
    }

    if (!address || latitude === null || longitude === null) {
      throw new InvalidFieldError(
        'localização',
        'Informe endereço, latitude e longitude juntos.',
      );
    }

    const radius =
      props.geofenceRadiusMeters === null || props.geofenceRadiusMeters === undefined
        ? DEFAULT_GEOFENCE_RADIUS
        : Condominium.parseRadius(props.geofenceRadiusMeters);

    return {
      address,
      latitude,
      longitude,
      geofenceRadiusMeters: radius,
    };
  }

  private static parseCoordinate(
    field: string,
    value: unknown,
    min: number,
    max: number,
  ): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const num = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(num) || num < min || num > max) {
      throw new InvalidFieldError(field, `O campo "${field}" deve ser um número entre ${min} e ${max}.`);
    }

    return Math.round(num * 1e7) / 1e7;
  }

  private static parseRadius(value: unknown): number {
    const num = typeof value === 'number' ? value : Number(value);

    if (
      !Number.isFinite(num) ||
      !Number.isInteger(num) ||
      num < MIN_GEOFENCE_RADIUS ||
      num > MAX_GEOFENCE_RADIUS
    ) {
      throw new InvalidFieldError(
        'raio do geofence',
        `O raio deve ser um inteiro entre ${MIN_GEOFENCE_RADIUS} e ${MAX_GEOFENCE_RADIUS} metros.`,
      );
    }

    return num;
  }

  private static parseUnitNumbers(raw: string[]): string[] {
    if (!Array.isArray(raw) || raw.length === 0) {
      throw new InvalidFieldError('unidades', 'Informe ao menos uma unidade para o condomínio.');
    }

    const numbers = raw.map((value, index) => {
      const trimmed = String(value ?? '').trim();

      if (trimmed.length === 0 || trimmed.length > MAX_UNIT_LENGTH) {
        throw new InvalidFieldError(
          'unidades',
          `A unidade na posição ${index + 1} deve ter entre 1 e ${MAX_UNIT_LENGTH} caracteres.`,
        );
      }

      return trimmed;
    });

    const duplicated = numbers.find((number, index) => numbers.indexOf(number) !== index);

    if (duplicated) {
      throw new BusinessRuleError(`A unidade ${duplicated} foi informada mais de uma vez.`);
    }

    return numbers;
  }

  private static parseHandoverDate(raw?: Date | string | null): Date | null {
    if (raw === null || raw === undefined || raw === '') {
      return null;
    }

    return requireDate('data de entrega do prédio', raw);
  }

  hasLocation(): boolean {
    return (
      this.state.address !== null &&
      this.state.latitude !== null &&
      this.state.longitude !== null &&
      this.state.geofenceRadiusMeters !== null
    );
  }

  get id(): string {
    return this.state.id;
  }

  get name(): string {
    return this.state.name;
  }

  get slug(): Slug {
    return this.state.slug;
  }

  get unitNumbers(): string[] {
    return [...this.state.unitNumbers];
  }

  get publicHubLinks(): PublicHubLink[] {
    return [...this.state.publicHubLinks];
  }

  get address(): string | null {
    return this.state.address;
  }

  get latitude(): number | null {
    return this.state.latitude;
  }

  get longitude(): number | null {
    return this.state.longitude;
  }

  get geofenceRadiusMeters(): number | null {
    return this.state.geofenceRadiusMeters;
  }

  toSnapshot(): CondominiumSnapshot {
    const { state } = this;

    return {
      id: state.id,
      name: state.name,
      slug: state.slug.value,
      unitNumbers: [...state.unitNumbers],
      buildingHandoverDate: state.buildingHandoverDate,
      publicHubLinks: state.publicHubLinks,
      address: state.address,
      latitude: state.latitude,
      longitude: state.longitude,
      geofenceRadiusMeters: state.geofenceRadiusMeters,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    };
  }
}
