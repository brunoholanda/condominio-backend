import { requireText } from '../../../../shared/domain/guards';

export interface UnitEmployeeProps {
  fullName: string;
  rg: string;
  role: string;
  workSchedule: string;
}

/** Domestic worker registered for the unit ("funcionário(s) da unidade"). */
export class UnitEmployee {
  readonly fullName: string;
  readonly rg: string;
  readonly role: string;
  readonly workSchedule: string;

  private constructor(props: UnitEmployeeProps) {
    this.fullName = props.fullName;
    this.rg = props.rg;
    this.role = props.role;
    this.workSchedule = props.workSchedule;
  }

  static create(props: UnitEmployeeProps): UnitEmployee {
    return new UnitEmployee({
      fullName: requireText('nome do funcionário', props.fullName, { min: 3, max: 150 }),
      rg: requireText('RG do funcionário', props.rg, { min: 5, max: 20 }),
      role: requireText('cargo', props.role, { min: 2, max: 60 }),
      workSchedule: requireText('expediente', props.workSchedule, { min: 2, max: 60 }),
    });
  }
}
