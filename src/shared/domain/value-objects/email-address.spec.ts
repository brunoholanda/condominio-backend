import { InvalidFieldError } from '../domain-error';
import { EmailAddress } from './email-address';

describe('EmailAddress', () => {
  it('normaliza espaços e caixa', () => {
    expect(EmailAddress.create('  Sindico@Condominio.COM.br ').value).toBe(
      'sindico@condominio.com.br',
    );
  });

  it('recusa endereços malformados', () => {
    expect(() => EmailAddress.create('sindico@condominio')).toThrow(InvalidFieldError);
    expect(() => EmailAddress.create('sem-arroba.com.br')).toThrow(InvalidFieldError);
  });

  it('esconde o miolo do endereço, preservando as pontas e o domínio', () => {
    expect(EmailAddress.create('holanda_rodrigues@hotmail.com').masked).toBe(
      'ho*****es@hotmail.com',
    );
  });

  it('mostra apenas um caractere de cada ponta em endereços curtos', () => {
    expect(EmailAddress.create('ana@exemplo.com').masked).toBe('a*****a@exemplo.com');
  });
});
