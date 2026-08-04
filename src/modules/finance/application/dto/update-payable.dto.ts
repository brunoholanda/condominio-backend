import { CreatePayableDto } from './create-payable.dto';

/** Updates replace the whole payable (PUT semantics), only while it is pending. */
export class UpdatePayableDto extends CreatePayableDto {}
