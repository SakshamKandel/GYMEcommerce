/**
 * HOME — Section 4: STATS ROW (NEW, per 02 §5.3 + R10).
 * Only real, non-falsifiable claims. No invented brand/product counts.
 * 8 GLOBAL BRANDS · 100+ SKUS IN STOCK · 100% AUTHENTIC · COD ALL NEPAL.
 */

type Stat = { value: string; label: string; sr: string }

const STATS: Stat[] = [
  { value: "8", label: "Global brands", sr: "Global brands" },
  { value: "100+", label: "SKUs in stock", sr: "SKUs in stock" },
  { value: "100%", label: "Authentic", sr: "Authentic" },
  { value: "COD", label: "All Nepal", sr: "Cash on delivery all over Nepal" },
]

const StatsRow = () => {
  return (
    <section className="bg-fog">
      <div className="shell py-14 md:py-20">
        <dl className="grid grid-cols-2 divide-x divide-y divide-ink/15 border-y border-ink/15 md:grid-cols-4 md:divide-y-0">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-4 py-10 text-center">
              <dt className="sr-only">{stat.sr}</dt>
              <dd className="font-display text-stat uppercase leading-none text-ink">
                {stat.value}
              </dd>
              <p className="mt-3 font-mono text-label uppercase tracking-label text-ash">
                {stat.label}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default StatsRow
