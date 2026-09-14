import { monthsBetween } from "./dates";
import type { PayoffMortgageInput, PaymentEvent, Scenario } from "./types";

const MAX_MONEY = 50_000_000;
const MAX_RATE = 0.25;

export function validatePayoffInput(input: PayoffMortgageInput): string[] {
  const errors: string[] = [];
  if (input.balance <= 0 || input.balance > MAX_MONEY) {
    errors.push("Remaining balance must be between $1 and $50,000,000.");
  }
  if (input.annualRate < 0 || input.annualRate > MAX_RATE) {
    errors.push("Interest rate must be between 0% and 25%.");
  }
  if (input.entryMode === "payment") {
    if (input.currentPayment <= 0 || input.currentPayment > MAX_MONEY) {
      errors.push("Current principal-and-interest payment must be greater than $0.");
    }
  } else {
    const periods = Math.round(input.remainingYears) * 12 + Math.round(input.remainingMonths);
    if (periods < 1 || periods > 600) {
      errors.push("Remaining term must be between 1 month and 50 years.");
    }
  }
  if (input.start.month < 1 || input.start.month > 12) {
    errors.push("First payment month must be between 1 and 12.");
  }
  if (input.extraMonthly < 0 || input.extraMonthly > MAX_MONEY) {
    errors.push("Extra monthly payment cannot be negative.");
  }
  if (input.timingAnnual < 0 || input.timingAnnual > MAX_MONEY) {
    errors.push("Timing-lab annual extra cannot be negative.");
  }
  if (input.lender.annualLumpLimit < 0 || input.lender.maxMonthlyExtra < 0) {
    errors.push("Lender caps cannot be negative. Use 0 for no stated cap.");
  }
  return errors;
}

export function validateEvents(events: PaymentEvent[]): string[] {
  const errors: string[] = [];
  for (const event of events) {
    if (event.type !== "pause" && event.amount < 0) {
      errors.push("Extra-payment amounts cannot be negative.");
    }
    if (event.end && monthsBetween(event.start, event.end) < 0) {
      errors.push("An event end date is before its start date.");
    }
  }
  return errors;
}

export function validateStrategies(strategies: Scenario[]): string[] {
  return strategies.flatMap((strategy) => validateEvents(strategy.events));
}
