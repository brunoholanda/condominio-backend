export interface PageRequest {
  page: number;
  limit: number;
}

export interface PaginatedResult<TItem> {
  items: TItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function buildPaginatedResult<TItem>(
  items: TItem[],
  total: number,
  { page, limit }: PageRequest,
): PaginatedResult<TItem> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
  };
}
