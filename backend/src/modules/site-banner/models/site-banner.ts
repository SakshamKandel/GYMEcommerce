import { model } from "@medusajs/framework/utils"

/**
 * A merchant-managed site banner (announcement strips, ticker bands).
 *
 * `messages` is a JSON array of strings — each entry is one phrase, rendered
 * with the ✱ separator between phrases. All visual knobs (colors, alignment,
 * display mode) live here so the storefront renders exactly what the admin
 * configured, and `is_active` makes any banner fully removable at runtime.
 */
export const SiteBanner = model.define("site_banner", {
  id: model.id({ prefix: "sban" }).primaryKey(),
  /** Admin-facing label, e.g. "Top announcement". */
  name: model.text(),
  /** Where the storefront mounts this banner. */
  placement: model
    .enum(["announcement_top", "footer_ticker"])
    .default("announcement_top"),
  /** Ordered phrases; rendered separated by ✱. */
  messages: model.json(),
  /** Optional click-through URL for the whole strip. */
  link_url: model.text().nullable(),
  /** Any CSS color (hex from the admin color picker). */
  background_color: model.text().default("#E63946"),
  text_color: model.text().default("#FAFAF7"),
  /** Text alignment for static mode (marquee scrolls, so it ignores this). */
  alignment: model.enum(["left", "center", "right"]).default("center"),
  /** static = fixed strip; marquee = infinite scrolling ticker. */
  display_mode: model.enum(["static", "marquee"]).default("static"),
  /** Master switch — inactive banners disappear from the storefront. */
  is_active: model.boolean().default(true),
  /** Lower renders first when multiple banners share a placement. */
  sort_order: model.number().default(0),
})
