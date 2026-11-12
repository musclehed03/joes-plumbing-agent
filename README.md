# joes-plumbing-agent
 An Unusual, Pay agent with some pretty useful and unique Quirks! -- Initially Built for PayPal 2026 Hack-A-Thon

# [Your Business Name Here] — Payment-to-Accounting Agent

**PayPal AI Hackathon 2026 entry.** A pop-out, take-along accounting agent
for any small business — put your business name here, the agent travels
with it. A customer pays — through PayPal, or outside it — and
the agent does the rest: logs the receipt, balances the books, and flags
write-offs — so a plumber never has to open QuickBooks or pay a $13,000
year-end cleanup bill. No PayPal account is required to use it.

Demo example throughout: "Joe's Plumbing" — Javier fixes Stan's drains,
Stan pays $185. Joe is an example only, not a real client.

## The thesis — PayPal as a FinTech supplier

PayPal already moves and settles enormous daily volume, under a trusted
name, with a settlement and dispute record built over years. The gradual
next step is supplying fintech tools like this agent — standalone on its
own, or bundled inside the Payments SDK / checkout — to any small business,
whether or not they hold or pay through PayPal.

Pop-out / take-along: the agent travels with the business, not locked to
one checkout window. It serves the same job for a solo seller selling shoes
off a truck or clearing out old stuff, a mom-and-pop shop, and a larger
business entity alike. The payment source changes; the books don't.

## Why now

In July 2026, Reuters reported that Stripe and Advent International jointly
offered $60.50/share for PayPal — valuing it at more than $53 billion,
backed by ~$50 billion in committed bank financing, a ~28% premium to the
prior close (initial approach early April 2026; joint equal ownership; no
certainty of a deal). Later reports in November 2026 said the talks stalled
over price and the efforts halted.

Whether or not any deal ever happens, the bid itself proves the point:
PayPal's value is its settlement volume, its trusted name, and its
consumer/merchant network. Supplying fintech tools like this agent —
standalone, or bundled in the Payments SDK — is the next logical move
for a company whose worth is already in moving and settling other
people's money.

The bull-case analyst view points the same way: a number of Wall Street
analysts — Canaccord Genuity, Citizens, JMP Securities, and Monness
Crespi Hardt — held $100+ price targets on PayPal over the past year
(consensus average $82–84, high estimate $126), and Michael Burry put
its intrinsic value at $75–115 a share with a winning bid around $100.
PayPal's board reportedly turned down the $60.50 offer seeking closer to
$70. The counterweight, honestly: today's consensus is lower, averaging
~$56 with the most bullish target at $70, so the $100+ view is the bull
case, not the consensus — but the gap between what the market credits
(~$56–60) and what the network is valued at is exactly the
value-creating opening for supplying fintech tools like this agent.

## The demo story

Javier fixes the drains at Stan's house. Stan pays **$185** through PayPal.
Within seconds the agent has:

1. **Captured the payment** (PayPal sandbox Orders API — fake money, real API)
2. **Logged the receipt** (`RCPT-…`, tied to the PayPal order id)
3. **Updated the ledger** — $185 in; $120 Javier's wages, $35 parts, $16.80 mileage out
4. **Flagged the write-offs** in plain language — wages 100% deductible
   ("ordinary business expense"), parts 100%, mileage at the IRS standard rate
5. **Shown the balance** — $13.20 — and a tax-season packet the accountant can just sign

No staff on sales calls all night. No wife-as-secretary doing the books after
dinner. The bot sits on the payment page and does the daily grind.

## Five agents, one flow

One deterministic agent, five named roles — each step is a handoff, not a
black box:

1. **Billing agent** — takes the payment (PayPal sandbox, or a standalone
   record) and issues the receipt (`RCPT-…`).
2. **Accounts Receivable agent** — tracks what's owed and what's paid: $185
   in from Stan, against the job.
3. **Accountant agent** — logs the receipt and balances the books: $185 in,
   $171.80 out, $13.20 balance.
4. **Deduction agent** — flags the write-offs in plain language, with the
   reason each one counts: wages 100%, parts 100%, mileage at the IRS
   standard rate. Anything without a rule is left unflagged — "ask your
   accountant" — it never invents a deduction.
5. **Tax agent** — builds the tax-season packet from the ledger, so the
   accountant just signs it instead of rebuilding the year.

Run the same job with no PayPal account at all — `npm run dev:standalone` —
and the agent books it identically, from a standalone record
(`STANDALONE-…`, status `RECORDED`) instead of a PayPal order.

## Run it

