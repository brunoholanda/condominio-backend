/** Destinos públicos que podem aparecer no hub e virar QR Code. */
export const PUBLIC_HUB_LINKS = [
  'cadastro',
  'documentos',
  'transparencia',
  'sugestoes',
  'reservas',
  'ponto',
] as const;

export type PublicHubLink = (typeof PUBLIC_HUB_LINKS)[number];

/** Inclui o hub em si, usado nos PDFs de QR Code. */
export const PUBLIC_QR_TARGETS = ['hub', ...PUBLIC_HUB_LINKS] as const;

export type PublicQrTarget = (typeof PUBLIC_QR_TARGETS)[number];

export const PUBLIC_HUB_LINK_LABELS: Record<PublicHubLink, string> = {
  cadastro: 'Cadastro de morador',
  documentos: 'Documentos',
  transparencia: 'Portal da transparência',
  sugestoes: 'Caixa de sugestões',
  reservas: 'Reservas de áreas comuns',
  ponto: 'Ponto eletrônico',
};

export const PUBLIC_QR_TARGET_LABELS: Record<PublicQrTarget, string> = {
  hub: 'Página pública',
  ...PUBLIC_HUB_LINK_LABELS,
};

export const DEFAULT_PUBLIC_HUB_LINKS: PublicHubLink[] = [...PUBLIC_HUB_LINKS];

export function isPublicHubLink(value: string): value is PublicHubLink {
  return (PUBLIC_HUB_LINKS as readonly string[]).includes(value);
}

export function normalizePublicHubLinks(raw: unknown): PublicHubLink[] {
  if (!Array.isArray(raw)) {
    return [...DEFAULT_PUBLIC_HUB_LINKS];
  }

  const seen = new Set<PublicHubLink>();
  const links: PublicHubLink[] = [];

  for (const item of raw) {
    if (typeof item !== 'string' || !isPublicHubLink(item) || seen.has(item)) {
      continue;
    }

    seen.add(item);
    links.push(item);
  }

  // Mantém a ordem canônica do catálogo.
  return PUBLIC_HUB_LINKS.filter((link) => seen.has(link));
}

export function publicPathForTarget(slug: string, target: PublicQrTarget): string {
  switch (target) {
    case 'hub':
      return `/c/${slug}`;
    case 'cadastro':
      return `/c/${slug}/cadastro`;
    case 'documentos':
      return `/c/${slug}/documentos`;
    case 'transparencia':
      return `/c/${slug}/transparencia`;
    case 'sugestoes':
      return `/c/${slug}/sugestoes`;
    case 'reservas':
      return `/c/${slug}/reservas`;
    case 'ponto':
      return `/c/${slug}/ponto`;
  }
}
