/**
 * BundleSelector
 * -----------------------------------------------------------------------------
 * Clinical supply picker: a One-time / Subscribe (−20%) segmented toggle above
 * three plan cards. The toggle is VISUAL-ONLY — selecting "Subscribe" applies a
 * −20% discount to the displayed + charged total but creates no real recurring
 * schedule. `subscribe` state is owned by the parent (CheckoutPage).
 *
 * Markers:
 *   - root          data-section="bundle-selector"
 *   - each card     data-section="bundle-card" + data-bundle-id
 * -----------------------------------------------------------------------------
 */

import { type Bundle, BUNDLES, bundlePricing } from "./bundles";

function PlanCard({
  bundle,
  selected,
  subscribe,
  onSelect,
}: {
  bundle: Bundle;
  selected: boolean;
  subscribe: boolean;
  onSelect: () => void;
}) {
  const featured = Boolean(bundle.isMostChosen);
  const { pricePerBottle, listMinor, totalMinor, savingsMinor } = bundlePricing(bundle, subscribe);
  const list = listMinor / 100;
  const total = totalMinor / 100;
  const save = savingsMinor / 100;

  return (
    <button
      type="button"
      data-section="bundle-card"
      data-bundle-id={bundle.id}
      aria-pressed={selected}
      onClick={onSelect}
      className={"plan relative text-left p-4 pt-5 " + (selected ? "on" : "")}
    >
      {featured && (
        <span className="save-chip absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          Best value
        </span>
      )}
      <div className="flex items-start justify-between">
        <span className="ringdot mt-0.5" />
        {save > 0 ? (
          <span className="num text-[10.5px] font-semibold whitespace-nowrap text-cobalt">
            Save ${save.toFixed(0)}
          </span>
        ) : (
          <span className="text-[10.5px]">&nbsp;</span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-[13px] font-medium whitespace-nowrap text-ink2">
          {bundle.bottleCount} bottle{bundle.bottleCount > 1 ? "s" : ""}
        </div>
        <div className="mt-1 flex items-baseline gap-1 whitespace-nowrap">
          <span className="num text-[24px] leading-none font-medium tracking-tight text-ink">
            ${pricePerBottle.toFixed(2)}
          </span>
          <span className="text-[10.5px] text-ink3">/bottle</span>
        </div>
        <div className="mt-1.5 text-[11px] num whitespace-nowrap">
          <span className="strike mr-1">${list.toFixed(2)}</span>
          <span className="text-ink2">${total.toFixed(2)}</span>
        </div>
        <div className="mt-1.5 text-[11px] whitespace-nowrap text-ink3">
          {bundle.supplyLabel}
        </div>
      </div>
    </button>
  );
}

export interface BundleSelectorProps {
  value: Bundle;
  onChange: (bundle: Bundle) => void;
  subscribe: boolean;
  onSubscribeChange: (subscribe: boolean) => void;
}

export function BundleSelector({
  value,
  onChange,
  subscribe,
  onSubscribeChange,
}: BundleSelectorProps) {
  const ordered = [...BUNDLES].sort((a, b) => a.bottleCount - b.bottleCount);

  return (
    <div data-section="bundle-selector">
      {/* One-time / Subscribe toggle — visual-only −20% */}
      <div className="mb-4">
        <div className="seg-track flex items-center w-full text-[13px] font-medium">
          <button
            type="button"
            onClick={() => onSubscribeChange(false)}
            className={"flex-1 py-2.5 transition " + (!subscribe ? "seg-on" : "text-ink3 hover:text-ink")}
          >
            One-time
          </button>
          <button
            type="button"
            disabled
            className="flex-1 py-2.5 flex items-center justify-center gap-2 text-ink3 opacity-50 cursor-not-allowed"
          >
            Subscribe
            <span className="num text-[10.5px] font-semibold text-mint">−20%</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {ordered.map((bundle) => (
          <PlanCard
            key={bundle.id}
            bundle={bundle}
            selected={value.id === bundle.id}
            subscribe={subscribe}
            onSelect={() => onChange(bundle)}
          />
        ))}
      </div>
    </div>
  );
}
