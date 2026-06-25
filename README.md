# Checkout Funnel - Clinical

A production-ready **single-page application** that renders an **integrated ConvesioPay checkout**, ready to deploy on [Convesio Static Sites](https://convesio.com).

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4** and **shadcn/ui**, served from a **Cloudflare Worker** that proxies payment calls server-side so your API keys never leave the server.

---

## Table of Contents

- [ConvesioPay Stateless Checkout](#convesiopay-stateless-checkout)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [How it Works](#how-it-works)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
    - [1. Get the code](#1-get-the-code)
    - [2. Deploy to Convesio Static Sites](#2-deploy-to-convesio-static-sites)
    - [3. Create a ConvesioPay integration](#3-create-a-convesiopay-integration)
    - [4. Configure environment variables](#4-configure-environment-variables)
    - [5. Verify the checkout](#5-verify-the-checkout)
  - [Environment Variables](#environment-variables)
  - [Worker Routes](#worker-routes)
  - [Payment Flow](#payment-flow)
  - [Testing the Checkout](#testing-the-checkout)
  - [Customization](#customization)
    - [1. Copy, prices and images — edit the component directly](#1-copy-prices-and-images--edit-the-component-directly)
    - [2. Brand colors — `src/index.css`](#2-brand-colors--srcindexcss)
    - [3. Layout and behavior — section components](#3-layout-and-behavior--section-components)
  - [Local Development](#local-development)
    - [1. Install dependencies](#1-install-dependencies)
    - [2. Configure local secrets](#2-configure-local-secrets)
    - [3. Run the dev server](#3-run-the-dev-server)
  - [Available Scripts](#available-scripts)
  - [Project Structure](#project-structure)
  - [Going Live](#going-live)
  - [Security Notes](#security-notes)
  - [Troubleshooting](#troubleshooting)
  - [Resources](#resources)

---

## Features

- **Full checkout flow out of the box** — product page, checkout form (customer + shipping + payment), order summary and a "Thank You" confirmation page.
- **3D Secure (3DS) support** — the checkout automatically handles 3DS bank challenges via sessionStorage and resumes the flow on return, polling for the final payment status.
- **Secure by design** — your secret keys live only in the Cloudflare Worker; the browser never sees them.
- **Re-skinnable in minutes** — copy, prices and images live inline in the component that renders them; each component starts with a JSDoc header so you can find and edit the right file instantly. Brand colors are driven by a handful of CSS variables.
- **Sandbox-first** — ships in test mode so you can iterate safely before going live with a single environment-variable change.
- **Modern stack** — React 19, TypeScript, Vite, Tailwind v4, shadcn/ui components, React Router 7.
- **Stateless** — no database, no user accounts, no backend state—just a checkout Worker and an SPA.

---

## How it Works

```text
                 ┌────────────────────────┐
                 │   Browser (SPA)        │
                 │   React + ConvesioPay  │
                 │   iframe SDK           │
                 └───────────┬────────────┘
                             │  1. GET  /config        (public client key)
                             │  2. POST /payments      (tokenized card)
                             │  3. POST /verify-token  (decode thank-you JWT)
                             │  4. POST /issue-token   (mint JWT after 3DS)
                             │  5. POST /poll-payment  (poll payment status)
                             ▼
                 ┌────────────────────────┐
                 │  Cloudflare Worker     │
                 │  worker/index.ts       │
                 │  Holds CPAY_SECRET +   │
                 │  CPAY_API_KEY          │
                 └───────────┬────────────┘
                             │  Signed, server-to-server
                             ▼
                 ┌────────────────────────┐
                 │  ConvesioPay API       │
                 │  sandbox  /  live      │
                 └────────────────────────┘
```

The SPA tokenizes the card with the ConvesioPay SDK iframe, then the Worker validates the payload and forwards it to ConvesioPay with the secret credentials. On a standard payment the customer is redirected to the Thank You page via a signed JWT in the URL. On a **3DS challenge** the SPA stashes the payment id in `sessionStorage`, sends the user to the bank's verify-customer page, and on return calls `/issue-token` to mint a thank-you JWT, then `/poll-payment` to track the final status.

---

## Prerequisites

Before you start, make sure you have:

| Requirement | Purpose | Sign-up |
|---|---|---|
| **Convesio account** | Host and deploy the Static Site | [console.convesio.com/register](https://console.convesio.com/register) |
| **ConvesioPay account** | Accept payments through the checkout | [convesiopay.com/auth/sign-up](https://convesiopay.com/auth/sign-up) |
---

## Quick Start

### 1. Get the code

Fork or clone this repository into your own GitHub account:

```bash
git clone https://github.com/Convesio-Inc/checkout-funnel-v5.git
cd checkout-funnel-v5
npm install
```

### 2. Deploy to Convesio Static Sites

From your Convesio console, create a new Static Site pointing at your forked repository. Convesio will build and host it automatically. You'll get a public URL — keep it handy for the next step.

### 3. Create a ConvesioPay integration

1. Log in to the [ConvesioPay Sandbox console](https://dev.convesiopay.com/) (or [ConvesioPay's Live Console](https://convesiopay.com/) for live environments).
2. Navigate to **Advanced Settings → [Connected Integrations](https://dev.convesiopay.com/advanced-settings/connected-integrations)** and click **CREATE NEW INTEGRATION**. Give it a name of your choice — you'll need it later as `CPAY_INTEGRATION`.
3. Copy the **integration secret key** that gets generated. This will be your `CPAY_SECRET`.
4. Go to **Advanced Settings → [Get Your API Key](https://dev.convesiopay.com/advanced-settings/api-key)** and copy your API key. This will be your `CPAY_API_KEY`.

### 4. Configure environment variables

In your Convesio Static Site settings, add the following variables (see [Environment Variables](#environment-variables) below for details):

- `CPAY_INTEGRATION`
- `CPAY_SECRET`
- `CPAY_API_KEY`

### 5. Verify the checkout

Open your Static Site URL and run a test payment using the card numbers from the [Testing the Checkout](#testing-the-checkout) section. If everything is wired up correctly, you'll land on the Thank You page.

---

## Environment Variables

Three credentials are required. They are injected at runtime into the Cloudflare Worker — the browser never has direct access to them.

| Variable | Type | Description |
|---|---|---|
| `CPAY_INTEGRATION` | secret | Name of the integration you created in the ConvesioPay console. |
| `CPAY_SECRET` | secret | Server-side integration secret. **Never expose this client-side.** |
| `CPAY_API_KEY` | secret | ConvesioPay API key used for server-to-server calls. |
| `CPAY_ENVIRONMENT` | var | `"test"` (default) or `"live"`. Configured in `wrangler.jsonc`. |

> These three secrets are declared in `wrangler.jsonc` under `secrets.required` — Wrangler will refuse to deploy if any are missing. For local development, set them in a `.dev.vars` file at the project root (see [Local Development](#local-development)).

---

## Worker Routes

The Cloudflare Worker exposes exactly five routes:

| Route | Method | Purpose |
|---|---|---|
| `/config` | GET | Returns the public ConvesioPay client key for SDK initialization. |
| `/payments` | POST | Accepts a tokenized card, creates a payment via ConvesioPay API, and returns a signed JWT redirect. |
| `/verify-token` | POST | Decodes a thank-you JWT and returns the order/payment context for the confirmation page. |
| `/issue-token` | POST | Mints a new JWT after 3DS challenge completion; used to resume the thank-you flow. |
| `/poll-payment` | POST | Polls ConvesioPay for the current payment status; used to track async/pending payments. |

---

## Payment Flow

1. **GET /config** — Browser loads the ConvesioPay SDK iframe and requests the public client key.
2. **Card tokenization** — Customer submits their card details. The ConvesioPay SDK tokenizes the card client-side; raw card data never leaves the browser.
3. **POST /payments** — Browser sends the tokenized card to the Worker. The Worker forwards it to ConvesioPay with the secret credentials.
   - **Success**: Worker signs a JWT containing order and payment IDs, redirects to `/thank-you?token=<JWT>`.
   - **3DS required**: ConvesioPay returns a 3DS challenge URL. The Worker stores the payment ID in a pre-signed marker JWT and redirects the browser to the bank's challenge page.
4. **3DS challenge resume** — Customer completes the bank challenge and is redirected back to `/thank-you` with a marker token in sessionStorage.
5. **POST /issue-token** — Browser calls this to mint the real thank-you JWT once the challenge is complete.
6. **POST /verify-token** — Browser calls this to decode the JWT and fetch order/payment details for display on the thank-you page.
7. **POST /poll-payment** — If the payment status is still `Pending`, the thank-you page polls this route every 5 seconds until a terminal status is reached.

---

## Testing the Checkout

While `CPAY_ENVIRONMENT` is set to `"test"`, use any of the official ConvesioPay [test cards](https://docs.convesiopay.com/convesiopay-payment-checkout-integration-api/payments/test-cards). A good one to start with:

| Card Number | Type | Expiration | CVC |
|---|---|---|---|
| `4000 0200 0000 0000` | Visa | `03/30` | `737` |

A successful transaction should land the user on the Thank You page. Failed / pending outcomes are rendered through the in-checkout `PaymentStatusDialog`.

---

## Customization

The template is designed to be re-skinned in two layers of increasing depth. **Start from layer 1 and only go deeper if you need to.**

### 1. Copy, prices and images — edit the component directly

Every user-visible string, price and image lives **inline in the component or page that renders it**. There is no separate config file — just find the right file, edit the value, save.

Each component starts with a JSDoc header that describes what it renders and lists its `data-*` markers, making it easy to navigate. Quick reference by what you see on the page:

| What you want to change | File to edit |
|---|---|
| Top navigation bar (brand name, nav links) | `src/components/site/SiteHeader.tsx` |
| Checkout info strip (badge + messages) | `src/components/checkout/CheckoutHeader.tsx` |
| Countdown timer (start time, text) | `src/components/checkout/CheckoutTimer.tsx` |
| Customer / shipping / payment form labels | `CustomerInfo.tsx` / `ShippingInfo.tsx` / `PaymentInfo.tsx` in `src/components/checkout/` |
| Country list in shipping form | `COUNTRIES` constant in `src/components/checkout/ShippingInfo.tsx` |
| Order summary sidebar (product, prices, CTA) | `src/components/checkout/OrderSummaryCard.tsx` |
| Checkout page title / subtitle | `src/pages/CheckoutPage.tsx` |
| Product page content | `src/pages/ProductPage.tsx` |
| Thank-you page content | `src/pages/ThankYouPage.tsx` |
| Footer | `src/components/site/SiteFooter.tsx` |

Replace the placeholder product and brand images by swapping the files in `public/` and updating the `src` paths in the relevant components above.

> **⚠ Keep payment amount in sync:** `amountMinor` in `src/pages/CheckoutPage.tsx` is the charge sent to ConvesioPay (in cents). It must match the displayed "Total" in `src/components/checkout/OrderSummaryCard.tsx`. Both files have a warning comment as a reminder.

### 2. Brand colors — `src/index.css`

Two groups of CSS variables in the `/* === BRAND THEME === */` block drive the colors of the checkout.

**Brand tokens** (accent colors, focus rings, etc.):

```css
--brand                    /* primary brand fill */
--brand-foreground         /* text/icon color on --brand */
--brand-accent             /* accent fill (links, focus rings, etc.) */
--brand-accent-foreground  /* text/icon color on --brand-accent */
```

**Pay Now CTA gradient button**:

```css
--pay-cta-from          /* gradient start */
--pay-cta-to            /* gradient end */
--pay-cta-hover-from    /* hover gradient start */
--pay-cta-hover-to      /* hover gradient end */
--pay-cta-foreground    /* button text color */
```

### 3. Layout and behavior — section components

Each section of the checkout lives in its own component under `src/components/checkout/`:

- `CheckoutHeader.tsx`
- `CustomerInfo.tsx`
- `ShippingInfo.tsx`
- `PaymentInfo.tsx`
- `OrderSummaryCard.tsx`
- `CheckoutTimer.tsx` — urgency countdown timer
- `PaymentStatusDialog.tsx`

Shared layout atoms used by the above live in `src/components/checkout/primitives/` (`PriceRow.tsx`, `SectionCard.tsx`).

The global site header and footer are in `src/components/site/` (`SiteHeader.tsx`, `SiteFooter.tsx`) and are rendered by `App.tsx` as layout wrappers around every page.

Compose or reorder the checkout components in `src/pages/CheckoutPage.tsx`. Each component starts with a JSDoc header listing its props and `data-*` markers.

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure local secrets

Create a `.dev.vars` file at the project root (copy from `.env.example` if present) with the three ConvesioPay credentials:

```bash
CPAY_API_KEY=...
CPAY_SECRET=...
CPAY_INTEGRATION=...
```

> `.dev.vars` is git-ignored. Never commit real credentials.

### 3. Run the dev server

```bash
npm run dev        # Vite dev server (SPA only)
```

For a full local environment that also runs the Cloudflare Worker:

```bash
npm run preview    # Builds + serves through Wrangler
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server (SPA only, no worker). |
| `npm run build` | TypeScript typecheck + Vite production build. |
| `npm run lint` | Run ESLint over the codebase. |
| `npm run preview` | Build and preview the production bundle locally. |
| `npm run deploy` | Build and deploy to Cloudflare via Wrangler. |
| `npm run cf-typegen` | Regenerate Cloudflare binding types from `wrangler.jsonc`. |
| `npm run add-envs` | Push all four ConvesioPay secrets to Cloudflare at once. |

---

## Project Structure

```text
.
├── public/                      Static assets (product & brand images)
├── src/
│   ├── components/
│   │   ├── checkout/            Checkout-page section components
│   │   │   └── primitives/      Shared layout atoms (PriceRow, SectionCard)
│   │   ├── product/             Product-page components
│   │   ├── site/                Global layout (SiteHeader, SiteFooter)
│   │   ├── thank-you/           Thank-you-page components
│   │   └── ui/                  shadcn/ui primitives
│   ├── hooks/                   Checkout / payment / SDK / thank-you hooks
│   ├── interfaces/              Global TypeScript ambient declarations
│   ├── lib/                     Utilities + ConvesioPay SDK singleton
│   ├── pages/                   Route-level pages (Product, Checkout, ThankYou)
│   ├── index.css                ★ Brand theme tokens
│   ├── App.tsx                  Router + global SiteHeader/SiteFooter layout
│   └── main.tsx                 App entry
├── worker/
│   ├── index.ts                 Worker entry: /config, /payments, /verify-token,
│   │                            /issue-token, /poll-payment routes
│   └── jwt.ts                   JWT helpers for secure server calls
├── wrangler.jsonc               Cloudflare Worker configuration
├── package.json
└── README.md
```

---

## Going Live

When you're confident the checkout works end-to-end in sandbox:

1. Create a **production** integration in the live ConvesioPay console (not the `dev.` one) and capture its credentials.
2. Update your Static Site's environment variables with the **live** `CPAY_*` secrets.
3. In `wrangler.jsonc`, change:

   ```jsonc
   "vars": {
     "CPAY_ENVIRONMENT": "live"
   }
   ```

4. Redeploy and process a small real transaction to verify.

---

## Security Notes

- **Always start in sandbox.** Test thoroughly with the [official test cards](https://docs.convesiopay.com/convesiopay-payment-checkout-integration-api/payments/test-cards) before flipping `CPAY_ENVIRONMENT` to `"live"`.
- **Never hardcode credentials.** All keys must live in environment variables, never in frontend code or committed files.
- **Never return the `env` object** from the Worker's `fetch` function on any API endpoint — doing so would expose every secret.
- **Keep dependencies up to date** with `npm audit` and regular upgrades.

---

## Troubleshooting

**I get a 401 / 403 from `/payments`.**
Verify `CPAY_SECRET`, `CPAY_API_KEY` and `CPAY_INTEGRATION` are set as Worker secrets (not just plain vars) and match the integration you're pointing at.

**Payment succeeds in sandbox but fails in live.**
Live integrations require their own distinct credentials — sandbox keys won't work against the live API. Double-check you've created a separate integration in the production console.

---

## Resources

- [Convesio Console](https://console.convesio.com)
- [ConvesioPay Console](https://convesiopay.com) · [Sandbox Console](https://dev.convesiopay.com)
- [ConvesioPay Checkout Integration Docs](https://docs.convesiopay.com/convesiopay-payment-checkout-integration-api)
- [ConvesioPay Test Cards](https://docs.convesiopay.com/convesiopay-payment-checkout-integration-api/payments/test-cards)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Vite](https://vitejs.dev) · [React](https://react.dev) · [Tailwind CSS](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com)
