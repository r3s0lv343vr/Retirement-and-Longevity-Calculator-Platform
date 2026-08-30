export type HousingKind = "independent" | "nursing" | "ccrc" | null;

export type LifePhase = "working" | "go-go" | "slow-go" | "no-go";

export type OutlookStatus = "strong" | "watchful" | "at-risk" | "shortfall";

export type CalculatorInput = {
  currentAge: number;
  retirementAge: number;
  planToAge: number;
  currentSavings: number;
  annualContribution: number;
  /** When true, the yearly savings deposit rises with general inflation. Off keeps a level ordinary annuity. */
  savingsGrowWithInflation: boolean;
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
  /** When true, pension rises with general inflation. Turn off if this pension has no COLA. */
  pensionCola: boolean;
  partTimeAnnualIncome: number;
  partTimeStartAge: number;
  partTimeEndAge: number;
  partTimeAnnualInvestment: number;
  partTimeInvestmentReturn: number;
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
  totalMedicalSpend: number;
  totalRetirementSpend: number;
  healthcareShare: number;
  peakHealthcareAge: number | null;
  peakHealthcareSpend: number;
  nestEggYears: number;
  nestEggLump: number;
  nestEggAnnuity: number;
  nestEggAtRetirement: number;
  socialSecurityTotal: number;
  pensionTotal: number;
  partTimeWages: number;
  partTimeInvested: number;
  partTimeTotal: number;
  retirementIncomeTotal: number;
  fundingTotal: number;
  straightLineFundedThroughAge: number;
  straightLineEndingBalance: number;
  longevityGapYears: number;
  lastYearSpend: number;
  requiredMonths: number;
  coveredMonths: number;
  surplusMonths: number;
  accumulatedMonths: number;
  surpassesRequiredMonths: boolean;
  remainingSavings: number;
  remainingExpenseNeed: number;
  badDecadeFundedThroughAge: number;
  badDecadeEndingBalance: number;
  badDecadeGapYears: number;
  badDecadeReturn: number;
  claiming67Annual: number;
  claiming70Annual: number;
  claiming67FundedThroughAge: number;
  claiming70FundedThroughAge: number;
};

export type PlanSnapshot = {
  fundedThroughAge: number;
  yearsCovered: number;
  yearsInRetirement: number;
  depleted: boolean;
  endingBalance: number;
  remainingSavings: number;
  remainingExpenseNeed: number;
  requiredMonths: number;
  accumulatedMonths: number;
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
  /** Current nest egg and income, with only lifestyle and healthcare set to the suggested budget. */
  spendIfAdopted: PlanSnapshot;
};

export type ProjectionResult = {
  input: CalculatorInput;
  years: YearRow[];
  outlook: Outlook;
  warnings: string[];
  comfort: ComfortEstimate;
};

export type CalculatorPayload = Partial<CalculatorInput>;
