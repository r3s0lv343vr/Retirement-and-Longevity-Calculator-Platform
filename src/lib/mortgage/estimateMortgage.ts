import { inflate } from "@/lib/engine";
import { MORTGAGE_DEFAULT, type MortgageInput, type MortgagePayload } from "./defaults";

export type { MortgageInput, MortgagePayload };

const MAX_MONEY = 50_000_000;
const MAX_YEARS = 40;
const MAX_RATE = 0.25;
const PMI_LTV = 0.8;
const RATE_DELTAS = [-0.005, 0, 0.005];
const DOWN_PERCENTS = [0.05, 0.1, 0.15, 0.2, 0.25];

export type MortgageStatus = "comfortable" | "buffered" | "tight" | "short" | "depleted";

export type MortgageYearRow = {
  year: number;
  principal: number;
  interest: number;
  extra: number;
  pmi: number;
  tax: number;
  insurance: number;
  hoa: number;
  maintenance: number;
  housing: number;
  life: number;
  loans: number;
  income: number;
  leftover: number;
  drawnFromPile: number;
  endingBalance: number;
  endingPile: number;
  ltv: number;
};

export type MortgageMonthRow = {
  month: number;
  year: number;
  principal: number;
  interest: number;
  extra: number;
  pmi: number;
  endingBalance: number;
};

export type MortgageSnapshot = {
  year: number;
  housing: number;
  insurance: number;
  leftover: number;
  pile: number;
  pmi: number;
};

export type MortgageFirstFive = {
  payments: number;
  principal: number;
  interest: number;
  housing: number;
  remaining: number;
};

export type RateScenario = {
  rate: number;
  monthlyPI: number;
  totalInterest: number;
};

export type DownPaymentScenario = {
  percent: number;
  cash: number;
  loan: number;
  monthlyPI: number;
  pmiMonthly: number;
  housingMonthly: number;
  totalInterest: number;
};

export type MortgagePath = {
  loanAmount: number;
  monthlyPI: number;
  firstHousingMonthly: number;
  housingRatio: number;
  obligationRatio: number;
  totalInterest: number;
  totalHousingOutflow: number;
  totalFinancing: number;
  totalOwnership: number;
  firstPaymentPrincipal: number;
  firstPaymentInterest: number;
  crossoverYear: number | null;
  monthsToPayoff: number;
  payoffYear: number;
  pmiDropYear: number | null;
  firstDrawYear: number | null;
  pileDepletedYear: number | null;
  endingPile: number;
  endingBalance: number;
  firstFive: MortgageFirstFive;
  snapshots: MortgageSnapshot[];
  years: MortgageYearRow[];
  months: MortgageMonthRow[];
};

export type MortgageEstimate = {
  input: MortgageInput;
  status: MortgageStatus;
  primary: MortgagePath;
  compare: MortgagePath | null;
  cashToBuy: number;
  monthsGained: number;
  interestSaved: number;
  rateSensitivity: RateScenario[];
  downPaymentScenarios: DownPaymentScenario[];
  warnings: string[];
};

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

export function mergeMortgageInput(payload: MortgagePayload | null | undefined): MortgageInput {
  const src = payload ?? {};
  const next = { ...MORTGAGE_DEFAULT };
  for (const key of Object.keys(MORTGAGE_DEFAULT) as (keyof MortgageInput)[]) {
    next[key] = asNumber(src[key], MORTGAGE_DEFAULT[key]);
  }
  return next;
}

export function loanAmountFor(price: number, down: number): number {
  return Math.max(0, price - down);
}

export function monthlyPrincipalAndInterest(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || termYears <= 0) return 0;
  const n = Math.round(termYears * 12);
  const r = annualRate / 12;
  if (Math.abs(r) < 1e-12) return principal / n;
  const pow = (1 + r) ** n;
  return (principal * r * pow) / (pow - 1);
}

export function downPaymentPercent(price: number, down: number): number {
  if (price <= 0) return 0;
  return Math.min(1, Math.max(0, down / price));
}

export function cashToBuyFor(input: MortgageInput): number {
  return input.downPayment + input.closingCost + input.movingCost + input.furnishingCost;
}

