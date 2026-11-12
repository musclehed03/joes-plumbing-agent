/**
 * Standalone (pop-out) demo example: "Joe's Plumbing", end to end.
 * Run with `npm run dev:standalone`.
 *
 * No PayPal account needed — no credentials, no sandbox, no checkout
 * window. The payment is recorded as a standalone record
 * (STANDALONE-…, status RECORDED) and the agent books it exactly the
 * same way as a PayPal capture: receipt → ledger → write-offs.
 *
 * Same story as the PayPal demo: Javier fixes Stan's drains. Stan pays
 * $185 — this time outside PayPal. The agent still logs the receipt,
 * updates the books, and flags the write-offs. This is the pop-out,
 * take-along mode: the agent travels with the business, not locked to
 * one checkout window, and works for a solo seller, a mom-and-pop, or
 * a larger business alike.
 */
import { loadEnv } from "./env.js";
import { runAgent } from "./agent.js";
import { money, standalonePayment } from "./paypal.js";
import { totals, loadLedger } from "./ledger.js";
import { loadReceipts } from "./receipts.js";
import type { ExpenseInput } from "./writeoffs.js";

loadEnv();

const HR = "─".repeat(64);

function section(title: string): void {
  console.log(`\n${HR}\n${title}\n${HR}`);
}

function main(): void {
  console.log('\n🔧  [Your Business Name Here] — standalone pop-out accounting agent (demo: "Joe\'s Plumbing")');
  console.log("    No PayPal account needed — the agent travels with the business.\n");

  // The job — identical to the PayPal demo.
  const customer = "Stan";
  const jobDescription = "Drain repair at Stan's house";
  const amountCents = 18500; // $185.00
  const expenses: ExpenseInput[] = [
    { label: "Javier's wages — drain job (3 hrs)", amountCents: 12000, category: "wages" },
    { label: "Drain parts — trap + fittings", amountCents: 3500, category: "parts" },
    { label: "Drive to Stan's — 24 miles round trip", amountCents: 1680, category: "mileage", miles: 24 },
  ];

  // Step 1 — the payment is recorded standalone, outside PayPal.
  section("STEP 1 — Stan pays (standalone record, no PayPal account)");
  const payment = standalonePayment(amountCents, "USD", "stan@example.com");
  console.log(`  Payment recorded: ${money(payment.amountCents)} from ${customer}`);
  console.log(`  Record ${payment.orderId} · status ${payment.status} · mode: ${payment.mode.toUpperCase()} · source: ${payment.source.toUpperCase()}`);
  console.log(`  (PayPal version? Run \`npm run dev\` for the simulated capture,`);
  console.log(`   or \`npm run dev:live\` for a real sandbox capture.)`);

  // Steps 2–4 — the agent does the books, same as always.
  section("STEP 2–4 — Agent: receipt → ledger → write-offs");
  const run = runAgent({
    businessName: '"Joe\'s Plumbing"',
    customer,
    jobDescription,
    expenses,
    payment,
  });
  console.log(run.summary);

  // Show the write-offs in detail.
  section("WRITE-OFFS FLAGGED (plain language)");
  for (const w of run.writeOffs) {
    console.log(`  • ${w.label}`);
    console.log(`    Deductible: ${money(w.deductibleCents)} of ${money(w.amountCents)}`);
    console.log(`    Why: ${w.reason}`);
    console.log(`    Keep: ${w.keepForRecords}`);
  }

  // Final books.
  section("THE BOOKS");
  const t = totals(loadLedger());
  console.log(`  Income:  ${money(t.incomeCents)}`);
  console.log(`  Expenses: ${money(t.expenseCents)}`);
  console.log(`  Balance: ${money(t.balanceCents)}`);
  console.log(`  Receipts on file: ${loadReceipts().length}`);
  console.log(`\n  Tax time: hand the accountant the flagged write-offs —`);
  console.log(`  ${money(run.deductibleCents)} in deductions from this one job,`);
  console.log(`  instead of a $13,000 cleanup bill.\n`);
  console.log(`  Dashboard: npm run serve → http://localhost:3000`);
  console.log(`  Data lives in ./data/ledger.json and ./data/receipts.json\n`);
}

main();
