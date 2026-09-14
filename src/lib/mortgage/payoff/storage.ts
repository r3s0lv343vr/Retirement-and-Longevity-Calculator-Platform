import { defaultStrategies, mergePayoffInput } from "./defaults";
import type { PayoffMortgageInput, Scenario } from "./types";

export const PAYOFF_STORAGE_KEY = "rf-mortgage-payoff-v1";
export const PAYOFF_STORAGE_VERSION = 1;

export type StoredPayoffPlan = {
  version: number;
  savedAt: string;
  input: PayoffMortgageInput;
  strategies: Scenario[];
  selectedId: string;
};

export function parseStoredPayoffPlan(raw: unknown): StoredPayoffPlan | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<StoredPayoffPlan>;
  if (value.version !== PAYOFF_STORAGE_VERSION) return null;
  if (!value.input || typeof value.input !== "object") return null;
  const strategies = Array.isArray(value.strategies) ? (value.strategies as Scenario[]) : defaultStrategies();
  return {
    version: PAYOFF_STORAGE_VERSION,
    savedAt: typeof value.savedAt === "string" ? value.savedAt : new Date().toISOString(),
    input: mergePayoffInput(value.input),
    strategies: strategies.slice(0, 4).map((scenario, index) => ({
      id: typeof scenario.id === "string" ? scenario.id : `plan-${index}`,
      name: typeof scenario.name === "string" ? scenario.name : `Plan ${index + 1}`,
      events: Array.isArray(scenario.events) ? scenario.events : [],
    })),
    selectedId: typeof value.selectedId === "string" ? value.selectedId : strategies[0]?.id ?? "plan-a",
  };
}

export function readPayoffPlan(): StoredPayoffPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PAYOFF_STORAGE_KEY);
    if (!raw) return null;
    return parseStoredPayoffPlan(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writePayoffPlan(input: PayoffMortgageInput, strategies: Scenario[], selectedId: string): void {
  if (typeof window === "undefined") return;
  const payload: StoredPayoffPlan = {
    version: PAYOFF_STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    input,
    strategies,
    selectedId,
  };
  window.localStorage.setItem(PAYOFF_STORAGE_KEY, JSON.stringify(payload));
}

export function deletePayoffPlan(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PAYOFF_STORAGE_KEY);
}

export function exportPayoffPlan(input: PayoffMortgageInput, strategies: Scenario[], selectedId: string): string {
  return JSON.stringify(
    {
      version: PAYOFF_STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      input,
      strategies,
      selectedId,
    } satisfies StoredPayoffPlan,
    null,
    2,
  );
}
