/**
 * Write-off flagger — plain-language deductible tagging.
 *
 * This is demo bookkeeping logic, NOT tax advice. Rates and rules change;
 * the agent flags candidates and explains why in plain words, and a human
 * (or a real accountant) makes the final call at tax time.
 */

export type ExpenseCategory =
  | "wages"
  | "parts"
  | "mileage"
  | "meals"
  | "tools"
  | "other";

export interface ExpenseInput {
  label: string;
  amountCents: number;
  category: ExpenseCategory;
  detail?: string;
  /** Business miles driven (mileage category only). */
  miles?: number;
}

export interface WriteOff {
  label: string;
  amountCents: number;
  deductibleCents: number;
  category: ExpenseCategory;
  reason: string;
  /** What to keep on file to back this up. */
  keepForRecords: string;
}

/** IRS standard mileage rate used for the demo. Check the current year's rate. */
export const MILEAGE_RATE_CENTS = 70; // 70 cents/mile (2025 IRS standard rate)

export function flagWriteOffs(expenses: ExpenseInput[]): WriteOff[] {
  return expenses.map((e) => {
    switch (e.category) {
      case "wages":
        return {
          label: e.label,
          amountCents: e.amountCents,
          deductibleCents: e.amountCents,
          category: e.category,
          reason:
            "Wages paid to an employee for work on a paying job are an ordinary business expense — fully deductible.",
          keepForRecords: "Payroll record / timesheet for the job.",
        };
      case "parts":
        return {
          label: e.label,
          amountCents: e.amountCents,
          deductibleCents: e.amountCents,
          category: e.category,
          reason:
            "Parts and materials installed on a customer's job are a cost of doing the work — fully deductible.",
          keepForRecords: "Supplier invoice or store receipt for the parts.",
        };
      case "mileage": {
        const deductible =
          e.miles !== undefined
            ? Math.round(e.miles * MILEAGE_RATE_CENTS)
            : e.amountCents;
        return {
          label: e.label,
          amountCents: e.amountCents,
          deductibleCents: deductible,
          category: e.category,
          reason: `Business miles driven to a job site are deductible at the IRS standard mileage rate (${MILEAGE_RATE_CENTS}¢/mile in this demo — check the current year's rate). ${e.miles ?? "?"} miles logged.`,
          keepForRecords: "Mileage log: date, destination, miles, job.",
        };
      }
      case "meals":
        return {
          label: e.label,
          amountCents: e.amountCents,
          deductibleCents: Math.round(e.amountCents / 2),
          category: e.category,
          reason:
            "Business meals are generally only 50% deductible — the agent flags half and explains why.",
          keepForRecords: "Receipt + who was there and what business was discussed.",
        };
      case "tools":
        return {
          label: e.label,
          amountCents: e.amountCents,
          deductibleCents: e.amountCents,
          category: e.category,
          reason:
            "Tools bought for the business are deductible. (Pricey equipment may need to be depreciated over years instead — ask your accountant.)",
          keepForRecords: "Purchase receipt.",
        };
      case "other":
      default:
        return {
          label: e.label,
          amountCents: e.amountCents,
          deductibleCents: 0,
          category: e.category,
          reason:
            "No automatic rule covers this one — the agent leaves it unflagged instead of guessing. Ask your accountant.",
          keepForRecords: "Receipt + a note about what it was for.",
        };
    }
  });
}

export function totalDeductible(writeOffs: WriteOff[]): number {
  return writeOffs.reduce((sum, w) => sum + w.deductibleCents, 0);
}