export function scheduledInterest(principal: number, annualRate: number, termYears: number): number {
  const pi = monthlyPrincipalAndInterest(principal, annualRate, termYears);
  return Math.max(0, pi * Math.round(termYears * 12) - principal);
}

function clampRate(rate: number): number {
  return Math.min(MAX_RATE, Math.max(0, rate));
}

export function validateMortgageInput(input: MortgageInput): string[] {
  const errors: string[] = [];
  if (input.homePrice <= 0 || input.homePrice > MAX_MONEY) errors.push("Home price must be between $1 and $50,000,000.");
  if (input.downPayment < 0 || input.downPayment > MAX_MONEY) errors.push("Down payment must be between $0 and $50,000,000.");
  if (input.downPayment > input.homePrice) errors.push("Down payment cannot exceed the home price.");
  if (input.termYears < 1 || input.termYears > MAX_YEARS) errors.push("Loan term must be between 1 and 40 years.");
  if (input.annualRate < 0 || input.annualRate > MAX_RATE) errors.push("Interest rate must be between 0% and 25%.");
  if (input.inflationRate < 0 || input.inflationRate > MAX_RATE) errors.push("Inflation must be between 0% and 25%.");
  if (input.investmentReturn < 0 || input.investmentReturn > MAX_RATE) {
    errors.push("Investment return must be between 0% and 25%.");
  }
  for (const [label, rate] of [
    ["Tax growth", input.taxGrowthRate],
    ["Insurance growth", input.insuranceGrowthRate],
    ["HOA growth", input.hoaGrowthRate],
  ] as const) {
    if (rate < 0 || rate > MAX_RATE) errors.push(`${label} must be between 0% and 25%.`);
  }
  const money = [
    input.extraMonthly,
    input.extraAnnual,
    input.extraOneTime,
    input.propertyTaxAnnual,
    input.homeInsuranceAnnual,
    input.hoaMonthly,
    input.pmiMonthly,
    input.maintenanceAnnual,
    input.closingCost,
    input.movingCost,
    input.furnishingCost,
    input.annualIncome,
    input.foodMonthly,
    input.schoolMonthly,
    input.travelMonthly,
    input.extracurricularMonthly,
    input.carLoanMonthly,
    input.otherLoanMonthly,
    input.dependentsMonthly,
    input.healthMonthly,
    input.investmentPile,
    input.compareHomePrice,
    input.compareDownPayment,
  ];
  if (money.some((n) => n < 0 || n > MAX_MONEY)) errors.push("Dollar amounts must be between $0 and $50,000,000.");
  if (input.carLoanYears < 0 || input.carLoanYears > MAX_YEARS) errors.push("Car-loan years must be between 0 and 40.");
  if (input.otherLoanYears < 0 || input.otherLoanYears > MAX_YEARS) {
    errors.push("Other-loan years must be between 0 and 40.");
  }
  if (input.compareTermYears < 0 || input.compareTermYears > MAX_YEARS) {
    errors.push("Compare term must be between 0 and 40 years.");
  }
  if (input.compareAnnualRate < 0 || input.compareAnnualRate > MAX_RATE) {
    errors.push("Compare rate must be between 0% and 25%.");
  }
  if (input.extraOneTimeMonth < 1 || input.extraOneTimeMonth > MAX_YEARS * 12) {
    errors.push("One-time extra month must be between 1 and 480.");
  }
  if (input.compareHomePrice > 0 && input.compareDownPayment > input.compareHomePrice) {
    errors.push("Compare down payment cannot exceed that home price.");
  }
  return errors;
}

export function warningsForMortgage(input: MortgageInput): string[] {
  const warnings: string[] = [];
  const loan = loanAmountFor(input.homePrice, input.downPayment);
  const ltv = input.homePrice > 0 ? loan / input.homePrice : 0;
  if (ltv > PMI_LTV && input.pmiMonthly <= 0) {
    warnings.push("Down payment is under 20% and PMI is $0. Lenders usually charge PMI until you reach 80% loan-to-value.");
  }
  if (input.annualIncome <= 0) warnings.push("Yearly income is $0, so leftover cash will stay negative unless the pile covers it.");
  if (input.propertyTaxAnnual <= 0) warnings.push("Property tax is $0. Most first-home budgets miss this and look too cheap.");
  if (input.homeInsuranceAnnual <= 0) warnings.push("Home insurance is $0.");
  return warnings;
}

