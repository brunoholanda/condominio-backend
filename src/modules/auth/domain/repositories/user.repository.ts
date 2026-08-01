import type { User } from '../entities/user';

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<User | null>;

  abstract findById(id: string): Promise<User | null>;

  /** Guarda a identificação do operador: um CPF pertence a uma conta só. */
  abstract findIdByCpf(cpf: string): Promise<string | null>;

  abstract save(user: User): Promise<User>;
}
