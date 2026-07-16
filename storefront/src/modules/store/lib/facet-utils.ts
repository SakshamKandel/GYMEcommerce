/**
 * Shared helpers for the URL/searchParams-driven facet system (Workstream C).
 *
 * URL contract (frozen, master plan §5.4):
 *   ?brand=&category=&minPrice=&maxPrice=&sortBy=&page=
 * `brand` / `category` are comma-separated Medusa handles; the server templates
 * resolve them to ids before querying (`collection_id[]` / `category_id[]`).
 */

export type FacetOption = {
  /** stable identifier used in the URL (collection/category handle) */
  value: string
  /** display label (collection title / category name) */
  label: string
}

export const parseCsvParam = (value?: string | null): string[] =>
  value
    ? value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : []

export const parsePriceParam = (value?: string | null): number | undefined => {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : undefined
}

/**
 * Maps selected handles to entity ids. Unknown handles are ignored; returns
 * `undefined` when nothing resolves so callers fall back to an unfiltered query.
 */
export const resolveHandlesToIds = (
  handles: string[],
  records?: { id: string; handle?: string | null }[] | null
): string[] | undefined => {
  if (!handles.length || !records?.length) {
    return undefined
  }

  const ids = records
    .filter((record) => record.handle && handles.includes(record.handle))
    .map((record) => record.id)

  return ids.length ? ids : undefined
}
