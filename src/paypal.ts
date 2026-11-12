/**
 * PayPal sandbox client — raw REST calls, no SDK.
 * Uses the Orders API v2: create order -> payer approves -> capture order.
 * All money here is SANDBOX (fake) money. Never point this at api-m.paypal.com.
 */

const SANDBOX_BASE = "https://api-m.sandbox.paypal.com";

export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
}

export interface PaymentResult {
  orderId: string;
  status: string;
  amountCents: number;
  currency: string;
  payerEmail?: string;
  captureId?: string;
  approveUrl?: string;
  /** "sandbox" = real PayPal sandbox capture. "simulated" = local stand-in, clearly labeled. "standalone" = pop-out record, no PayPal account involved. */
  mode: "sandbox" | "simulated" | "standalone";
  /** Where the payment came from: PayPal, or a standalone record. */
  source: "paypal" | "standalone";
}

export function sandboxConfig(): PayPalConfig | null {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret || clientId.startsWith("your-")) return null;
  return { clientId, clientSecret };
}

async function getAccessToken(cfg: PayPalConfig): Promise<string> {
  const auth = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString("base64");
  const res = await fetch(`${SANDBOX_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`PayPal token request failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

interface OrderResponse {
  id: string;
  status: string;
  links?: Array<{ href: string; rel: string }>;
}

/** Create a sandbox order. Returns the order id and the URL the payer approves at. */
export async function createSandboxOrder(
  cfg: PayPalConfig,
  amountCents: number,
  currency: string,
  description: string,
): Promise<{ orderId: string; approveUrl: string }> {
  const token = await getAccessToken(cfg);
  const res = await fetch(`${SANDBOX_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description,
          amount: {
            currency_code: currency,
            value: (amountCents / 100).toFixed(2),
          },
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`PayPal order create failed: ${res.status} ${await res.text()}`);
  }
  const order = (await res.json()) as OrderResponse;
  const approveUrl = order.links?.find((l) => l.rel === "approve")?.href ?? "";
  return { orderId: order.id, approveUrl };
}

/** Capture an already-approved sandbox order. */
export async function captureSandboxOrder(
  cfg: PayPalConfig,
  orderId: string,
): Promise<PaymentResult> {
  const token = await getAccessToken(cfg);
  const res = await fetch(`${SANDBOX_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`PayPal capture failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    id: string;
    status: string;
    payer?: { email_address?: string };
    purchase_units?: Array<{
      payments?: { captures?: Array<{ id: string; amount?: { value: string; currency_code: string } }> };
    }>;
  };
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  const amount = capture?.amount;
  return {
    orderId: data.id,
    status: data.status,
    amountCents: amount ? Math.round(parseFloat(amount.value) * 100) : 0,
    currency: amount?.currency_code ?? "USD",
    payerEmail: data.payer?.email_address,
    captureId: capture?.id,
    mode: "sandbox",
    source: "paypal",
  };
}

/**
 * Simulated payment — same shape as a real capture, but no network and no
 * credentials. Used by the default demo so it runs anywhere. Every output
 * labels this SIMULATED so nobody mistakes it for real money.
 */
export function simulatePayment(
  amountCents: number,
  currency: string,
  payerEmail: string,
): PaymentResult {
  const n = Math.floor(100000 + Math.random() * 900000);
  return {
    orderId: `SIM-ORDER-${n}`,
    status: "COMPLETED",
    amountCents,
    currency,
    payerEmail,
    captureId: `SIM-CAPTURE-${n}`,
    mode: "simulated",
    source: "paypal",
  };
}

/**
 * Standalone (pop-out) payment — no PayPal account needed.
 *
 * The agent travels with the business: a payment recorded outside PayPal
 * (cash, another processor, a sale off the truck) is booked exactly the
 * same way as a PayPal capture, with its own STANDALONE- record id.
 * Status is "RECORDED", never "COMPLETED", so a standalone record can
 * never be mistaken for a PayPal capture.
 */
export function standalonePayment(
  amountCents: number,
  currency: string,
  payerEmail: string,
  note?: string,
): PaymentResult {
  const n = Math.floor(100000 + Math.random() * 900000);
  return {
    orderId: `STANDALONE-${n}`,
    status: "RECORDED",
    amountCents,
    currency,
    payerEmail,
    mode: "standalone",
    source: "standalone",
  };
  // `note` is accepted for callers that want to label the record (e.g. "cash",
  // "card reader"); it is not stored on the payment — the receipt's
  // description (jobDescription) is the record of what was paid for.
  void note;
}

/** Format cents as $X.XX */
export function money(cents: number, currency = "USD"): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}$${(abs / 100).toFixed(2)} ${currency}`;
}
