import React from "react"

import RailClient from "./rail-client"

/**
 * Horizontal snap-scroll rail (02 §5.6, contract §5.2).
 *
 * Server component: it stays server-renderable so it can host server children
 * (e.g. async ProductPreview cards) directly. All scroll chrome — snap
 * scrolling, edge fade masks, desktop prev/next arrows — lives in the client
 * sub-component `RailClient`, which holds the ref'd scroll container. The rail
 * scrolls inside itself; the page body never scrolls horizontally (§4.0
 * guardrail 5). Public contract is unchanged: `{ children, itemClassName }`.
 */
type HScrollRailProps = {
  children: React.ReactNode
  itemClassName?: string
}

const HScrollRail = ({
  children,
  itemClassName = "w-[78vw] xsmall:w-[340px]",
}: HScrollRailProps) => {
  return <RailClient itemClassName={itemClassName}>{children}</RailClient>
}

export default HScrollRail
