import type { User } from '../../domain/entities/user';
import type { AuthenticatedUserDto } from '../dto/auth-response.dto';

/** Never exposes the password hash outside the application layer. */
export class UserPresenter {
  static toResponse(user: User): AuthenticatedUserDto {
    return { id: user.id, name: user.name, email: user.email.value };
  }
}
