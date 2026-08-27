export type HousingKind = "independent" | "nursing" | "ccrc" | null;

export type LifePhase = "working" | "go-go" | "slow-go" | "no-go";

export type OutlookStatus = "strong" | "watchful" | "at-risk" | "shortfall";

export type CalculatorInput = {
  currentAge: number;
  retirementAge: number;
  planToAge: number;
  currentSavings: number;
  annualContribution: number;
  preRetirementReturn: number;
  postRetirementReturn: number;
  inflationRate: number;
  healthcareInflationRate: number;
  lifestyleSpendToday: number;
  healthcareSpendToday: number;
  socialSecurityAnnual: number;
  socialSecurityStartAge: number;
  pensionAnnual: number;
  pensionStartAge: number;
  partTimeAnnualIncome: number;
  partTimeStartAge: number;
  partTimeEndAge: number;
  goGoEndAge: number;
  slowGoEndAge: number;
  goGoLifestyleMultiplier: number;
  slowGoLifestyleMultiplier: number;
  noGoLifestyleMultiplier: number;
  longTermCareAnnual: number;
  longTermCareStartAge: number;
  seniorHomeRentAnnual: number;
  seniorHomeStartAge: number;
  nursingHomeRentAnnual: number;
  nursingHomeStartAge: number;
  ccrcRentAnnual: number;
  ccrcStartAge: number;
};

export type YearRow = {
  age: number;
  phase: LifePhase;
  startBalance: number;
  growth: number;
  contribution: number;
  guaranteedIncome: number;
  partTimeIncome: number;
  lifestyleSpend: number;
  healthcareSpend: number;
  longTermCareSpend: number;
  housingSpend: number;
  housingKind: HousingKind;
  totalSpend: number;
  netCashFlow: number;
  endBalance: number;
  depleted: boolean;
};

export type Outlook = {
  status: OutlookStatus;
  title: string;
  summary: string;
  fundedThroughAge: number;
  depleted: boolean;
  depletionAge: number | null;
  endingBalance: number;
  yearsInRetirement: number;
  yearsCovered: number;
  totalHealthcareSpend: number;
  totalLifestyleSpend: number;
  totalLongTermCareSpend: number;
  totalHousingSpend: number;
  healthcareShare: number;
  peakHealthcareAge: number | null;
  peakHealthcareSpend: number;
  partTimeTotal: number;
  straightLineFundedThroughAge: number;
  straightLineEndingBalance: number;
  longevityGapYears: number;
  lastYearSpend: number;
};

export type ComfortEstimate = {
  suggestedLifestyleToday: number;
  suggestedHealthcareToday: number;
  suggestedAnnualBudgetToday: number;
  usedHousingPlaceholder: boolean;
  placeholderHousingAnnual: number;
  placeholderHousingStartAge: number;
  nestEggNeededNow: number;
  additionalNestEgg: number;
  additionalAnnualSavings: number;
  yearsToRetirement: number;
  fundedThroughIfFunded: number;
};

export type ProjectionResult = {
  input: CalculatorInput;
  years: YearRow[];
  outlook: Outlook;
  warnings: string[];
  comfort: ComfortEstimate;
};

export type CalculatorPayload = Partial<CalculatorInput>;
