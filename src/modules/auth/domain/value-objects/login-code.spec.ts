import { InvalidFieldError } from '../../../../shared/domain/domain-error';
import { LoginCode } from './login-code';

describe('LoginCode', () => {
  it('sorteia sempre seis dígitos, inclusive com zeros à esquerda', () => {
    const codes = Array.from({ length: 200 }, () => LoginCode.random().value);

    expect(codes.every((code) => /^\d{6}$/.test(code))).toBe(true);
    // 200 sorteios repetidos indicariam gerador quebrado.
    expect(new Set(codes).size).toBeGreaterThan(150);
  });

  it('aceita o código digitado com separadores', () => {
    expect(LoginCode.create('123 456').value).toBe('123456');
  });

  it('recusa códigos com tamanho diferente', () => {
    expect(() => LoginCode.create('12345')).toThrow(InvalidFieldError);
    expect(() => LoginCode.create('1234567')).toThrow(InvalidFieldError);
    expect(LoginCode.isValid('123456')).toBe(true);
    expect(LoginCode.isValid('abcdef')).toBe(false);
  });
});
