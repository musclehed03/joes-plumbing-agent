# PayPal AI Hackathon — Submission Checklist

**Hackathon:** PayPal AI Hackathon (Devpost) — https://paypalaihackathon.devpost.com/
**Deadline:** Thursday, November 12, 2026, 12:00 PM PST = **2:00 PM CT** (20:00 UTC)
**Project:** [Your Business Name Here] — pop-out payment-to-accounting agent
**Demo example:** "Joe's Plumbing" — Joe is an example only, not a real client.

## Checklist

- [x] **Working project** — `npm install && npm run dev` runs the full demo
      end to end with zero credentials (simulated payment, clearly labeled).
      `npm run dev:live` does a real PayPal sandbox capture with `.env` creds.
- [x] **Standalone pop-out demo** — `npm run dev:standalone` runs the same
      Stan job end to end with no PayPal account: the payment is recorded
      as a standalone record (`STANDALONE-…`, status `RECORDED`) and booked
      identically — receipt, ledger, write-offs, $13.20 balance.
- [x] **Public open-source repo** — MIT license included (`LICENSE`).
      **TODO (Sonja):** push this folder to a new public GitHub repo and put
      the repo URL in the Devpost submission.
- [x] **Meaningfully uses PayPal + AI** — PayPal sandbox Orders API
      (create → approve → capture) drives the PayPal flow; the agent
      (deterministic rules + plain-language reasoning) turns the capture —
      or a standalone record — into receipts, a balanced ledger, and
      flagged write-offs.
- [ ] **Under-3-minute YouTube video (public)** — **Sonja records this.**
      Style: really nice, clean, simple. Overlays of the real coded interface
      wherever they fit — PayPal button click, terminal demo, dashboard —
      over the acted / animated beats, so the viewer always sees the real
      thing working. The message is simplicity: download it, permit the
      agent, set it and forget it.
      Suggested script (~2 minutes):
      1. (0:00–0:15) The problem: demo example '"Joe's Plumbing" — Stan pays,
         and then Joe's wife spends the evening doing the books. Or Joe pays
         an accountant $13,000 at tax time.' Overlay: PayPal button.
      2. (0:15–0:45) PayPal demo — run `npm run dev` on screen: Stan pays $185,
         and the five agents hand off in order — Billing takes the payment,
         Accounts Receivable marks it paid, Accountant logs the receipt and
         balances the books, Deduction flags the write-offs, Tax builds the
         packet. Overlay: terminal output as each agent hands off; Flash-style
         blue cuts for the agent working on its own 24/7 instance.
      3. (0:45–1:10) Standalone pop-out demo — run `npm run dev:standalone`:
         the same job, booked with no PayPal account needed. The agent
         travels with the business; it isn't locked to one checkout window.
      4. (1:10–1:35) Show the dashboard (`npm run serve`): income, expenses,
         balance, deductible total, Profit/Expense breakdown, liquid income
         and profit, which account, deposit confirmation attached. Mention
         it's built keyboard- and screen-reader-friendly, with a high-contrast
         toggle and no color-only meaning. Overlay: dashboard full-screen.
      5. (1:35–2:10) Bonus reports — the agent surfaces REAL programs, with
         a * footnote at the bottom of the video citing the source:
         USDA REAP grants up to 25% for rural small-business energy-efficiency
         work* and the federal 25C credit at 30%*, plus WOTC for a qualified
         ex-felon hire — 40% of the first $6,000 in wages, max $2,400*,
         Form 8850 filed within 28 days of start. Forms pre-filled, waiting
         only for his sensitive info (the agent never has that). On-screen
         footnote: "* as evidenced by USDA Rural Development (REAP) /
         IRS §25C / IRS Work Opportunity Tax Credit, IRC §51."
      6. (2:10–2:45) The point: "Download it, permit the agent, set it and
         forget it. PayPal already settles enormous daily volume under a
         trusted name. The next step is supplying fintech like this —
         standalone on its own, or bundled in the Payments SDK — to any small
         business, PayPal customer or not. The books do themselves, and tax
         time is handing over a clean packet. Built for the PayPal AI
         Hackathon — sandbox only, no real money moved."
      Upload to YouTube as **public** (or unlisted — Devpost accepts either,
      public is safest) and paste the link into the submission.
- [ ] **Text description** — draft for Devpost (edit as you like):
      > [Your Business Name Here] is a pop-out, take-along accounting agent for small
      > businesses — five agents in one flow: Billing takes the payment,
      > Accounts Receivable tracks what's owed and paid, Accountant logs the
      > receipt and balances the books, Deduction flags write-offs in plain
      > language, and Tax builds the tax-season packet. A customer pays
      > through PayPal — or outside it, with no PayPal account needed — and
      > the agents flag write-offs in plain language: wages, parts, and
      > mileage, each with the reason it's deductible. No QuickBooks, no
      > year-end accountant cleanup bill. The thesis: PayPal already settles
      > enormous daily volume under a trusted name, so the gradual next step
      > is supplying fintech tools like this — standalone, or bundled in the
      > Payments SDK — to any small business, from a solo seller to a
      > mom-and-pop to a larger business. Demo: a $185 drain repair, paid
      > and booked in seconds, with the books and a tax-season packet to
      > show for it. Built on the PayPal sandbox Orders API, with security
      > and accessibility built in from the start.
- [ ] **Statement of AI tools used** — draft for Devpost:
      > Built with assistance from Muse (Meta's AI coding agent), which wrote
      > the scaffold and the agent logic from a plain-language spec. The
      > shipped agent itself is deterministic rules code (receipt logging,
      > ledger, write-off rules) — no AI model runs at runtime and no model
      > output is presented as fact. PayPal sandbox Orders API for payments.
- [ ] **Devpost registration + submit — Sonja does this herself.**
      1. Go to https://paypalaihackathon.devpost.com/ → "Join Hackathon"
         (free Devpost account).
      2. Submit before **Thu Nov 12, 2:00 PM CT**: repo URL, demo video link,
         text description, AI-tools statement. You can edit the submission
         until the deadline — submit early, refine after.
      3. After the deadline, don't touch the repo/README/video until winners
         are announced.

## Why now

In July 2026, Reuters reported that Stripe and Advent International jointly
offered $60.50/share for PayPal — valuing it at more than $53 billion,
backed by ~$50 billion in committed bank financing, a ~28% premium to the
prior close (initial approach early April 2026; joint equal ownership; no
certainty of a deal). Later reports in November 2026 said the talks stalled
over price and the efforts halted. Whether or not any deal ever happens,
the bid itself proves PayPal's value is its settlement volume, its trusted
name, and its consumer/merchant network — which is exactly why supplying
fintech tools like this agent is its next logical move.

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

## Rules notes (verified)

- Solo entry is fine; no maximum team size.
- Project must meaningfully use **both** PayPal (sandbox is fine) and AI.
- Code must be fresh for this hackathon — nothing reused from Hive-Mind,
  Flow, or any other repo. (This scaffold was written from scratch for it.)
- No real money: sandbox only. No real PayPal account data anywhere in the repo.
- Security posture: sandbox only, secrets env-only and never committed, no
  card/bank/SSN/password data ever collected or stored, amounts validated
  before booking, dashboard read-only with security headers on every response.
