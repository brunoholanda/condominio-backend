import type { CommonArea } from '../entities/common-area';

export abstract class CommonAreaRepository {
  abstract save(area: CommonArea): Promise<CommonArea>;

  abstract findById(id: string, condominiumId: string): Promise<CommonArea | null>;

  abstract findManyByCondo(condominiumId: string, onlyActive?: boolean): Promise<CommonArea[]>;

  abstract delete(id: string, condominiumId: string): Promise<void>;
}
