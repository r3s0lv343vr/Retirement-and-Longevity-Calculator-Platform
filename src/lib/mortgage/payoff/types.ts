import type { YearMonth } from "./dates";

export type PayoffEntryMode = "payment" | "term";

export type PaymentEventType =
  | "monthly"
  | "annual"
  | "lumpSum"
  | "temporary"
  | "pause"
  | "paycheck"
  | "escalating";

export type PaycheckCadence = "weekly" | "biweekly" | "semimonthly";

export type PaymentEvent = {
  id: string;
  type: PaymentEventType;
  amount: number;
  start: YearMonth;
  end?: YearMonth;
  /** Calendar month (1–12) for annual extras. Default December. */
  calendarMonth?: number;
  /** Annual growth of an escalating extra, e.g. 0.03. */
  annualIncrease?: number;
  cadence?: PaycheckCadence;
};

export type LenderRules = {
  /** 0 means no stated annual lump-sum cap. */
  annualLumpLimit: number;
  /** 0 means no stated cap on recurring extra. */
  maxMonthlyExtra: number;
};

export type PayoffMortgageInput = {
  balance: number;
  annualRate: number;
  entryMode: PayoffEntryMode;
  currentPayment: number;
  remainingYears: number;
  remainingMonths: number;
  start: YearMonth;
  extraMonthly: number;
  freedom: YearMonth;
  timingAnnual: number;
  lender: LenderRules;
};

export type ResolvedMortgage = {
  balance: number;
  annualRate: number;
  periodicRate: number;
  scheduledPayment: number;
  remainingPeriods: number;
  start: YearMonth;
  naturalPayoff: YearMonth;
};

export type MonthRow = {
  period: number;
  date: YearMonth;
  interest: number;
  scheduledPrincipal: number;
  extra: number;
  principal: number;
  payment: number;
  endingBalance: number;
};

export type YearRow = {
  calendarYear: number;
  interest: number;
  scheduledPrincipal: number;
  extra: number;
  principal: number;
  endingBalance: number;
};

export type Milestone = {
  id: string;
  label: string;
  date: YearMonth;
  period: number;
  balance: number;
};

export type SimulationResult = {
  id: string;
  name: string;
  payoffDate: YearMonth | null;
  periods: number;
  interestPaid: number;
  extraPaid: number;
  scheduledPaid: number;
  neverPaysOff: boolean;
  months: MonthRow[];
  years: YearRow[];
  milestones: Milestone[];
};

export type Scenario = {
  id: string;
  name: string;
  events: PaymentEvent[];
};

export type ComparisonRow = {
  id: string;
  name: string;
  payoffDate: YearMonth | null;
  periods: number;
  periodsSaved: number;
  interestPaid: number;
  interestAvoided: number;
  extraPaid: number;
  recurringMonthly: number;
  neverPaysOff: boolean;
  ruleFlags: string[];
};

export type FreedomSolve = {
  target: YearMonth;
  targetPeriods: number;
  possible: boolean;
  alreadyThere: boolean;
  extraMonthly: number;
  totalPayment: number;
  reason: string | null;
};

export type FeasiblePath = {
  extraMonthly: number;
  payoffDate: YearMonth | null;
  periodsSaved: number;
  interestAvoided: number;
  isRequired: boolean;
};

export type TimingRow = {
  id: string;
  name: string;
  note: string;
  result: SimulationResult;
  interestAvoided: number;
  periodsSaved: number;
};

export type TemporaryRow = {
  years: number;
  result: SimulationResult;
  interestAvoided: number;
  periodsSaved: number;
};

export type LenderFlag = {
  scenarioId: string;
  message: string;
};
