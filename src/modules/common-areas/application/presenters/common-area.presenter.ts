import type { CommonArea } from '../../domain/entities/common-area';
import type { CommonAreaResponseDto } from '../dto/common-area-response.dto';

export class CommonAreaPresenter {
  static toResponse(area: CommonArea): CommonAreaResponseDto {
    const snapshot = area.toSnapshot();

    return {
      ...snapshot,
      createdAt: snapshot.createdAt.toISOString(),
      updatedAt: snapshot.updatedAt.toISOString(),
    };
  }
}
