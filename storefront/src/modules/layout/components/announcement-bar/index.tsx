import React from "react"

import { listSiteBanners, SiteBanner } from "@lib/data/site-banners"

/**
 * Admin-managed announcement strips above the nav (Admin → Site Banners).
 *
 * Previously a hardcoded red band; now fully merchant-controlled: text,
 * colors, alignment, static vs marquee — and removable (deactivating the
 * banner in the admin renders nothing here within ~60s).
 */

const JUSTIFY: Record<SiteBanner["alignment"], string> = {
  left: "justify-start text-left",
  center: "justify-center text-center",
  right: "justify-end text-right",
}

const StaticStrip = ({ banner }: { banner: SiteBanner }) => (
  <p
    className={`content-container flex flex-wrap items-center gap-x-3 gap-y-1 py-2 font-mono text-label-sm uppercase tracking-label ${JUSTIFY[banner.alignment]}`}
  >
    {banner.messages.map((message, i) => (
      <React.Fragment key={i}>
        {i > 0 && (
          <span aria-hidden="true" style={{ opacity: 0.8 }}>
            ✱
          </span>
        )}
        <span>{message}</span>
      </React.Fragment>
    ))}
  </p>
)

const MarqueeRow = ({
  messages,
  hidden,
}: {
  messages: string[]
  hidden?: boolean
}) => (
  <ul
    aria-hidden={hidden || undefined}
    className="flex shrink-0 items-center gap-8 pr-8 py-2 font-mono text-label-sm uppercase tracking-label"
  >
    {messages.map((message, i) => (
      <React.Fragment key={i}>
        <li className="whitespace-nowrap">{message}</li>
        <li aria-hidden="true" style={{ opacity: 0.8 }}>
          ✱
        </li>
      </React.Fragment>
    ))}
  </ul>
)

const MarqueeStrip = ({ banner }: { banner: SiteBanner }) => (
  <div className="relative overflow-hidden select-none">
    <div className="flex w-max animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
      <MarqueeRow messages={banner.messages} />
      <MarqueeRow messages={banner.messages} hidden />
    </div>
    {/* Edge fades use the banner's own color — inline since it's dynamic. */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 md:w-24"
      style={{
        background: `linear-gradient(to right, ${banner.background_color}, transparent)`,
      }}
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 md:w-24"
      style={{
        background: `linear-gradient(to left, ${banner.background_color}, transparent)`,
      }}
    />
  </div>
)

const Strip = ({ banner }: { banner: SiteBanner }) => {
  const content =
    banner.display_mode === "marquee" ? (
      <MarqueeStrip banner={banner} />
    ) : (
      <StaticStrip banner={banner} />
    )

  const style = {
    backgroundColor: banner.background_color,
    color: banner.text_color,
  }

  if (banner.link_url) {
    return (
      <a
        href={banner.link_url}
        className="block hover:opacity-95"
        style={style}
        data-testid="announcement-bar"
      >
        {content}
      </a>
    )
  }

  return (
    <div style={style} data-testid="announcement-bar">
      {content}
    </div>
  )
}

const AnnouncementBar = async () => {
  const banners = await listSiteBanners("announcement_top")

  if (!banners.length) {
    return null
  }

  return (
    <>
      {banners.map((banner) => (
        <Strip key={banner.id} banner={banner} />
      ))}
    </>
  )
}

export default AnnouncementBar
