/**
 * Base class for every error raised by the domain layer.
 *
 * The domain never depends on HTTP: transport-specific translation happens in
 * `DomainExceptionFilter`, which maps each subclass to a status code.
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** A single field failed its own format/range rules. */
export class InvalidFieldError extends DomainError {
  constructor(
    readonly field: string,
    message: string,
  ) {
    super(message);
  }
}

/** A rule involving more than one field (an aggregate invariant) was violated. */
export class BusinessRuleError extends DomainError {}

/** The caller could not be identified, or the credentials presented are not valid. */
export class AuthenticationError extends DomainError {}

/** The requested aggregate does not exist. */
export class ResourceNotFoundError extends DomainError {}

/** The operation conflicts with data that already exists. */
export class ResourceConflictError extends DomainError {}

/**
 * O recurso existiu, mas acabou: prazo vencido, uso único já gasto, tentativas
 * esgotadas. Diferente do 401, diz ao cliente que insistir não adianta — o
 * caminho é recomeçar.
 */
export class ResourceExpiredError extends DomainError {}
