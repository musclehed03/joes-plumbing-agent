/**
 * Tiny demo dashboard: `npm run serve`
 * Serves public/index.html and a read-only JSON view of the books.
 * Zero dependencies — plain node:http.
 *
 * Security-first: every response carries security headers (see
 * setSecurityHeaders), and /api/state is READ-ONLY — it only ever
 * returns state, it never accepts writes, credentials, or card data.
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadEnv, projectRoot } from "./env.js";
import { loadLedger, totals } from "./ledger.js";
import { loadReceipts } from "./receipts.js";
import { flagWriteOffs, totalDeductible } from "./writeoffs.js";
import { money } from "./paypal.js";

loadEnv();

const PORT = Number(process.env.PORT ?? 3000);

/** Security headers on every response. CSP is self-only: the dashboard's
 *  inline script/style are local, no remote sources are ever loaded. */
function setSecurityHeaders(res: ServerResponse): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  );
}

function sendJson(res: ServerResponse, data: unknown): void {
  setSecurityHeaders(res);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data, null, 2));
}

function state(): Record<string, unknown> {
  const ledger = loadLedger();
  // Receipts pass through as stored, mode included — PayPal (sandbox /
  // simulated) and standalone records alike. No source is special-cased here.
  const receipts = loadReceipts();
  const t = totals(ledger);
  // Re-derive write-offs from the expense entries in the ledger.
  const expenses = ledger
    .filter((e) => e.type === "expense")
    .map((e) => ({
      label: e.label,
      amountCents: e.amountCents,
      category: (e.category === "wages" ||
      e.category === "parts" ||
      e.category === "mileage" ||
      e.category === "meals" ||
      e.category === "tools"
        ? e.category
        : "other") as "wages" | "parts" | "mileage" | "meals" | "tools" | "other",
    }));
  const writeOffs = flagWriteOffs(expenses);
  return {
    business: '"Joe\'s Plumbing"',
    totals: {
      income: money(t.incomeCents),
      expenses: money(t.expenseCents),
      balance: money(t.balanceCents),
      deductible: money(totalDeductible(writeOffs)),
    },
    receipts,
    ledger,
    writeOffs: writeOffs.map((w) => ({
      label: w.label,
      amount: money(w.amountCents),
      deductible: money(w.deductibleCents),
      reason: w.reason,
    })),
  };
}

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const url = req.url ?? "/";
  if (url === "/api/state") {
    // Read-only: returns the books, never accepts a write.
    sendJson(res, state());
    return;
  }
  if (url === "/" || url === "/index.html") {
    const file = join(projectRoot(), "public", "index.html");
    if (existsSync(file)) {
      setSecurityHeaders(res);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(readFileSync(file, "utf8"));
      return;
    }
  }
  setSecurityHeaders(res);
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`\n🔧  [Your Business Name Here] dashboard: http://localhost:${PORT}`);
  console.log(`    API: http://localhost:${PORT}/api/state`);
  console.log(`    Run the demo first if the books are empty: npm run dev\n`);
});
