import { clx } from "@medusajs/ui"
import PillButton from "@modules/common/components/pill-button"
import SectionLabel from "@modules/common/components/section-label"

/**
 * Dark split feature section (02 §5.8, contract §5.2).
 * Giant Anton headline one side, `rounded-photo` grayscale editorial photo
 * the other. `reverse` flips the columns; `compact` tightens the rhythm for
 * in-page use (e.g. PDP authenticity strip).
 */
type SplitFeatureProps = {
  eyebrow: string
  title: string
  body?: string
  cta?: { label: string; href: string }
  imageSrc: string
  imageAlt?: string
  reverse?: boolean
  compact?: boolean
}

const SplitFeature = ({
  eyebrow,
  title,
  body,
  cta,
  imageSrc,
  imageAlt = "",
  reverse = false,
  compact = false,
}: SplitFeatureProps) => {
  return (
    <section className="on-dark bg-ink text-paper">
      <div
        className={clx(
          "shell grid items-center gap-10 md:grid-cols-2 md:gap-16",
          compact ? "py-12 md:py-16" : "section-y"
        )}
      >
        <div className={clx(reverse && "md:order-2")}>
          <SectionLabel tone="red" className="mb-5">
            {eyebrow}
          </SectionLabel>
          <h2 className="font-display text-display-2 uppercase leading-[0.92]">
            {title}
          </h2>
          {body && (
            <p className="mt-6 max-w-md font-body text-body-lg text-paper/80">
              {body}
            </p>
          )}
          {cta && (
            <div className="mt-8">
              <PillButton href={cta.href} variant="inverse">
                {cta.label}
              </PillButton>
            </div>
          )}
        </div>
        <div
          className={clx(
            "relative overflow-hidden rounded-photo bg-coal",
            compact ? "aspect-[16/10]" : "aspect-[4/5]",
            reverse && "md:order-1"
          )}
        >
          {/* Editorial photos are grayscale by law (02 §7); decorative alt="" unless meaningful. */}
          <img
            src={imageSrc}
            alt={imageAlt}
            loading="lazy"
            className="img-editorial h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default SplitFeature
