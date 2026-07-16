import { sdk } from "@lib/config"

export type SiteBanner = {
  id: string
  placement: "announcement_top" | "footer_ticker"
  messages: string[]
  link_url: string | null
  background_color: string
  text_color: string
  alignment: "left" | "center" | "right"
  display_mode: "static" | "marquee"
}

/**
 * Active banners for a placement, admin-managed (Admin → Site Banners).
 * Cached for 60s so admin edits (including turning a banner off) reach the
 * live site within a minute — no rebuild or redeploy involved.
 * Fails soft to [] so a backend hiccup never breaks the layout.
 */
export const listSiteBanners = async (
  placement: SiteBanner["placement"]
): Promise<SiteBanner[]> => {
  try {
    const { banners } = await sdk.client.fetch<{ banners: SiteBanner[] }>(
      `/store/site-banners`,
      {
        method: "GET",
        query: { placement },
        next: { revalidate: 60 },
        cache: "force-cache",
      }
    )
    return banners ?? []
  } catch {
    return []
  }
}
