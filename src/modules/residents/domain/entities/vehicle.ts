import { requireText } from '../../../../shared/domain/guards';
import { LicensePlate } from '../../../../shared/domain/value-objects/license-plate';

export interface VehicleProps {
  brand: string;
  model: string;
  color: string;
  plate: string;
}

/** Vehicle authorized to use the condominium parking ("veículos da unidade"). */
export class Vehicle {
  readonly brand: string;
  readonly model: string;
  readonly color: string;
  readonly plate: LicensePlate;

  private constructor(brand: string, model: string, color: string, plate: LicensePlate) {
    this.brand = brand;
    this.model = model;
    this.color = color;
    this.plate = plate;
  }

  static create(props: VehicleProps): Vehicle {
    return new Vehicle(
      requireText('marca', props.brand, { min: 2, max: 60 }),
      requireText('modelo', props.model, { min: 1, max: 60 }),
      requireText('cor', props.color, { min: 3, max: 40 }),
      LicensePlate.create(props.plate),
    );
  }
}
