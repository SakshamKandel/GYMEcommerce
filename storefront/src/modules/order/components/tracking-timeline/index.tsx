import { clx } from "@medusajs/ui"
import { formatTrackingDate, TrackingStep } from "@modules/order/lib/tracking"

type TrackingTimelineProps = {
  steps: TrackingStep[]
  className?: string
  "data-testid"?: string
}

const CheckGlyph = () => (
  <svg
    viewBox="0 0 16 16"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <path d="M3.5 8.5l3 3 6-6.5" strokeLinecap="square" />
  </svg>
)

type NodeState = "done" | "current" | "pending"

const Node = ({ state }: { state: NodeState }) => (
  <span
    className={clx(
      "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-colors",
      {
        "border-ink bg-ink text-paper": state === "done",
        "border-ink bg-paper text-ink": state === "current",
        "border-line bg-paper text-ash": state === "pending",
      }
    )}
    aria-hidden="true"
  >
    {state === "done" ? (
      <CheckGlyph />
    ) : (
      <span
        className={clx("h-2 w-2 rounded-full", {
          "bg-ink": state === "current",
          "bg-line": state === "pending",
        })}
      />
    )}
  </span>
)

/**
 * Bold 4-step delivery journey. Vertical on mobile, horizontal from `small:`.
 * Completed steps are ink-filled with a red connector; the next step up is
 * outlined in ink ("current"); later steps sit quietly in `line` grey.
 *
 * Shared across the guest tracking result, the order-confirmed page, and the
 * account order-details page — all fed a `TrackingStep[]`.
 */
const TrackingTimeline = ({
  steps,
  className,
  "data-testid": dataTestId,
}: TrackingTimelineProps) => {
  const frontier = steps.findIndex((s) => !s.done)

  const stateFor = (index: number, done: boolean): NodeState => {
    if (done) return "done"
    if (index === frontier) return "current"
    return "pending"
  }

  return (
    <div className={className} data-testid={dataTestId}>
      {/* Horizontal (small screens and up) */}
      <ol className="hidden small:flex">
        {steps.map((step, i) => {
          const state = stateFor(i, step.done)
          const date = formatTrackingDate(step.at)
          return (
            <li
              key={step.key}
              className="relative flex flex-1 flex-col items-center"
              data-testid={`timeline-step-${step.key}`}
              data-done={step.done}
            >
              <div className="flex w-full items-center">
                {/* left connector */}
                <span
                  className={clx("h-0.5 flex-1", {
                    "bg-red": step.done && i > 0,
                    "bg-line": !(step.done && i > 0),
                    invisible: i === 0,
                  })}
                />
                <Node state={state} />
                {/* right connector */}
                <span
                  className={clx("h-0.5 flex-1", {
                    "bg-red": steps[i + 1]?.done,
                    "bg-line": !steps[i + 1]?.done,
                    invisible: i === steps.length - 1,
                  })}
                />
              </div>
              <div className="mt-3 flex flex-col items-center text-center">
                <span
                  className={clx(
                    "font-mono text-label-sm uppercase tracking-label",
                    step.done || state === "current" ? "text-ink" : "text-ash"
                  )}
                >
                  {step.label}
                </span>
                <span className="mt-1 h-4 font-body text-body-sm text-ash">
                  {date ?? ""}
                </span>
              </div>
            </li>
          )
        })}
      </ol>

      {/* Vertical (mobile) */}
      <ol className="flex flex-col small:hidden">
        {steps.map((step, i) => {
          const state = stateFor(i, step.done)
          const date = formatTrackingDate(step.at)
          const isLast = i === steps.length - 1
          return (
            <li
              key={step.key}
              className="flex gap-4"
              data-testid={`timeline-step-m-${step.key}`}
              data-done={step.done}
            >
              <div className="flex flex-col items-center">
                <Node state={state} />
                {!isLast && (
                  <span
                    className={clx("w-0.5 flex-1", {
                      "bg-red": steps[i + 1]?.done,
                      "bg-line": !steps[i + 1]?.done,
                    })}
                  />
                )}
              </div>
              <div className={clx("flex flex-col", isLast ? "pb-0" : "pb-6")}>
                <span
                  className={clx(
                    "font-mono text-label uppercase tracking-label",
                    step.done || state === "current" ? "text-ink" : "text-ash"
                  )}
                >
                  {step.label}
                </span>
                {date && (
                  <span className="mt-1 font-body text-body-sm text-ash">
                    {date}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default TrackingTimeline
