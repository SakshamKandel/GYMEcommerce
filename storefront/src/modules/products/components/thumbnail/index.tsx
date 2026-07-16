import { clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  // TODO: Fix image typings
  images?: any[] | null
  /**
   * Optional second shot that crossfades in while the parent `.group` is
   * hovered (product card). No-op unless it differs from the primary image,
   * so callers can pass it unconditionally.
   */
  hoverImage?: string | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  /** Descriptive alt text (brand + product). Falls back to a generic label. */
  alt?: string
  "data-testid"?: string
}

// Card frames render ~85vw on phones, ~40vw on tablets, ~380px in the desktop
// grid — telling next/image keeps the srcset tight without under-serving retina.
const IMAGE_SIZES =
  "(max-width: 512px) 85vw, (max-width: 1024px) 40vw, 380px"

/**
 * Product image frame (design system 02 §5.5 / §7):
 * full-color product shot on a neutral `fog` field, `rounded-base` (4px, R17),
 * no shadow. The frame owns a fixed aspect ratio so `next/image fill` never
 * shifts layout. On `group` hover the shot zooms 1.05 (motion-safe) and, when a
 * `hoverImage` is supplied, crossfades to the second shot.
 */
const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  hoverImage,
  size = "small",
  isFeatured: _isFeatured, // kept for backward compatibility with existing callers
  className,
  alt,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url
  const secondImage =
    hoverImage && hoverImage !== initialImage ? hoverImage : undefined

  return (
    <div
      className={clx("relative overflow-hidden bg-fog rounded-base", className, {
        "aspect-[3/4]": size !== "square",
        "aspect-[1/1]": size === "square",
        "w-[180px]": size === "small",
        "w-[290px]": size === "medium",
        "w-[440px]": size === "large",
        "w-full": size === "full" || size === "square",
      })}
      data-testid={dataTestid}
    >
      {initialImage ? (
        // A dedicated transform layer zooms both frames together so the crossfade
        // reads as one motion. Zoom is motion-safe only (reduced-motion = static).
        <div className="absolute inset-0 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:scale-[1.05]">
          <Image
            src={initialImage}
            alt={alt || "Product image"}
            className={clx(
              "img-product absolute inset-0 h-full w-full object-cover object-center",
              secondImage &&
                "transition-opacity duration-300 ease-out group-hover:opacity-0"
            )}
            draggable={false}
            quality={50}
            sizes={IMAGE_SIZES}
            fill
          />
          {secondImage && (
            <Image
              src={secondImage}
              alt=""
              aria-hidden
              className="img-product absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
              draggable={false}
              quality={50}
              sizes={IMAGE_SIZES}
              fill
            />
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center text-ash">
          <PlaceholderImage size={size === "small" ? 16 : 24} />
        </div>
      )}
    </div>
  )
}

export default Thumbnail
