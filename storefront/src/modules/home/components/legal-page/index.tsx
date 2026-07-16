import { Metadata } from "next"

/**
 * Shared lightweight template for the static marketing/trust/legal pages
 * (authenticity, terms, privacy, returns, shipping). Paper background, mono red eyebrow,
 * giant Anton H1, editorial prose column. No lorem — every page ships real, Nepal-correct copy.
 */

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }

export type LegalSection = {
  heading?: string
  blocks: LegalBlock[]
}

export type LegalPageProps = {
  eyebrow: string
  title: string
  intro?: string
  updated?: string
  sections: LegalSection[]
}

const Block = ({ block }: { block: LegalBlock }) => {
  if (block.type === "list") {
    return (
      <ul className="mt-4 flex flex-col gap-3">
        {block.items.map((item, i) => (
          <li key={i} className="relative pl-6 font-body text-body text-ink/90">
            <span
              aria-hidden="true"
              className="absolute left-0 top-[0.55em] h-1.5 w-1.5 bg-red"
            />
            {item}
          </li>
        ))}
      </ul>
    )
  }
  return <p className="mt-4 font-body text-body text-ink/90">{block.text}</p>
}

const LegalPage = ({
  eyebrow,
  title,
  intro,
  updated,
  sections,
}: LegalPageProps) => {
  return (
    <div className="bg-paper">
      {/* Header band */}
      <header className="border-b border-line">
        <div className="shell py-16 md:py-24">
          <p className="mb-5 font-mono text-label uppercase tracking-label text-red">
            {eyebrow}
          </p>
          <h1 className="max-w-4xl font-display text-display-1 uppercase leading-[0.92] text-ink">
            {title}
          </h1>
          {intro && (
            <p className="mt-6 max-w-2xl font-body text-body-lg text-ash">
              {intro}
            </p>
          )}
          {updated && (
            <p className="mt-8 font-mono text-label-sm uppercase tracking-label text-ash">
              {updated}
            </p>
          )}
        </div>
      </header>

      {/* Prose column */}
      <div className="shell py-14 md:py-20">
        <div className="max-w-3xl">
          {sections.map((section, i) => (
            <section key={i} className={i > 0 ? "mt-12" : undefined}>
              {section.heading && (
                <h2 className="font-body text-h3 font-semibold text-ink">
                  {section.heading}
                </h2>
              )}
              {section.blocks.map((block, j) => (
                <Block key={j} block={block} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LegalPage

/** Helper to keep page metadata consistent across the static routes. */
export const legalMetadata = (
  title: string,
  description: string
): Metadata => ({
  title: `${title} | Protein Pasal`,
  description,
})
