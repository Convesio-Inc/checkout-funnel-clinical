/**
 * JWT helpers for the thank-you redirect flow.
 * -----------------------------------------------------------------------------
 * The worker signs a short-lived HS256 token after a successful/pending
 * payment and appends it to the `redirectUrl` pointing at `/thank-you`. The
 * thank-you page then calls `/verify-token` to read the payload back.
 *
 * The signing secret is the `CPAY_SECRET`. The token also carries the order
 * context (customer, shipping, line items) captured at `/payments` time, so the
 * worker can build the Store Manager `order.created` notification later (and
 * survive a 3DS redirect) without any storage. It exists purely to carry this
 * data through a browser redirect with a tamper-evident wrapper.
 * -----------------------------------------------------------------------------
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export interface ReceiptLineItem {
  sku: string;
  description: string;
  quantity: number;
  amountMinor: number;
}

export interface CheckoutTokenPayload extends JWTPayload {
  payment_id: string;
  customer_id: string;
  order_number: string;
  status: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: Record<string, unknown> | null;
  items?: ReceiptLineItem[];
}

function keyFromSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signCheckoutToken(
  payload: Omit<CheckoutTokenPayload, keyof JWTPayload>,
  secret: string,
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .sign(keyFromSecret(secret));
}

export async function verifyCheckoutToken(
  token: string,
  secret: string,
): Promise<CheckoutTokenPayload> {
  const { payload } = await jwtVerify(token, keyFromSecret(secret));
  return payload as CheckoutTokenPayload;
}
