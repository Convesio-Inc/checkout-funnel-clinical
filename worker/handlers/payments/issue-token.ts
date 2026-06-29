import { signCheckoutToken, verifyCheckoutToken } from '../../jwt';
import { json, readJson } from '../common';
import {
  requireSecret,
  resolveEnvironment,
  singlePaymentEndpoint,
  SUCCESS_STATUSES,
  type UpstreamPaymentResponse,
} from './shared';

interface IssueTokenBody {
  payment_id?: string;
  /** The marker token the SPA still holds from the 3DS return URL. Used to
   *  carry the order context (items/shipping/customer) into the freshly
   *  minted token so the Store Manager notification keeps real data. Optional. */
  context_token?: string;
}

/**
 * Mint a thank-you JWT for a previously-created payment. Used by the thank-you
 * page after a 3DS challenge: the SPA stashed the payment id in sessionStorage
 * before redirecting to the bank, and calls this on return to hydrate a proper
 * `?token=<jwt>` URL.
 */
export async function handleIssueToken(
  request: Request,
  env: Env,
): Promise<Response> {
  const body = await readJson<IssueTokenBody>(request);
  const paymentId = body?.payment_id?.trim();
  if (!paymentId) {
    return json(
      { error: true, message: 'Missing `payment_id` in request body.' },
      { status: 400 },
    );
  }

  const secret = requireSecret(env);
  if (secret instanceof Response) return secret;

  const environment = resolveEnvironment(env);

  let upstream: Response;
  try {
    upstream = await fetch(singlePaymentEndpoint(environment, paymentId), {
      method: 'GET',
      headers: {
        Authorization: secret,
        Accept: 'application/json',
      },
    });
  } catch (err) {
    return json(
      {
        error: true,
        message: `Upstream payment lookup failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  let parsed: UpstreamPaymentResponse | null = null;
  try {
    parsed = text ? (JSON.parse(text) as UpstreamPaymentResponse) : null;
  } catch {
    parsed = null;
  }

  if (!upstream.ok || !parsed || parsed.error) {
    return json(
      {
        error: true,
        message:
          parsed?.message ??
          `Payment not found (${upstream.status} ${upstream.statusText})`,
      },
      { status: upstream.status === 200 ? 404 : upstream.status },
    );
  }

  // Recover the order context from the marker token the SPA still holds, so the
  // re-minted token stays self-contained (refresh-safe) and the Store Manager
  // notification keeps real data. Non-fatal if absent.
  let context: Record<string, unknown> = {};
  if (body?.context_token) {
    try {
      const decoded = await verifyCheckoutToken(body.context_token, env.CPAY_SECRET);
      // Only accept the context if this is a proper marker token (empty
      // payment_id) or it was issued for this exact payment. Mismatched
      // sessions are discarded.
      if (decoded.payment_id === '' || decoded.payment_id === paymentId) {
        context = {
          customer_name: decoded.customer_name,
          customer_email: decoded.customer_email,
          customer_phone: decoded.customer_phone,
          shipping_address: decoded.shipping_address,
          items: decoded.items,
        };
      }
    } catch {
      // ignore — the notification falls back to demo values for missing fields.
    }
  }

  let token: string;
  try {
    // Right after a 3DS challenge, upstream frequently still reports a
    // transitional status until the webhook settles. Preserve the status only
    // when it's a known terminal success; otherwise write "Pending" so the
    // thank-you page starts polling instead of classifying the in-between
    // status as a failure.
    const statusForToken =
      parsed.status && SUCCESS_STATUSES.has(parsed.status)
        ? parsed.status
        : 'Pending';
    token = await signCheckoutToken(
      {
        payment_id: parsed.id ?? paymentId,
        customer_id: parsed.customerId ?? parsed.customer?.id ?? '',
        order_number: parsed.orderNumber ?? '',
        status: statusForToken,
        ...context,
      },
      env.CPAY_SECRET,
    );
  } catch (err) {
    return json(
      {
        error: true,
        message: `Failed to sign redirect token: ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      { status: 500 },
    );
  }

  return json({ token });
}
