import { requireText } from '../../../../shared/domain/guards';
import { PhoneNumber } from '../../../../shared/domain/value-objects/phone-number';

export interface ContactPersonProps {
  name: string;
  phone: string;
}

/**
 * Named person reachable by phone. Used both for the emergency contact and for
 * the landlord/property manager of a tenant.
 */
export class ContactPerson {
  readonly name: string;
  readonly phone: PhoneNumber;

  private constructor(name: string, phone: PhoneNumber) {
    this.name = name;
    this.phone = phone;
  }

  static create(props: ContactPersonProps, label: string): ContactPerson {
    return new ContactPerson(
      requireText(`nome do ${label}`, props.name, { min: 3, max: 150 }),
      PhoneNumber.create(props.phone, `telefone do ${label}`),
    );
  }
}
