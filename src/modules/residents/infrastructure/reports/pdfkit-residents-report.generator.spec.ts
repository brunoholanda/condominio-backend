import type { ResidentResponseDto } from '../../application/dto/resident-response.dto';
import { OccupancyType } from '../../domain/enums/occupancy-type';
import { PetSpecies } from '../../domain/enums/pet-species';
import { PdfKitResidentsReportGenerator } from './pdfkit-residents-report.generator';

/** 1x1 transparent PNG, enough for PDFKit to embed an image. */
const SIGNATURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function makeResident(overrides: Partial<ResidentResponseDto> = {}): ResidentResponseDto {
  return {
    id: '2f1a1d6e-4f5b-4f4b-9f0a-0b6f1a2c3d4e',
    unit: '101',
    occupancyType: OccupancyType.Owner,
    fullName: 'Carlos Eduardo Pereira',
    rg: '12.345.678-9',
    cpf: '52998224725',
    email: 'carlos@exemplo.com.br',
    landlinePhone: null,
    mobilePhone: '11988887777',
    movedInAt: '2023-03-15',
    emergencyContact: { name: 'Maria Souza', phone: '11977776666' },
    landlord: null,
    householdMembers: [],
    employees: [],
    vehicles: [],
    pets: [],
    dataUsageConsent: true,
    signature: SIGNATURE,
    signedAt: '2024-01-20T13:45:12.000Z',
    createdAt: '2024-01-20T13:45:12.000Z',
    updatedAt: '2024-01-20T13:45:12.000Z',
    ...overrides,
  };
}

function countPages(pdf: Buffer): number {
  return pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length ?? 0;
}

describe('PdfKitResidentsReportGenerator', () => {
  const generator = new PdfKitResidentsReportGenerator();
  const context = { requestedBy: 'sindico@exemplo.com.br' };

  it('produces a PDF with one page per resident', async () => {
    const tenant = makeResident({
      id: '3c2b1a09-8765-4321-9abc-def012345678',
      unit: '202',
      occupancyType: OccupancyType.Tenant,
      fullName: 'Ana Beatriz Lima',
      landlord: { name: 'Imobiliária Central', phone: '1133334444' },
      householdMembers: [{ fullName: 'João Lima', rg: '98.765.432-1', kinship: 'Filho(a)' }],
      employees: [
        { fullName: 'Rosa Dias', rg: '11.222.333-4', role: 'Diarista', workSchedule: 'Seg e Qua' },
      ],
      vehicles: [{ brand: 'Fiat', model: 'Argo', color: 'Prata', plate: 'ABC1D23' }],
      pets: [{ name: 'Mel', species: PetSpecies.Dog, breed: null, color: 'Caramelo' }],
    });

    const pdf = await generator.generate([makeResident(), tenant], context);

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(countPages(pdf)).toBe(2);
  });

  it('keeps a resident with long collections in the document', async () => {
    const crowded = makeResident({
      householdMembers: Array.from({ length: 20 }, (_, index) => ({
        fullName: `Morador adicional ${index + 1}`,
        rg: '98.765.432-1',
        kinship: 'Filho(a)',
      })),
    });

    const pdf = await generator.generate([crowded], context);

    expect(countPages(pdf)).toBeGreaterThan(1);
  });
});
