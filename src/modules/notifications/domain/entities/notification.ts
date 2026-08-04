import { randomUUID } from 'node:crypto';

import { optionalText, requireEnum, requireText } from '../../../../shared/domain/guards';
import { NotificationCategory } from '../enums/notification-category';

export interface NotificationProps {
  condominiumId: string;
  userId?: string | null;
  title: string;
  body: string;
  category: NotificationCategory | string;
  linkPath?: string | null;
}

export interface NotificationSnapshot {
  id: string;
  condominiumId: string;
  userId: string | null;
  title: string;
  body: string;
  category: NotificationCategory;
  linkPath: string | null;
  readAt: Date | null;
  createdAt: Date;
}

/** Notificação in-app (por usuário ou broadcast do condomínio). */
export class Notification {
  private constructor(private readonly state: NotificationSnapshot) {}

  static create(props: NotificationProps): Notification {
    return new Notification({
      id: randomUUID(),
      condominiumId: requireText('condomínio', props.condominiumId, { min: 36, max: 36 }),
      userId: optionalText('usuário', props.userId ?? null, { min: 36, max: 36 }),
      title: requireText('título', props.title, { min: 1, max: 200 }),
      body: requireText('corpo', props.body, { min: 1, max: 2000 }),
      category: requireEnum('categoria', props.category, NotificationCategory),
      linkPath: optionalText('link', props.linkPath ?? null, { max: 255 }),
      readAt: null,
      createdAt: new Date(),
    });
  }

  static restore(snapshot: NotificationSnapshot): Notification {
    return new Notification({
      ...snapshot,
      category: requireEnum('categoria', snapshot.category, NotificationCategory),
    });
  }

  markRead(at: Date = new Date()): Notification {
    if (this.state.readAt) {
      return this;
    }

    return new Notification({ ...this.state, readAt: at });
  }

  get id(): string {
    return this.state.id;
  }

  get userId(): string | null {
    return this.state.userId;
  }

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  get readAt(): Date | null {
    return this.state.readAt;
  }

  toSnapshot(): NotificationSnapshot {
    return { ...this.state };
  }
}
