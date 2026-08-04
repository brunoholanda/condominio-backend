import type { Package } from '../../domain/entities/package';
import type { PackageListItemDto, PackageResponseDto } from '../dto/package-response.dto';

export class PackagePresenter {
  static toListItem(parcel: Package): PackageListItemDto {
    const snapshot = parcel.toSnapshot();

    return {
      id: snapshot.id,
      unitNumber: snapshot.unitNumber,
      description: snapshot.description,
      carrier: snapshot.carrier,
      status: snapshot.status,
      receivedAt: snapshot.receivedAt.toISOString(),
      deliveredAt: snapshot.deliveredAt?.toISOString() ?? null,
      recipientName: snapshot.recipientName,
      notes: snapshot.notes,
    };
  }

  static toResponse(parcel: Package): PackageResponseDto {
    const snapshot = parcel.toSnapshot();

    return {
      ...PackagePresenter.toListItem(parcel),
      condominiumId: snapshot.condominiumId,
      receivedByUserId: snapshot.receivedByUserId,
      deliveredByUserId: snapshot.deliveredByUserId,
      signature: snapshot.signature,
      createdAt: snapshot.createdAt.toISOString(),
      updatedAt: snapshot.updatedAt.toISOString(),
    };
  }
}
