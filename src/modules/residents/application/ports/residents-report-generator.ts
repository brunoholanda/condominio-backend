import type { ResidentResponseDto } from '../dto/resident-response.dto';

/** Who asked for the file: printed on every page, so a leaked copy has an origin. */
export interface ReportContext {
  requestedBy: string;
  condominiumName: string;
}

/**
 * Port used to turn registrations into a printable file.
 *
 * Declared as an abstract class so it doubles as the Nest injection token,
 * keeping the use case unaware of which library draws the document.
 */
export abstract class ResidentsReportGenerator {
  abstract generate(residents: ResidentResponseDto[], context: ReportContext): Promise<Buffer>;
}
