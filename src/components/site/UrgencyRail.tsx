/**
 * UrgencyRail
 * -----------------------------------------------------------------------------
 * Sticky AG1 top rail across the storefront: brand mark on the left; live
 * "N at checkout", a secure marker, and a "Reserved mm:ss" countdown on the
 * right. Self-contained — owns its own countdown + viewer counter.
 *
 * Markers:
 *   - root            data-section="top-rail"
 *   - reserved timer  data-slot="reserved-timer"
 * -----------------------------------------------------------------------------
 */

import { Icon } from "@/components/icons";
import { useCountdown, useViewers } from "@/hooks/useStorefrontUrgency";

export function UrgencyRail() {
  const { mm, ss } = useCountdown(5 * 60);
  const viewers = useViewers();

  return (
    <div
      data-section="top-rail"
      className="sticky top-0 z-40 bg-sand border-b border-line2"
    >
      <div className="max-w-[1080px] mx-auto px-6 h-12 flex items-center justify-between text-[12px]">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-ink text-paper grid place-items-center">
            <Icon.Beaker className="w-4 h-4" />
          </div>
          <span className="font-semibold tracking-[0.08em] text-ink">MERIDIAN</span>
          <span className="hidden sm:inline text-ink3 smallcaps">Daily greens</span>
        </a>
        <div className="flex items-center gap-5">
          <span className="hidden md:flex items-center gap-2 text-ink3">
            <span className="livedot inline-flex w-1.5 h-1.5 rounded-full bg-rust" />
            <span><span className="num text-ink">{viewers}</span> at checkout</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-ink3 smallcaps">
            <Icon.Lock className="w-3.5 h-3.5" /> Secure
          </span>
          <span className="num text-[12.5px] text-ink">
            <span className="text-ink3 smallcaps mr-2">Reserved</span>
            <span data-slot="reserved-timer">
              {mm}<span className="tick text-ink3">:</span>{ss}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
