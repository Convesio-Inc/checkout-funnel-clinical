/**
 * JWT helpers for the thank-you redirect flow.
 * -----------------------------------------------------------------------------
 * The worker signs a short-lived HS256 token after a successful/pending
 * payment and appends it to the `redirectUrl` pointing at `/thank-you`. The
 * thank-you page then calls `/verify-token` to read the payload back.
 *
 * The signing secret is `CPAY_SECRET` — all data in the payload
 * is already visible in the upstream payment response, so the token exists
 * purely to carry it through a browser redirect with a tamper-evident wrapper.
 * -----------------------------------------------------------------------------
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export interface CheckoutTokenPayload extends JWTPayload {
  payment_id: string;
  customer_id: string;
  order_number: string;
  status: string;
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
