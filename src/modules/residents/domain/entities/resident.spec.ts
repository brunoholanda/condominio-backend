import { BusinessRuleError, InvalidFieldError } from '../../../../shared/domain/domain-error';
import { MAX_SIGNATURE_BYTES } from '../../../../shared/domain/value-objects/signature-image';
import { OccupancyType } from '../enums/occupancy-type';
import { PetSpecies } from '../enums/pet-species';
import type { ResidentProps } from './resident';
import { Resident } from './resident';

const SIGNATURE = `data:image/png;base64,${Buffer.from('assinatura').toString('base64')}`;

function makeSignatureOf(bytes: number): string {
  return `data:image/png;base64,${'A'.repeat(Math.ceil(bytes / 3) * 4)}`;
}

function makeProps(overrides: Partial<ResidentProps> = {}): ResidentProps {
  return {
    unit: 'a-101',
    occupancyType: OccupancyType.Owner,
    fullName: 'Carlos   Eduardo Pereira',
    rg: '12.345.678-9',
    cpf: '529.982.247-25',
    email: 'Carlos@Exemplo.com.br',
    landlinePhone: null,
    mobilePhone: '(11) 98888-7777',
    movedInAt: '2023-03-15',
    emergencyContact: { name: 'Maria Souza', phone: '11988886666' },
    householdMembers: [{ fullName: 'João Souza', rg: '11.222.333-4', kinship: 'Filho' }],
    vehicles: [{ brand: 'Volkswagen', model: 'Polo', color: 'Prata', plate: 'abc1d23' }],
    pets: [{ name: 'Rex', species: PetSpecies.Dog, breed: 'Labrador', color: 'Caramelo' }],
    dataUsageConsent: true,
    signature: SIGNATURE,
    signedAt: '2024-01-20',
    ...overrides,
  };
}

describe('Resident', () => {
  it('normalizes the data typed on the form', () => {
    const snapshot = Resident.create(makeProps()).toSnapshot();

    expect(snapshot.unit).toBe('A-101');
    expect(snapshot.fullName).toBe('Carlos Eduardo Pereira');
    expect(snapshot.cpf).toBe('52998224725');
    expect(snapshot.email).toBe('carlos@exemplo.com.br');
    expect(snapshot.mobilePhone).toBe('11988887777');
    expect(snapshot.vehicles[0].plate).toBe('ABC1D23');
  });

  it('drops landlord data when the resident owns the unit', () => {
    const props = makeProps({ landlord: { name: 'Imobiliária XPTO', phone: '1132165498' } });

    expect(Resident.create(props).toSnapshot().landlord).toBeNull();
  });

  it('requires landlord data from tenants', () => {
    const props = makeProps({ occupancyType: OccupancyType.Tenant, landlord: null });

    expect(() => Resident.create(props)).toThrow(BusinessRuleError);
  });

  it('rejects registrations without the data usage consent', () => {
    expect(() => Resident.create(makeProps({ dataUsageConsent: false }))).toThrow(
      InvalidFieldError,
    );
  });

  it('rejects a signature that is not an image data URL', () => {
    expect(() => Resident.create(makeProps({ signature: 'assinado' }))).toThrow(InvalidFieldError);
  });

  it('rejects a signature heavier than the storage limit', () => {
    const props = makeProps({ signature: makeSignatureOf(MAX_SIGNATURE_BYTES + 1024) });

    expect(() => Resident.create(props)).toThrow(InvalidFieldError);
  });

  it('rejects an invalid CPF', () => {
    expect(() => Resident.create(makeProps({ cpf: '111.111.111-11' }))).toThrow(InvalidFieldError);
  });

  it('rejects the same plate declared twice', () => {
    const props = makeProps({
      vehicles: [
        { brand: 'Fiat', model: 'Argo', color: 'Branco', plate: 'ABC1D23' },
        { brand: 'Honda', model: 'Fit', color: 'Preto', plate: 'abc-1d23' },
      ],
    });

    expect(() => Resident.create(props)).toThrow(BusinessRuleError);
  });

  it('keeps identity and creation date when data is replaced', () => {
    const resident = Resident.create(makeProps());
    const updated = resident.withData(makeProps({ unit: 'B-202' }));

    expect(updated.id).toBe(resident.id);
    expect(updated.toSnapshot().createdAt).toEqual(resident.toSnapshot().createdAt);
    expect(updated.unit).toBe('B-202');
  });
});
