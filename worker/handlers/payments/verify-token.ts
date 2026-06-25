import { verifyCheckoutToken } from '../../jwt';
import { json, readJson } from '../common';

interface VerifyTokenBody {
  token?: string;
}

export async function handleVerifyToken(
  request: Request,
  env: Env,
): Promise<Response> {
  const body = await readJson<VerifyTokenBody>(request);
  const token = body?.token?.trim();
  if (!token) {
    return json(
      { error: true, message: 'Missing `token` in request body.' },
      { status: 400 },
    );
  }

  try {
    const payload = await verifyCheckoutToken(token, env.CPAY_SECRET);
    return json({
      payment_id: payload.payment_id,
      customer_id: payload.customer_id,
      order_number: payload.order_number,
      status: payload.status,
    });
  } catch (err) {
    return json(
      {
        error: true,
        message: `Invalid or expired token: ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      { status: 400 },
    );
  }
}
