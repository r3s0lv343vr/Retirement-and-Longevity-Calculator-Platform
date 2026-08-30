export type HousingKind = "independent" | "nursing" | "ccrc" | null;

export type LifePhase = "working" | "go-go" | "slow-go" | "no-go";

export type OutlookStatus = "strong" | "watchful" | "at-risk" | "shortfall";

export type CalculatorInput = {
  currentAge: number;
  retirementAge: number;
  planToAge: number;
  /** Off keeps the one-person path. On adds a partner, survivor income, and a second plan-through age. */
  twoPerson: boolean;
  partnerCurrentAge: number;
  partnerPlanToAge: number;
  partnerSocialSecurityAnnual: number;
  partnerSocialSecurityStartAge: number;
  partnerPensionAnnual: number;
  partnerPensionStartAge: number;
  partnerPensionCola: boolean;
  /** Share of the first person’s pension that continues after they die. 0 = the pension ends. */
  pensionSurvivorPercent: number;
  /** Share of the partner’s pension that continues after they die. */
  partnerPensionSurvivorPercent: number;
  partnerPartTimeAnnualIncome: number;
  partnerPartTimeStartAge: number;
  partnerPartTimeEndAge: number;
  partnerHealthcareSpendToday: number;
  partnerLongTermCareAnnual: number;
  partnerLongTermCareStartAge: number;
  partnerNursingHomeRentAnnual: number;
  partnerNursingHomeStartAge: number;
  /** Scales household lifestyle after the first death. */
  survivorLifestyleFactor: number;
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
  partnerAge: number | null;
  primaryAlive: boolean;
  partnerAlive: boolean;
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
  householdHorizonAge: number;
  firstDeathPrimaryAge: number | null;
  partnerFundedThroughAge: number | null;
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