export function compareIsActive(input: MortgageInput): boolean {
  if (input.compareTermYears < 1) return false;
  const price = input.compareHomePrice > 0 ? input.compareHomePrice : input.homePrice;
  const down = input.compareHomePrice > 0 ? input.compareDownPayment : input.downPayment;
  return (
    price !== input.homePrice ||
    down !== input.downPayment ||
    input.compareAnnualRate !== input.annualRate ||
    input.compareTermYears !== input.termYears
  );
}

type LoanSpec = {
  homePrice: number;
  downPayment: number;
  annualRate: number;
  termYears: number;
};

function extraForMonth(input: MortgageInput, monthNumber: number): number {
  let extra = input.extraMonthly;
  if (monthNumber % 12 === 0) extra += input.extraAnnual;
  if (monthNumber === input.extraOneTimeMonth) extra += input.extraOneTime;
  return extra;
}

function hasExtra(input: MortgageInput): boolean {
  return input.extraMonthly > 0 || input.extraAnnual > 0 || input.extraOneTime > 0;
}

function lifeAnnual(input: MortgageInput, yearIndex: number): number {
  const t = yearIndex;
  return (
    inflate(input.foodMonthly * 12, input.inflationRate, t) +
    inflate(input.schoolMonthly * 12, input.inflationRate, t) +
    inflate(input.travelMonthly * 12, input.inflationRate, t) +
    inflate(input.extracurricularMonthly * 12, input.inflationRate, t) +
    inflate(input.dependentsMonthly * 12, input.inflationRate, t) +
    inflate(input.healthMonthly * 12, input.inflationRate, t)
  );
}

function loanDrag(input: MortgageInput, year: number): number {
  const car = year <= input.carLoanYears ? input.carLoanMonthly * 12 : 0;
  const other = year <= input.otherLoanYears ? input.otherLoanMonthly * 12 : 0;
  return car + other;
}

function firstFiveFrom(years: MortgageYearRow[], remaining: number): MortgageFirstFive {
  const slice = years.filter((row) => row.year <= 5);
  return {
    payments: slice.reduce((sum, row) => sum + row.principal + row.interest + row.extra, 0),
    principal: slice.reduce((sum, row) => sum + row.principal + row.extra, 0),
    interest: slice.reduce((sum, row) => sum + row.interest, 0),
    housing: slice.reduce((sum, row) => sum + row.housing, 0),
    remaining: slice.at(-1)?.endingBalance ?? remaining,
  };
}

