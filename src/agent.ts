import { addEntry, loadLedger, totals, type LedgerEntry } from "./ledger.js";
import { logReceipt, type Receipt } from "./receipts.js";
import {
  flagWriteOffs,
  totalDeductible,
  type ExpenseInput,
  type WriteOff,
} from "./writeoffs.js";
import { money, type PaymentResult } from "./paypal.js";

export interface JobInput {
  businessName: string;
  customer: string;
  jobDescription: string;
  expenses: ExpenseInput[];
  payment: PaymentResult;
}

export interface AgentRun {
  receipt: Receipt;
  incomeEntry: LedgerEntry;
  expenseEntries: LedgerEntry[];
  writeOffs: WriteOff[];
  deductibleCents: number;
  balanceCents: number;
  summary: string;
}

/**
 * The agent: payment in -> receipt logged -> books updated -> write-offs flagged.
 * One function, four steps, plain-language output at the end.
 */
export function runAgent(job: JobInput): AgentRun {
  const { payment } = job;

  // Validate before booking anything — never silently book a bad payment.
  if (!Number.isFinite(payment.amountCents) || payment.amountCents <= 0) {
    throw new Error(
      `Refusing to book a payment of ${payment.amountCents} cents: amount must be greater than zero.`,
    );
  }
  if (!job.businessName?.trim()) {
    throw new Error("Refusing to book a payment: business name is empty.");
  }
  if (!job.customer?.trim()) {
    throw new Error("Refusing to book a payment: customer name is empty.");
  }
  if (!job.jobDescription?.trim()) {
    throw new Error("Refusing to book a payment: job description is empty.");
  }

  // Source is derived from the payment, never hardcoded: a PayPal capture
  // traces to its PayPal order, a standalone record to its STANDALONE- id.
  const source = `${payment.source ?? "paypal"}:${payment.orderId}`;

  // 1. Receipt — the payment becomes a record.
  const receipt = logReceipt(payment, job.customer, job.jobDescription);

  // 2. Ledger — income in, job expenses out.
  const incomeEntry = addEntry({
    type: "income",
    label: `${job.jobDescription} — paid by ${job.customer}`,
    amountCents: payment.amountCents,
    category: "job-income",
    source,
    receiptId: receipt.id,
  });
  const expenseEntries = job.expenses.map((e) =>
    addEntry({
      type: "expense",
      label: e.label,
      amountCents: e.amountCents,
      category: e.category,
      source,
      receiptId: receipt.id,
    }),
  );

  // 3. Write-offs — tag what's deductible and say why.
  const writeOffs = flagWriteOffs(job.expenses);
  const deductibleCents = totalDeductible(writeOffs);

  // 4. Summary — the books, in words a plumber (not an accountant) can read.
  const t = totals(loadLedger());
  const receiptLine =
    payment.source === "standalone"
      ? `  Receipt ${receipt.id} filed (standalone record ${payment.orderId}, ${payment.mode} — no PayPal account needed).`
      : `  Receipt ${receipt.id} filed (PayPal order ${payment.orderId}, ${payment.mode}).`;
  const lines: string[] = [
    `${job.businessName} — books updated.`,
    `  ${job.customer} paid ${money(payment.amountCents, payment.currency)} for: ${job.jobDescription}.`,
    receiptLine,
    `  Job costs logged: ${job.expenses.length} expense(s) totaling ${money(job.expenses.reduce((s, e) => s + e.amountCents, 0))}.`,
    `  Deductible so far on this job: ${money(deductibleCents)} — flagged for tax time, with the reason for each one.`,
    `  Books right now: ${money(t.incomeCents)} in, ${money(t.expenseCents)} out, balance ${money(t.balanceCents)}.`,
  ];
  if (deductibleCents > 0) {
    lines.push(
      `  Tax-season packet: hand your accountant ${writeOffs.length} flagged item(s) worth ${money(deductibleCents)} in deductions — no shoebox of receipts.`,
    );
  }

  return {
    receipt,
    incomeEntry,
    expenseEntries,
    writeOffs,
    deductibleCents,
    balanceCents: t.balanceCents,
    summary: lines.join("\n"),
  };
}
