import { extraFromEvent } from "./events";
import { money } from "./money";
import type { LenderFlag, LenderRules, PaymentEvent, ResolvedMortgage, Scenario } from "./types";

export function flagsForEvents(
  scenarioId: string,
  events: PaymentEvent[],
  rules: LenderRules,
  mortgage: ResolvedMortgage,
): LenderFlag[] {
  const flags: LenderFlag[] = [];
  if (rules.maxMonthlyExtra > 0) {
    for (const event of events) {
      if (
        (event.type === "monthly" || event.type === "temporary" || event.type === "escalating") &&
        event.amount > rules.maxMonthlyExtra
      ) {
        flags.push({
          scenarioId,
          message: `${event.type} extra of ${event.amount.toFixed(2)} is above the stated monthly extra cap.`,
        });
      }
    }
  }

  if (rules.annualLumpLimit > 0) {
    const byYear = new Map<number, number>();
    const lastYear = mortgage.start.year + 50;
    for (let year = mortgage.start.year; year <= lastYear; year += 1) {
      for (const event of events) {
        if (event.type !== "annual" && event.type !== "lumpSum") continue;
        for (let month = 1; month <= 12; month += 1) {
          const amount = extraFromEvent(event, { year, month });
          if (amount <= 0) continue;
          byYear.set(year, money((byYear.get(year) ?? 0) + amount));
        }
      }
    }
    for (const [year, total] of byYear) {
      if (total > rules.annualLumpLimit) {
        flags.push({
          scenarioId,
          message: `Lump and annual extras in ${year} total more than the stated annual lump-sum limit.`,
        });
      }
    }
  }

  return flags;
}

export function flagsForScenario(
  scenario: Scenario,
  rules: LenderRules,
  mortgage: ResolvedMortgage,
): LenderFlag[] {
  return flagsForEvents(scenario.id, scenario.events, rules, mortgage);
}
