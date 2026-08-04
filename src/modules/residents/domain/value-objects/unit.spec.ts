import { InvalidFieldError } from '../../../../shared/domain/domain-error';
import { buildPortoImperialUnits, Unit } from './unit';

describe('Unit', () => {
  it('accepts any non-empty value up to 20 characters, trimming spaces', () => {
    expect(Unit.create(' 317 ').value).toBe('317');
    expect(Unit.create('Casa 12').value).toBe('Casa 12');
  });

  it.each(['', '   ', 'A'.repeat(21)])('rejects %p', (raw) => {
    expect(() => Unit.create(raw)).toThrow(InvalidFieldError);
  });
});

describe('buildPortoImperialUnits', () => {
  it('covers the 68 apartments of the four floors', () => {
    const units = buildPortoImperialUnits();

    expect(units).toHaveLength(68);
    expect(units[0]).toBe('101');
    expect(units.at(-1)).toBe('417');
    expect(units).toContain('117');
    expect(units).toContain('401');
  });
});
