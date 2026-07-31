import { PhoneNumber } from './phone-number';

describe('PhoneNumber', () => {
  it.each(['(11) 98888-7777', '1132216549', '(21) 3333-4444'])('accepts %s', (value) => {
    expect(PhoneNumber.isValid(value)).toBe(true);
  });

  it.each(['(01) 98888-7777', '1188887777', '119888877', '119888877771'])('rejects %s', (value) => {
    expect(PhoneNumber.isValid(value)).toBe(false);
  });

  it('formats mobile and landline numbers differently', () => {
    expect(PhoneNumber.create('11988887777').formatted).toBe('(11) 98888-7777');
    expect(PhoneNumber.create('1133334444').formatted).toBe('(11) 3333-4444');
  });
});
