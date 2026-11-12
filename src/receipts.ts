import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { projectRoot } from "./env.js";
import type { PaymentResult } from "./paypal.js";

export interface Receipt {
  id: string;
  date: string; // ISO timestamp
  orderId: string;
  captureId?: string;
  payer: string;
  description: string;
  amountCents: number;
  currency: string;
  mode: "sandbox" | "simulated" | "standalone";
}

const DATA_DIR = join(projectRoot(), "data");
const RECEIPTS_FILE = join(DATA_DIR, "receipts.json");

function readAll(): Receipt[] {
  if (!existsSync(RECEIPTS_FILE)) return [];
  try {
    const parsed = JSON.parse(readFileSync(RECEIPTS_FILE, "utf8")) as Receipt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(receipts: Receipt[]): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(RECEIPTS_FILE, JSON.stringify(receipts, null, 2) + "\n", "utf8");
}

/** Turn a captured payment into a stored receipt. */
export function logReceipt(
  payment: PaymentResult,
  payer: string,
  description: string,
): Receipt {
  const receipts = readAll();
  const receipt: Receipt = {
    id: `RCPT-${Date.now().toString(36)}-${receipts.length + 1}`,
    date: new Date().toISOString(),
    orderId: payment.orderId,
    captureId: payment.captureId,
    payer,
    description,
    amountCents: payment.amountCents,
    currency: payment.currency,
    mode: payment.mode,
  };
  receipts.push(receipt);
  writeAll(receipts);
  return receipt;
}

export function loadReceipts(): Receipt[] {
  return readAll();
}

export function clearReceipts(): void {
  writeAll([]);
}