function runPath(input: MortgageInput, loan: LoanSpec, keepMonths: boolean): MortgagePath {
  const principal0 = loanAmountFor(loan.homePrice, loan.downPayment);
  const monthlyPI = monthlyPrincipalAndInterest(principal0, loan.annualRate, loan.termYears);
  const monthlyRate = loan.annualRate / 12;
  const monthsAllowed = Math.round(loan.termYears * 12);
  let balance = principal0;
  let pile = input.investmentPile;
  let totalInterest = 0;
  let firstDrawYear: number | null = null;
  let pileDepletedYear: number | null = null;
  let pmiDropYear: number | null = null;
  let payoffYear = loan.termYears;
  let monthsToPayoff = monthsAllowed;
  let firstPaymentPrincipal = 0;
  let firstPaymentInterest = 0;
  let crossoverYear: number | null = null;
  let monthNumber = 0;
  const years: MortgageYearRow[] = [];
  const months: MortgageMonthRow[] = [];
  const snapshots: MortgageSnapshot[] = [];

  for (let year = 1; year <= loan.termYears; year += 1) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    let yearExtra = 0;
    let yearPmi = 0;
    for (let m = 0; m < 12 && balance > 0.5; m += 1) {
      monthNumber += 1;
      const interest = balance * monthlyRate;
      let principalPay = monthlyPI - interest;
      if (principalPay < 0) principalPay = 0;
      let extra = extraForMonth(input, monthNumber);
      if (principalPay + extra > balance) {
        extra = Math.max(0, balance - principalPay);
        principalPay = Math.min(principalPay, balance);
      }
      const pmiOn = loan.homePrice > 0 && balance / loan.homePrice > PMI_LTV;
      const pmi = pmiOn && input.pmiMonthly > 0 ? input.pmiMonthly : 0;
      if (pmi > 0) yearPmi += pmi;
      if (!pmiOn && pmiDropYear === null && input.pmiMonthly > 0 && principal0 / loan.homePrice > PMI_LTV) {
        pmiDropYear = year;
      }
      balance = Math.max(0, balance - principalPay - extra);
      yearPrincipal += principalPay;
      yearInterest += interest;
      yearExtra += extra;
      totalInterest += interest;
      if (monthNumber === 1) {
        firstPaymentPrincipal = principalPay;
        firstPaymentInterest = interest;
      }
      if (keepMonths) {
        months.push({
          month: monthNumber,
          year,
          principal: principalPay,
          interest,
          extra,
          pmi,
          endingBalance: balance,
        });
      }
      if (balance <= 0.5) {
        monthsToPayoff = monthNumber;
        if (payoffYear === loan.termYears) payoffYear = year;
      }
    }
    if (balance <= 0.5 && payoffYear === loan.termYears) payoffYear = year;
    if (crossoverYear === null && yearPrincipal > yearInterest && yearPrincipal > 0) crossoverYear = year;

    const tax = inflate(input.propertyTaxAnnual, input.taxGrowthRate, year - 1);
    const insurance = inflate(input.homeInsuranceAnnual, input.insuranceGrowthRate, year - 1);
    const hoa = inflate(input.hoaMonthly * 12, input.hoaGrowthRate, year - 1);
    const maintenance = inflate(input.maintenanceAnnual, input.inflationRate, year - 1);
    const housing = yearPrincipal + yearInterest + yearExtra + yearPmi + tax + insurance + hoa + maintenance;
    const life = lifeAnnual(input, year - 1);
    const loans = loanDrag(input, year);
    const income = inflate(input.annualIncome, input.inflationRate, year - 1);
    const leftover = income - housing - life - loans;
    let drawn = 0;
    if (leftover >= 0) {
      pile += leftover;
    } else {
      drawn = Math.min(pile, -leftover);
      pile -= drawn;
      if (firstDrawYear === null) firstDrawYear = year;
      if (pile <= 0.5 && pileDepletedYear === null && -leftover > drawn + 0.5) pileDepletedYear = year;
    }
    pile *= 1 + input.investmentReturn;
    if (pile < 0.5) pile = 0;

    const ltv = loan.homePrice > 0 ? balance / loan.homePrice : 0;
    const row: MortgageYearRow = {
      year,
      principal: yearPrincipal,
      interest: yearInterest,
      extra: yearExtra,
      pmi: yearPmi,
      tax,
      insurance,
      hoa,
      maintenance,
      housing,
      life,
      loans,
      income,
      leftover,
      drawnFromPile: drawn,
      endingBalance: balance,
      endingPile: pile,
      ltv,
    };
    years.push(row);
    if (year === 1 || year === 5 || year === 10 || year === loan.termYears) {
      snapshots.push({
        year,
        housing,
        insurance,
        leftover,
        pile,
        pmi: yearPmi,
      });
    }
    if (balance <= 0.5) break;
  }

  const first = years[0];
  const firstHousingMonthly = first ? first.housing / 12 : 0;
  const housingRatio = input.annualIncome > 0 && first ? first.housing / first.income : 0;
  const obligationRatio =
    input.annualIncome > 0 && first ? (first.housing + first.loans) / first.income : 0;
  const totalHousingOutflow = years.reduce((sum, row) => sum + row.housing, 0);
  const totalFinancing = years.reduce((sum, row) => sum + row.principal + row.interest + row.extra, 0);
  const totalOwnership = years.reduce((sum, row) => sum + row.tax + row.insurance + row.hoa + row.maintenance + row.pmi, 0);

  return {
    loanAmount: principal0,
    monthlyPI,
    firstHousingMonthly,
    housingRatio,
    obligationRatio,
    totalInterest,
    totalHousingOutflow,
    totalFinancing,
    totalOwnership,
    firstPaymentPrincipal,
    firstPaymentInterest,
    crossoverYear,
    monthsToPayoff,
    payoffYear,
    pmiDropYear,
    firstDrawYear,
    pileDepletedYear,
    endingPile: years[years.length - 1]?.endingPile ?? input.investmentPile,
    endingBalance: years[years.length - 1]?.endingBalance ?? principal0,
    firstFive: firstFiveFrom(years, years[years.length - 1]?.endingBalance ?? principal0),
    snapshots,
    years,
    months,
  };
}

