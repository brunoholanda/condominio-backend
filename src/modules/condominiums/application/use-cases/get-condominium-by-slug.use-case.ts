import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import type { Condominium } from '../../domain/entities/condominium';
import { CondominiumRepository } from '../../domain/repositories/condominium.repository';
import type { PublicCondominiumDto } from '../dto/condominium-response.dto';
import { CondominiumPresenter } from '../presenters/condominium.presenter';

/** Public lookup used by the condo's own landing page (`/c/:slug`). */
@Injectable()
export class GetCondominiumBySlugUseCase {
  constructor(private readonly condominiums: CondominiumRepository) {}

  async execute(slug: string): Promise<PublicCondominiumDto> {
    return CondominiumPresenter.toPublic(await this.getOrFail(slug));
  }

  async getOrFail(slug: string): Promise<Condominium> {
    const condominium = await this.condominiums.findBySlug(slug);

    if (!condominium) {
      throw new ResourceNotFoundError(`Condomínio "${slug}" não encontrado.`);
    }

    return condominium;
  }
}
