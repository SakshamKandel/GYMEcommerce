import React from "react"

/**
 * Horizontal snap-scroll rail (02 §5.6, contract §5.2).
 *
 * Each direct child is wrapped in a snap-start cell. The rail scrolls inside
 * itself — the page body never scrolls horizontally (§4.0 guardrail 5).
 * Edge insets match the `.shell` padding so first/last cards align.
 */
type HScrollRailProps = {
  children: React.ReactNode
  itemClassName?: string
}

const HScrollRail = ({
  children,
  itemClassName = "w-[78vw] xsmall:w-[340px]",
}: HScrollRailProps) => {
  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-px-5 px-5 md:px-8 lg:px-12 pb-4">
      {React.Children.map(children, (child) =>
        child == null ? null : (
          <div className={`snap-start shrink-0 ${itemClassName}`}>{child}</div>
        )
      )}
    </div>
  )
}

export default HScrollRail