```bash
npm install
npm run dev            # full demo, no credentials needed (payment is SIMULATED, clearly labeled)
npm run dev:live       # real PayPal sandbox payment (needs .env — see below)
npm run dev:standalone # pop-out demo — same job, no PayPal account needed
npm run serve          # dashboard at http://localhost:3000
npm run build          # typecheck + compile to dist/
```

## Real sandbox payments

Free, fake money, real API:

1. Create a sandbox account at https://developer.paypal.com/ (Sandbox, not live).
2. `cp .env.example .env` and add your sandbox `PAYPAL_CLIENT_ID` and
   `PAYPAL_CLIENT_SECRET`.
3. `npm run dev:live` — it prints an approval link. Approve it in the browser
   with a **sandbox buyer** account, press Enter, and the agent captures it
   and books it.

`.env` is gitignored. **Never put real PayPal credentials (or a live account)
in this repo.** The default demo needs no credentials at all.

## Security first

Built in from the start, not bolted on later:

- **Sandbox only.** The PayPal client talks to `api-m.sandbox.paypal.com`
  only. It never points at the live API (`api-m.paypal.com`), and no real
  money ever moves in this project.
- **Secrets are env-only.** Sandbox credentials live in `.env`, which is
  gitignored. Never commit credentials, tokens, or keys.
- **Minimal data, local only.** No card numbers, bank details, SSN, or
  passwords are ever collected or stored. The agent keeps only payer
  name/email, amounts, and job labels, in local JSON files under `./data/`
  (`ledger.json`, `receipts.json`). Nothing leaves the machine except the
  sandbox API calls in `dev:live` mode.
- **Amounts validated before booking.** `runAgent` rejects any payment of
  zero or less, and any job with an empty business, customer, or job
  description, with a clear error — it never silently books a bad payment.
- **Dashboard is read-only and headed.** `GET /api/state` only returns
  state; it never accepts a write. Every dashboard response carries
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: no-referrer`, and a restrictive self-only
  Content-Security-Policy (no remote sources).
- **The agent never invents a deduction.** Anything without a rule is left
  unflagged with "ask your accountant."

**Demo bookkeeping, not tax advice.** Mileage uses the IRS standard rate
(70¢/mile in the demo — check the current year's rate). Meals are flagged at
50%. Rates and rules change; a human makes the final call at tax time.

## Accessibility first

Also built in from the start, not bolted on later. The dashboard
(`public/index.html`):

- **Keyboard:** a skip link ("Skip to the books") jumps straight to the
  main content, and every control has a visible focus outline.
- **Screen reader:** `<header>` / `<main>` landmarks, a table `<caption>`
  on every table, proper `<th scope="col">`, and an `aria-live="polite"`
  region on the totals cards so updated totals are announced.
- **Contrast:** base font is 18px with 1.5 line height; secondary text is
  #c9c9d4 on dark (never the old faint #9a9aa5). A working **High contrast**
  toggle switches to pure black/white with stronger borders, persists in
  `localStorage`, and the page also honors `prefers-contrast: more`
  automatically.
- **Reduced motion:** `prefers-reduced-motion` disables transitions and
  animations.
- **No color-only meaning:** income, balance, and deductible values are
  always named in text labels and shown with +/- signs; the green/amber
  card colors are decorative only.

## What the agent is

Deterministic rules code, not a black box: receipt logger, JSON ledger
(`data/ledger.json`), write-off rules with plain-language reasons. It never
invents a deduction — anything without a rule is left unflagged with "ask your
accountant." Every number traces back to a PayPal order id or a standalone
record id (`paypal:<orderId>` / `standalone:<orderId>` in the ledger source).

## Project layout

```
src/
  demo.ts            # CLI demo — the whole Stan story, end to end (simulated PayPal payment)
  demo-standalone.ts # CLI demo — same Stan story, standalone pop-out record, no PayPal account
  live.ts            # real sandbox flow: create → approve → capture → book
  agent.ts           # the agent: receipt → ledger → write-offs → plain-language summary
  paypal.ts          # PayPal sandbox Orders API client (raw fetch, no SDK) + standalonePayment()
  ledger.ts          # JSON ledger, running balance
  receipts.ts        # receipt log
  writeoffs.ts       # deductible rules + plain-language reasons
  server.ts          # tiny dashboard server (node:http, zero deps) with security headers
  env.ts             # minimal .env loader
public/index.html  # dashboard UI (keyboard, screen reader, contrast, reduced motion)
data/              # ledger.json + receipts.json (generated, gitignored)
```

## Tech

TypeScript + Node 18+ (uses built-in `fetch`). Dev-only deps: `typescript`,
`tsx`, `@types/node`. No runtime dependencies, no PayPal SDK — the Orders API
is called directly so the integration is visible and auditable.

## License

MIT — see `LICENSE`.
