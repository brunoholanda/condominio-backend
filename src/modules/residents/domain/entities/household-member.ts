import { requireText } from '../../../../shared/domain/guards';

export interface HouseholdMemberProps {
  fullName: string;
  rg: string;
  kinship: string;
}

/** Somebody else who lives in the unit ("demais moradores da unidade"). */
export class HouseholdMember {
  readonly fullName: string;
  readonly rg: string;
  readonly kinship: string;

  private constructor(props: HouseholdMemberProps) {
    this.fullName = props.fullName;
    this.rg = props.rg;
    this.kinship = props.kinship;
  }

  static create(props: HouseholdMemberProps): HouseholdMember {
    return new HouseholdMember({
      fullName: requireText('nome do morador', props.fullName, { min: 3, max: 150 }),
      rg: requireText('RG do morador', props.rg, { min: 5, max: 20 }),
      kinship: requireText('grau de parentesco', props.kinship, { min: 2, max: 60 }),
    });
  }
}
