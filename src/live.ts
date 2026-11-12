/**
 * Live sandbox demo: `npm run dev:live`
 *
 * Same story as the simulated demo, but the payment is a REAL PayPal sandbox
 * order. Needs .env with PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET from a free
 * sandbox account at https://developer.paypal.com/ (sandbox = fake money).
 *
 * Flow: create order -> print approval link -> you approve it in the browser
 * with a sandbox buyer account -> press Enter here -> capture -> agent books it.
 */
import { createInterface } from "node:readline";
import { loadEnv } from "./env.js";
import { runAgent } from "./agent.js";
import {
  captureSandboxOrder,
  createSandboxOrder,
  money,
  sandboxConfig,
} from "./paypal.js";
import type { ExpenseInput } from "./writeoffs.js";

loadEnv();

function waitForEnter(prompt: string): Promise<void> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

async function main(): Promise<void> {
  console.log("\n🔧  [Your Business Name Here] — LIVE PayPal sandbox demo (demo: \"Joe's Plumbing\")\n");
  const cfg = sandboxConfig();
  if (!cfg) {
    console.error(
      "  No sandbox credentials found.\n" +
        "  Copy .env.example to .env and add your sandbox PAYPAL_CLIENT_ID and\n" +
        "  PAYPAL_CLIENT_SECRET (free at https://developer.paypal.com/).\n" +
        "  Or run the no-credentials demo instead: npm run dev\n",
    );
    process.exit(1);
  }

  const amountCents = 18500; // $185.00 — sandbox dollars, not real money
  const jobDescription = "Drain repair at Stan's house";

  console.log(`  Creating a sandbox order for ${money(amountCents)} — "${jobDescription}"...`);
  const { orderId, approveUrl } = await createSandboxOrder(
    cfg,
    amountCents,
    "USD",
    jobDescription,
  );
  console.log(`  Order created: ${orderId}`);
  console.log(`\n  👉 Approve it in your browser (log in with a SANDBOX buyer account):`);
  console.log(`     ${approveUrl}\n`);
  await waitForEnter("  Press Enter after approving the payment... ");

  console.log("  Capturing the payment...");
  const payment = await captureSandboxOrder(cfg, orderId);
  console.log(
    `  Captured: ${money(payment.amountCents, payment.currency)} · status ${payment.status} · payer ${payment.payerEmail ?? "unknown"}`,
  );

  const expenses: ExpenseInput[] = [
    { label: "Javier's wages — drain job (3 hrs)", amountCents: 12000, category: "wages" },
    { label: "Drain parts — trap + fittings", amountCents: 3500, category: "parts" },
    { label: "Drive to Stan's — 24 miles round trip", amountCents: 1680, category: "mileage", miles: 24 },
  ];

  const run = runAgent({
    businessName: '"Joe\'s Plumbing"',
    customer: "Stan",
    jobDescription,
    expenses,
    payment,
  });
  console.log("\n" + run.summary);
  console.log(`\n  Deductible flagged on this job: ${money(run.deductibleCents)}`);
  console.log(`  Dashboard: npm run serve → http://localhost:3000\n`);
}

main().catch((err: unknown) => {
  console.error("\n  Live demo failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
