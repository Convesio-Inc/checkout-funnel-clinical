/**
 * SiteHeader
 * -----------------------------------------------------------------------------
 * Meridian masthead: forest leaf logo + wordmark on the left, section nav in
 * the center, a "secure checkout" assurance on the right. Not sticky — only the
 * UrgencyRail above it pins to the top.
 *
 * Edit the brand name, nav links, and assurance copy directly here.
 * -----------------------------------------------------------------------------
 */

import { Icon } from "@/components/icons";

const NAV_LINKS = ["Science", "Ingredients", "Reviews", "Guarantee"];

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper/70 backdrop-blur">
      <div className="max-w-[1180px] mx-auto px-5 py-4 flex items-center justify-between">
        {/* Logo + wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full gloss-forest text-paper flex items-center justify-center">
            <Icon.Leaf className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-[0.18em] text-[13px] text-ink">MERIDIAN</div>
            <div className="text-[10.5px] uppercase tracking-[0.22em] text-ink3">
              Botanicals · est. 2019
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] text-ink2">
          {NAV_LINKS.map((label) => (
            <a key={label} className="hover:text-ink transition-colors" href="#">
              {label}
            </a>
          ))}
        </nav>

        {/* Secure assurance */}
        <div className="flex items-center gap-2 text-[12px] text-ink3">
          <Icon.Lock className="w-3.5 h-3.5" />
          <span>Secure checkout</span>
        </div>
      </div>
    </header>
  );
}
