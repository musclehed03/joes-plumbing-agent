/**
 * Demo example: "Joe's Plumbing", end to end. Run with `npm run dev`.
 * Title is [Your Business Name Here] — Joe is the demo example only.
 *
 * No credentials needed — the payment is SIMULATED (clearly labeled) so the
 * demo works anywhere. For a real PayPal sandbox payment, use `npm run dev:live`.
 * For the same job with no PayPal account at all, use `npm run dev:standalone`.
 *
 * Story: Javier fixes Stan's drains. Stan pays $185 via PayPal. The agent
 * logs the receipt, updates the books, and flags the write-offs — no
 * QuickBooks, no year-end accountant mess.
 */
import { loadEnv } from "./env.js";
import { runAgent } from "./agent.js";
import { money, simulatePayment } from "./paypal.js";
import { totals, loadLedger } from "./ledger.js";
import { loadReceipts } from "./receipts.js";
import type { ExpenseInput } from "./writeoffs.js";

loadEnv();

const HR = "─".repeat(64);

function section(title: string): void {
  console.log(`\n${HR}\n${title}\n${HR}`);
}

function main(): void {
  console.log('\n🔧  [Your Business Name Here] — payment-to-accounting agent (demo: "Joe\'s Plumbing")');
  console.log("    One job, paid and booked, no accountant required.\n");

  // The job.
  const customer = "Stan";
  const jobDescription = "Drain repair at Stan's house";
  const amountCents = 18500; // $185.00
  const expenses: ExpenseInput[] = [
    { label: "Javier's wages — drain job (3 hrs)", amountCents: 12000, category: "wages" },
    { label: "Drain parts — trap + fittings", amountCents: 3500, category: "parts" },
    { label: "Drive to Stan's — 24 miles round trip", amountCents: 1680, category: "mileage", miles: 24 },
  ];

  // Step 1 — the customer pays.
  section("STEP 1 — Stan pays via PayPal");
  const payment = simulatePayment(amountCents, "USD", "stan@example.com");
  console.log(`  Payment captured: ${money(payment.amountCents)} from ${customer}`);
  console.log(`  Order ${payment.orderId} · status ${payment.status} · mode: ${payment.mode.toUpperCase()} (demo)`);
  console.log(`  (Real sandbox? Run \`npm run dev:live\` with .env credentials.)`);

  // Steps 2–4 — the agent does the books.
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
