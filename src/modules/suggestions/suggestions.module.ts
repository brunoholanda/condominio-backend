import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CondominiumsModule } from '../condominiums/condominiums.module';
import { ResidentsModule } from '../residents/residents.module';
import { CreateSuggestionUseCase } from './application/use-cases/create-suggestion.use-case';
import { ListSuggestionsUseCase } from './application/use-cases/list-suggestions.use-case';
import { MarkSuggestionAsReadUseCase } from './application/use-cases/mark-suggestion-as-read.use-case';
import { VerifySuggestionIdentityUseCase } from './application/use-cases/verify-suggestion-identity.use-case';
import { SuggestionRepository } from './domain/repositories/suggestion.repository';
import { SuggestionOrmEntity } from './infrastructure/persistence/typeorm/entities/suggestion.orm-entity';
import { TypeormSuggestionRepository } from './infrastructure/persistence/typeorm/typeorm-suggestion.repository';
import { PublicSuggestionsController } from './presentation/public-suggestions.controller';
import { SuggestionsController } from './presentation/suggestions.controller';

@Module({
  imports: [
    CondominiumsModule,
    ResidentsModule,
    TypeOrmModule.forFeature([SuggestionOrmEntity]),
  ],
  controllers: [PublicSuggestionsController, SuggestionsController],
  providers: [
    { provide: SuggestionRepository, useClass: TypeormSuggestionRepository },
    VerifySuggestionIdentityUseCase,
    CreateSuggestionUseCase,
    ListSuggestionsUseCase,
    MarkSuggestionAsReadUseCase,
  ],
})
export class SuggestionsModule {}
