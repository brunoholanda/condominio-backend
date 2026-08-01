import type { PaginatedResult } from '../../../../shared/application/paginated-result';
import { toIsoDate } from '../../../../shared/application/date-format';
import type { Resident } from '../../domain/entities/resident';
import type {
  PaginatedResidentsResponseDto,
  ResidentListItemDto,
  ResidentResponseDto,
} from '../dto/resident-response.dto';

/** Translates the aggregate into the API contract. Values stay unformatted; the UI formats them. */
export class ResidentPresenter {
  static toResponse(resident: Resident): ResidentResponseDto {
    const snapshot = resident.toSnapshot();

    return {
      ...snapshot,
      movedInAt: toIsoDate(snapshot.movedInAt),
      signedAt: snapshot.signedAt.toISOString(),
      createdAt: snapshot.createdAt.toISOString(),
      updatedAt: snapshot.updatedAt.toISOString(),
      pets: snapshot.pets.map((pet) => ({ ...pet, breed: pet.breed ?? null })),
    };
  }

  /** Mesmo contrato do detalhe, sem a assinatura: a lista não precisa dela. */
  static toListItem(resident: Resident): ResidentListItemDto {
    const { signature: _signature, ...item } = ResidentPresenter.toResponse(resident);

    return item;
  }

  static toPaginatedResponse(result: PaginatedResult<Resident>): PaginatedResidentsResponseDto {
    return {
      ...result,
      items: result.items.map((resident) => ResidentPresenter.toListItem(resident)),
    };
  }
}
