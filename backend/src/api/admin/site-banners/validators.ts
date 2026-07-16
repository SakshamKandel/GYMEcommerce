const PLACEMENTS = ["announcement_top", "footer_ticker"] as const
const ALIGNMENTS = ["left", "center", "right"] as const
const MODES = ["static", "marquee"] as const

/** #RGB / #RRGGBB / #RRGGBBAA — the admin sends color-picker hex values. */
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

type SanitizeResult = {
  data?: Record<string, unknown>
  error?: string
}

/**
 * Whitelist + validate banner fields from the admin UI. With
 * `partial: true` only provided keys are validated/passed through (update);
 * otherwise `name` and `messages` are required (create).
 */
export function sanitizeBannerInput(
  body: unknown,
  { partial }: { partial: boolean }
): SanitizeResult {
  const input = (body ?? {}) as Record<string, unknown>
  const data: Record<string, unknown> = {}

  if (input.name !== undefined) {
    if (typeof input.name !== "string" || !input.name.trim()) {
      return { error: "`name` must be a non-empty string" }
    }
    data.name = input.name.trim()
  } else if (!partial) {
    return { error: "`name` is required" }
  }

  if (input.messages !== undefined) {
    if (
      !Array.isArray(input.messages) ||
      input.messages.length === 0 ||
      !input.messages.every((m) => typeof m === "string" && m.trim())
    ) {
      return { error: "`messages` must be a non-empty array of strings" }
    }
    data.messages = (input.messages as string[]).map((m) => m.trim())
  } else if (!partial) {
    return { error: "`messages` is required" }
  }

  if (input.placement !== undefined) {
    if (!PLACEMENTS.includes(input.placement as any)) {
      return { error: `\`placement\` must be one of: ${PLACEMENTS.join(", ")}` }
    }
    data.placement = input.placement
  }

  if (input.alignment !== undefined) {
    if (!ALIGNMENTS.includes(input.alignment as any)) {
      return { error: `\`alignment\` must be one of: ${ALIGNMENTS.join(", ")}` }
    }
    data.alignment = input.alignment
  }

  if (input.display_mode !== undefined) {
    if (!MODES.includes(input.display_mode as any)) {
      return { error: `\`display_mode\` must be one of: ${MODES.join(", ")}` }
    }
    data.display_mode = input.display_mode
  }

  for (const key of ["background_color", "text_color"] as const) {
    if (input[key] !== undefined) {
      if (typeof input[key] !== "string" || !HEX_COLOR.test(input[key] as string)) {
        return { error: `\`${key}\` must be a hex color like #E63946` }
      }
      data[key] = input[key]
    }
  }

  if (input.link_url !== undefined) {
    if (input.link_url === null || input.link_url === "") {
      data.link_url = null
    } else if (typeof input.link_url !== "string") {
      return { error: "`link_url` must be a string or null" }
    } else {
      data.link_url = input.link_url.trim()
    }
  }

  if (input.is_active !== undefined) {
    data.is_active = Boolean(input.is_active)
  }

  if (input.sort_order !== undefined) {
    const n = Number(input.sort_order)
    if (!Number.isFinite(n)) {
      return { error: "`sort_order` must be a number" }
    }
    data.sort_order = Math.trunc(n)
  }

  return { data }
}
