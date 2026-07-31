import { Cpf } from './cpf';

describe('Cpf', () => {
  it.each(['529.982.247-25', '52998224725', '111.444.777-35'])('accepts %s', (value) => {
    expect(Cpf.isValid(value)).toBe(true);
  });

  it.each(['111.111.111-11', '529.982.247-24', '1234567890', '', 'abc'])('rejects %s', (value) => {
    expect(Cpf.isValid(value)).toBe(false);
  });

  it('stores digits only and exposes the masked form', () => {
    const cpf = Cpf.create('529.982.247-25');

    expect(cpf.value).toBe('52998224725');
    expect(cpf.formatted).toBe('529.982.247-25');
  });
});
