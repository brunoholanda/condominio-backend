import { optionalText, requireEnum, requireText } from '../../../../shared/domain/guards';
import { PetSpecies } from '../enums/pet-species';

export interface PetProps {
  name: string;
  species: PetSpecies;
  breed?: string | null;
  color: string;
}

/** Pet kept in the unit ("animais de estimação"). */
export class Pet {
  readonly name: string;
  readonly species: PetSpecies;
  readonly breed: string | null;
  readonly color: string;

  private constructor(name: string, species: PetSpecies, breed: string | null, color: string) {
    this.name = name;
    this.species = species;
    this.breed = breed;
    this.color = color;
  }

  static create(props: PetProps): Pet {
    return new Pet(
      requireText('nome do animal', props.name, { min: 1, max: 60 }),
      requireEnum('espécie', props.species, PetSpecies),
      optionalText('raça', props.breed, { min: 2, max: 60 }),
      requireText('cor do animal', props.color, { min: 3, max: 40 }),
    );
  }
}
