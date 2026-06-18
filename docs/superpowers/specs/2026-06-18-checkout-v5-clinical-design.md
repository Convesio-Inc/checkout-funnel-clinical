# Checkout v5 — Clinical Re-skin

**Date:** 2026-06-18
**Status:** Approved (design)
**Source sample:** `Checkout v5 - Clinical.html` (MERIDIAN, "Clinical" theme)

## Goal

Rework the **checkout** and **thank-you** surfaces of `fulfillment-checkout-v5`
(a clone of `fulfillment-checkout-v4`) to match the provided "Clinical" HTML
sample, and perform the supporting infrastructure/repo/docs changes so v5
deploys as a **new, independent** Cloudflare Worker + D1 database without
touching v4.

Per user decision, the checkout is a **full MERIDIAN clone** (copy, product,
bundles, addresses all match the sample). The thank-you page keeps its current
structure and logic — only its **style** is updated to the clinical palette.

## Key context (already true in the codebase)

The v4 codebase is **structurally already the sample**: accordion `Step` 1–4
(Supply → Contact → Ships to → Payment), MERIDIAN / "Daily Greens Complex"
product, the trust strip, `.num` / `.smallcaps` helpers, the `Step` / `Field`
form atoms, `BundleSelector` (already includes a One-time/Subscribe segmented
toggle), and Geist + Geist Mono fonts.

The gap is the **palette**: v4 ended on the warm "AG1" look (cream paper, lime
CTA, forest/amber/rust). The sample is the **clinical** look (white paper,
cobalt-blue accent, ink-black CTA pill, mint positive). Bundle prices already
match the sample exactly ($49 / $39.50 / $33 per bottle).

This is therefore primarily a **re-skin**, not a rebuild.

## Decisions

| Decision | Choice |
| --- | --- |
| Branding scope | Full MERIDIAN clone (copy/product/bundles/addresses match sample) |
| Subscription toggle | **Visual-only** — enabled, defaults to Subscribe, recomputes total at −20%, shows "then $X every 30 days" copy, but charges a **single one-time payment** of the displayed total. No real recurring enrollment. |
| Worker name | `fulfillment-checkout-v5` |
| D1 database name | `fulfillment-checkout-v5` (brand-new database; v4 untouched) |
| Deploy scope | Build + verify locally. **Stop before** creating the remote D1, running remote migrations, or `npm run deploy`. |
| Admin dashboard | Out of scope — stays on neutral shadcn tokens. |

## Clinical palette (from the sample)

```
paper  #ffffff   well   #f6f7f9   well2  #eef0f4
ink    #0a0b0d   ink2   #2f3338   ink3   #6a6f78   ink4 #a3a8b2
line   #e6e8ec   line2  #eef0f4
cobalt #1c4dff   cobalt2 #0c2fcb  cobalt3 #5a82ff
mint   #00a36b
```

Fonts: Geist (sans), Geist Mono (`.num`). Both already imported.

## Work breakdown

### 1. `src/index.css` — palette + helper classes

Replace the active warm tokens with the clinical palette. To minimise churn,
**keep the token names that components already reference** (`paper2`, `line`,
`line2`, `rust`, `lime`, `lime3`, `forest`) but remap their values to clinical
equivalents:

- `paper` → `#ffffff`; introduce `well`/`well2`; `paper2` remapped to the well grey `#f6f7f9`.
- `ink`/`ink2`/`ink3`/`ink4` → `#0a0b0d` / `#2f3338` / `#6a6f78` / `#a3a8b2`.
- `line`/`line2` → `#e6e8ec` / `#eef0f4`.
- Add `cobalt`/`cobalt2`/`cobalt3` and `mint`.
- Remap positive/brand tokens used by components: `lime`/`lime2`/`lime3` and
  `forest*` → cobalt/mint equivalents so existing class usages read correctly.
- `rust` → a clinical alert red for the failure/alert states.

Helper classes (currently hardcoded warm hex) updated to clinical:

- `.cta` → solid **ink-black pill** (`#0a0b0d`, white text), hover `#1a1c20`,
  active `#050608`, done state `#0a8a55`; arrow-slot `rgba(255,255,255,.10)`.
- `.ck-input` → white well, hairline `#e6e8ec`, cobalt focus ring
  `0 0 0 4px rgba(28,77,255,.12)`, focus bg `#fbfcff`.
