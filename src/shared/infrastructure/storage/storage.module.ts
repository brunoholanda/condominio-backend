import { Module } from '@nestjs/common';

import { FileStorage } from '../../application/ports/file-storage';
import { R2FileStorage } from './r2-file-storage';

@Module({
  providers: [{ provide: FileStorage, useClass: R2FileStorage }],
  exports: [FileStorage],
})
export class StorageModule {}
