import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { projectRoot } from "./env.js";

export interface LedgerEntry {
  id: string;
  date: string; // ISO timestamp
  type: "income" | "expense";
  label: string;
  amountCents: number; // always positive; type says which direction
  category: string;
  source: string; // e.g. "paypal:ORDER-ID" or "manual"
  receiptId?: string;
}

const DATA_DIR = join(projectRoot(), "data");
const LEDGER_FILE = join(DATA_DIR, "ledger.json");

function readAll(): LedgerEntry[] {
  if (!existsSync(LEDGER_FILE)) return [];
  try {
    const parsed = JSON.parse(readFileSync(LEDGER_FILE, "utf8")) as LedgerEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: LedgerEntry[]): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(LEDGER_FILE, JSON.stringify(entries, null, 2) + "\n", "utf8");
}

/** Append an entry and return it with id + timestamp filled in. */
export function addEntry(
  entry: Omit<LedgerEntry, "id" | "date">,
): LedgerEntry {
  const entries = readAll();
  const full: LedgerEntry = {
    ...entry,
    id: `LE-${Date.now().toString(36)}-${entries.length + 1}`,
    date: new Date().toISOString(),
  };
  entries.push(full);
  writeAll(entries);
  return full;
}

export function loadLedger(): LedgerEntry[] {
  return readAll();
}

export interface Totals {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
}

export function totals(entries: LedgerEntry[] = readAll()): Totals {
  let incomeCents = 0;
  let expenseCents = 0;
  for (const e of entries) {
    if (e.type === "income") incomeCents += e.amountCents;
    else expenseCents += e.amountCents;
  }
  return { incomeCents, expenseCents, balanceCents: incomeCents - expenseCents };
}

/** Reset the ledger (demo helper). */
export function clearLedger(): void {
  writeAll([]);
}
