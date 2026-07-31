import { CreateResidentDto } from './create-resident.dto';

/**
 * Updates replace the whole aggregate (PUT semantics): children are always sent
 * in full, so the server never has to guess which rows were removed.
 */
export class UpdateResidentDto extends CreateResidentDto {}
