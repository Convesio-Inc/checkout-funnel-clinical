import { signCheckoutToken } from '../../jwt';
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
