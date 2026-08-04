import { PartialType } from '@nestjs/swagger';

import { CreateUsefulContactDto } from './create-useful-contact.dto';

export class UpdateUsefulContactDto extends PartialType(CreateUsefulContactDto) {}
