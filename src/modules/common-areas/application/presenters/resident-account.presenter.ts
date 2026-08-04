import type { ResidentAccount } from '../../domain/entities/resident-account';
import type { ResidentAccountResponseDto } from '../dto/resident-account-response.dto';

export class ResidentAccountPresenter {
  static toResponse(account: ResidentAccount): ResidentAccountResponseDto {
    const snapshot = account.toSnapshot();

    return { ...snapshot, createdAt: snapshot.createdAt.toISOString() };
  }
}
