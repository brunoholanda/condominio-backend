import { InvalidFieldError } from '../../../../shared/domain/domain-error';
import { CONDO_UNITS, TOTAL_UNITS, Unit } from './unit';

describe('Unit', () => {
  it('covers the 68 apartments of the four floors', () => {
    expect(TOTAL_UNITS).toBe(68);
    expect(CONDO_UNITS[0]).toBe('101');
    expect(CONDO_UNITS.at(-1)).toBe('417');
    expect(CONDO_UNITS).toContain('117');
    expect(CONDO_UNITS).toContain('401');
  });

  it('accepts a number of the catalog, ignoring surrounding spaces', () => {
    expect(Unit.create(' 317 ').value).toBe('317');
    expect(Unit.create('101').floor).toBe(1);
  });

  it.each(['118', '100', '518', '017', '1017', '', 'A-101'])('rejects %p', (raw) => {
    expect(() => Unit.create(raw)).toThrow(InvalidFieldError);
  });
});