- `.plan` / `.plan.on` → selected = cobalt border + `rgba(28,77,255,.10)` ring +
  cobalt `ringdot` (not black-fill). Hover border `#c8ccd3`.
- `.seg-track` → `#f6f7f9` track / `#e6e8ec` border; `.seg-on` ink; add
  `.gloss-mint` for the active Subscribe segment.
- `.save-chip` / `save-badge` → cobalt (`#eaf0ff` bg, `#1c4dff` text).
- `::selection` → cobalt.
- `.strike` muted grey `#a3a8b2`.

### 2. `BundleSelector.tsx` — enable visual-only subscription

- Make the Subscribe segment **clickable** and **default-selected** (match sample).
- Lift `sub` state to the parent (`CheckoutPage`) so the toggle drives price.
- When Subscribe is on: per-bottle and totals computed at **−20%**; active
  segment uses `.gloss-mint`; show "−20%" in white.
- Plan card selected styling moves from black-fill to **cobalt accent** (sample
  keeps the card white with a cobalt ring; "Save $X" and prices stay ink/cobalt,
  not inverted-on-black). Remove the `selected ? text-sand…` inversions.

### 3. `CheckoutPage.tsx` + `OrderSummaryCard.tsx`

- Own `sub` state; pass to `BundleSelector` and `OrderSummaryCard`.
- Compute charged amount = displayed total (−20% when `sub`). Pass the
  discounted minor amount into `pay(...)` and the line item.
- Step 1 summary + summary footer line: `one-time` ↔ `monthly` label driven by `sub`.
- Summary footer: when `sub`, show "Subscription discount (20%)" line (cobalt)
  and "then $X every 30 days · cancel anytime" under the total; else "Bundle
  savings". Match sample wording.
- Heading "Almost there." → keep clone-faithful "Checkout." and the sample
  subhead; `care@meridian.co` link → cobalt.
- Trust strip Star icon → cobalt.

### 4. `ThankYouPage.tsx` + thank-you components — restyle only

- Success/promo banner: lime → **mint/cobalt** clinical treatment.
- `paper2` backgrounds become well grey via the token remap; `rust` becomes the
  clinical alert red for the failure card.
- Guarantee note tint → cobalt. No structural or logic changes; verify/poll/
  upsell flow untouched.

### 5. `UrgencyRail.tsx` + site chrome

- Top rail: `bg-sand` → white (`bg-paper`) with `border-line2`; livedot
  `bg-rust` → `bg-cobalt`.
- `SiteFooter` / `SiteHeader`: clinical neutrals (no warm sand/forest).

### 6. Infra / config

- `wrangler.jsonc`: `name` → `fulfillment-checkout-v5`; D1 `database_name` →
  `fulfillment-checkout-v5`. Leave `database_id` as a clearly-marked placeholder
  with a documented `wrangler d1 create fulfillment-checkout-v5` step (local
  `npm run preview` uses a local SQLite sim, so it runs without the remote id).
- Git remote `origin` → `git@github.com:Convesio-Inc/fulfillment-checkout-v5.git`.

### 7. Docs

- `README.md` + `AGENTS.md`: project/worker name, D1 name, repo URL, palette
  description (clinical cobalt/ink/mint), and the deploy checklist (create D1,
  set `database_id`, push secrets, deploy).

### 8. Verification

- `npm run build` (tsc + Vite) must pass.
- `npm run preview` (full worker + local D1) to exercise the stack.
- Preview-tool screenshots of checkout + thank-you at **desktop and mobile**
  widths to confirm the clinical look and responsiveness.

## Out of scope

- Real recurring/subscription billing.
- Any change to payment, worker, cron, auth, or dashboard **logic**.
- Admin dashboard visual restyle (stays on neutral shadcn tokens).
- Actually creating the remote D1 or deploying (deferred to a later, explicit step).

## Risks / notes

- **Visual-only subscribe**: charging the −20% price once while the UI says
  "every 30 days · cancel anytime" is a deliberate, user-approved choice; the
  copy is intentionally aspirational and no recurring schedule is created.
- Token **remap** (keeping warm names, clinical values) means a grep for
  `lime`/`forest`/`rust`/`sand` in components will still match — that's expected;
  the values resolve to clinical colors. Where the sample needs a specific
  cobalt/mint that the remap can't cover cleanly, edit the component markup
  directly.
- Keep the three duplicated `SUCCESS_STATUSES`/`PENDING_STATUSES` and the
  `data-*` semantic markers intact — this is a visual change only.
</content>
</invoke>
