import { OccupancyType } from '../../domain/enums/occupancy-type';
import { PetSpecies } from '../../domain/enums/pet-species';

/**
 * The API keeps enums in English and lets the UI translate them. A printed
 * document has no UI, so the report carries its own Portuguese labels.
 */
export const OCCUPANCY_TYPE_LABELS: Record<OccupancyType, string> = {
  [OccupancyType.Owner]: 'Proprietário',
  [OccupancyType.Tenant]: 'Inquilino',
};

export const PET_SPECIES_LABELS: Record<PetSpecies, string> = {
  [PetSpecies.Dog]: 'Cachorro',
  [PetSpecies.Cat]: 'Gato',
  [PetSpecies.Bird]: 'Ave',
  [PetSpecies.Fish]: 'Peixe',
  [PetSpecies.Rodent]: 'Roedor',
  [PetSpecies.Reptile]: 'Réptil',
  [PetSpecies.Other]: 'Outro',
};
