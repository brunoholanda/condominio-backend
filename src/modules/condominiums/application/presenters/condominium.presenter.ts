import { toIsoDate } from '../../../../shared/application/date-format';
import type { Condominium } from '../../domain/entities/condominium';
import type { MembershipRole } from '../../domain/enums/membership-role';
import type { CondominiumResponseDto, PublicCondominiumDto } from '../dto/condominium-response.dto';

export class CondominiumPresenter {
  static toResponse(condominium: Condominium, myRole?: MembershipRole): CondominiumResponseDto {
    const snapshot = condominium.toSnapshot();

    return {
      id: snapshot.id,
      name: snapshot.name,
      slug: snapshot.slug,
      buildingHandoverDate: snapshot.buildingHandoverDate
        ? toIsoDate(snapshot.buildingHandoverDate)
        : null,
      unitNumbers: snapshot.unitNumbers,
      publicHubLinks: snapshot.publicHubLinks,
      address: snapshot.address,
      latitude: snapshot.latitude,
      longitude: snapshot.longitude,
      geofenceRadiusMeters: snapshot.geofenceRadiusMeters,
      myRole,
      createdAt: snapshot.createdAt.toISOString(),
      updatedAt: snapshot.updatedAt.toISOString(),
    };
  }

  static toPublic(condominium: Condominium): PublicCondominiumDto {
    return {
      id: condominium.id,
      name: condominium.name,
      slug: condominium.slug.value,
      publicHubLinks: condominium.publicHubLinks,
    };
  }
}
