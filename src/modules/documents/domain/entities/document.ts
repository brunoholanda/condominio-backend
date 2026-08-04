import { randomUUID } from 'node:crypto';

import { optionalText, requireEnum, requireText } from '../../../../shared/domain/guards';
import { DocumentType } from '../enums/document-type';

export interface DocumentProps {
  condominiumId: string;
  type: DocumentType | string;
  title: string;
  body: string;
  storageKey?: string | null;
  isPublic?: boolean;
  publishedAt?: Date | string | null;
  createdByUserId: string;
}

export interface DocumentSnapshot {
  id: string;
  condominiumId: string;
  type: DocumentType;
  title: string;
  body: string;
  storageKey: string | null;
  isPublic: boolean;
  publishedAt: Date | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** A published notice, assembly minutes/notice, or any other condo document. */
export class Document {
  private constructor(private readonly state: DocumentSnapshot) {}

  static create(props: DocumentProps): Document {
    const now = new Date();

    return new Document({
      ...Document.parse(props),
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: DocumentSnapshot): Document {
    return new Document({
      ...Document.parse(snapshot),
      id: snapshot.id,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  withData(props: DocumentProps): Document {
    return new Document({
      ...Document.parse(props),
      id: this.state.id,
      createdAt: this.state.createdAt,
      updatedAt: new Date(),
    });
  }

  private static parse(
    props: DocumentProps,
  ): Omit<DocumentSnapshot, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      condominiumId: requireText('condomínio', props.condominiumId, { min: 1, max: 64 }),
      type: requireEnum('tipo de documento', props.type, DocumentType),
      title: requireText('título', props.title, { min: 3, max: 200 }),
      body: requireText('conteúdo', props.body, { min: 1, max: 20000 }),
      storageKey: optionalText('arquivo', props.storageKey, { min: 1, max: 500 }),
      isPublic: props.isPublic ?? false,
      publishedAt: props.publishedAt ? new Date(props.publishedAt) : null,
      createdByUserId: requireText('responsável', props.createdByUserId, { min: 1, max: 64 }),
    };
  }

  get id(): string {
    return this.state.id;
  }

  get isPublic(): boolean {
    return this.state.isPublic;
  }

  get publishedAt(): Date | null {
    return this.state.publishedAt;
  }

  toSnapshot(): DocumentSnapshot {
    return { ...this.state };
  }
}