function statusFor(path: MortgagePath): MortgageStatus {
  const y1 = path.years.find((row) => row.year === 1);
  const y5 = path.years.find((row) => row.year === 5);
  const y10 = path.years.find((row) => row.year === 10);
  const leftover1 = y1?.leftover ?? 0;
  const laterNegative = [y5, y10].some((row) => row && row.leftover < 0);
  if (path.pileDepletedYear !== null) return "depleted";
  if (leftover1 < 0 && path.firstDrawYear !== null && path.pileDepletedYear === null) return "buffered";
  if (leftover1 < 0) return "short";
  if (laterNegative || path.firstDrawYear !== null) return "tight";
  return "comfortable";
}

function loanFromPrimary(input: MortgageInput): LoanSpec {
  return {
    homePrice: input.homePrice,
    downPayment: input.downPayment,
    annualRate: input.annualRate,
    termYears: input.termYears,
  };
}

function loanFromCompare(input: MortgageInput): LoanSpec {
  const homePrice = input.compareHomePrice > 0 ? input.compareHomePrice : input.homePrice;
  const downPayment = input.compareHomePrice > 0 ? input.compareDownPayment : input.downPayment;
  return {
    homePrice,
    downPayment,
    annualRate: input.compareAnnualRate,
    termYears: input.compareTermYears,
  };
}

export function rateSensitivityFor(input: MortgageInput): RateScenario[] {
  const loan = loanAmountFor(input.homePrice, input.downPayment);
  return RATE_DELTAS.map((delta) => {
    const rate = clampRate(input.annualRate + delta);
    return {
      rate,
      monthlyPI: monthlyPrincipalAndInterest(loan, rate, input.termYears),
      totalInterest: scheduledInterest(loan, rate, input.termYears),
    };
  });
}

export function downPaymentScenariosFor(input: MortgageInput): DownPaymentScenario[] {
  return DOWN_PERCENTS.map((percent) => {
    const cash = input.homePrice * percent;
    const loan = loanAmountFor(input.homePrice, cash);
    const monthlyPI = monthlyPrincipalAndInterest(loan, input.annualRate, input.termYears);
    const pmiMonthly = input.homePrice > 0 && loan / input.homePrice > PMI_LTV ? input.pmiMonthly : 0;
    const housingMonthly =
      monthlyPI +
      input.propertyTaxAnnual / 12 +
      input.homeInsuranceAnnual / 12 +
      input.hoaMonthly +
      pmiMonthly +
      input.maintenanceAnnual / 12;
    return {
      percent,
      cash,
      loan,
      monthlyPI,
      pmiMonthly,
      housingMonthly,
      totalInterest: scheduledInterest(loan, input.annualRate, input.termYears),
    };
  });
}

export function estimateMortgage(input: MortgageInput): MortgageEstimate {
  const primary = runPath(input, loanFromPrimary(input), true);
  const compare = compareIsActive(input) ? runPath(input, loanFromCompare(input), false) : null;
  let monthsGained = 0;
  let interestSaved = 0;
  if (hasExtra(input)) {
    const baseline = runPath(
      { ...input, extraMonthly: 0, extraAnnual: 0, extraOneTime: 0 },
      loanFromPrimary(input),
      false,
    );
    monthsGained = Math.max(0, baseline.monthsToPayoff - primary.monthsToPayoff);
    interestSaved = Math.max(0, baseline.totalInterest - primary.totalInterest);
  }
  return {
    input,
    status: statusFor(primary),
    primary,
    compare,
    cashToBuy: cashToBuyFor(input),
    monthsGained,
    interestSaved,
    rateSensitivity: rateSensitivityFor(input),
    downPaymentScenarios: downPaymentScenariosFor(input),
    warnings: warningsForMortgage(input),
  };
}
