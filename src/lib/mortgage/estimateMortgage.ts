import { inflate } from "@/lib/engine";
import { MORTGAGE_DEFAULT, type MortgageInput, type MortgagePayload } from "./defaults";

export type { MortgageInput, MortgagePayload };

const MAX_MONEY = 50_000_000;
const MAX_YEARS = 40;
const MAX_RATE = 0.25;
const PMI_LTV = 0.8;

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

export type MortgageSnapshot = {
  year: number;
  housing: number;
  insurance: number;
  leftover: number;
  pile: number;
  pmi: number;
};

export type MortgagePath = {
  loanAmount: number;
  monthlyPI: number;
  firstHousingMonthly: number;
  housingRatio: number;
  obligationRatio: number;
  totalInterest: number;
  payoffYear: number;
  pmiDropYear: number | null;
  firstDrawYear: number | null;
  pileDepletedYear: number | null;
  endingPile: number;
  endingBalance: number;
  snapshots: MortgageSnapshot[];
  years: MortgageYearRow[];
};

export type MortgageEstimate = {
  input: MortgageInput;
  status: MortgageStatus;
  primary: MortgagePath;
  compare: MortgagePath | null;
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
  const money = [
    input.extraMonthly,
    input.propertyTaxAnnual,
    input.homeInsuranceAnnual,
    input.hoaMonthly,
    input.pmiMonthly,
    input.maintenanceAnnual,
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

function runPath(input: MortgageInput, loan: LoanSpec): MortgagePath {
  const principal0 = loanAmountFor(loan.homePrice, loan.downPayment);
  const monthlyPI = monthlyPrincipalAndInterest(principal0, loan.annualRate, loan.termYears);
  const monthlyRate = loan.annualRate / 12;
  const months = Math.round(loan.termYears * 12);
  let balance = principal0;
  let pile = input.investmentPile;
  let totalInterest = 0;
  let firstDrawYear: number | null = null;
  let pileDepletedYear: number | null = null;
  let pmiDropYear: number | null = null;
  let payoffYear = loan.termYears;
  const years: MortgageYearRow[] = [];
  const snapshots: MortgageSnapshot[] = [];

  for (let year = 1; year <= loan.termYears; year += 1) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    let yearExtra = 0;
    let yearPmi = 0;
    for (let m = 0; m < 12 && balance > 0.5; m += 1) {
      const interest = balance * monthlyRate;
      let principalPay = monthlyPI - interest;
      if (principalPay < 0) principalPay = 0;
      let extra = input.extraMonthly;
      if (principalPay + extra > balance) {
        extra = Math.max(0, balance - principalPay);
        principalPay = Math.min(principalPay, balance);
      }
      const pmiOn = loan.homePrice > 0 && balance / loan.homePrice > PMI_LTV;
      if (pmiOn && input.pmiMonthly > 0) yearPmi += input.pmiMonthly;
      if (!pmiOn && pmiDropYear === null && input.pmiMonthly > 0 && principal0 / loan.homePrice > PMI_LTV) {
        pmiDropYear = year;
      }
      balance = Math.max(0, balance - principalPay - extra);
      yearPrincipal += principalPay;
      yearInterest += interest;
      yearExtra += extra;
      totalInterest += interest;
    }
    if (balance <= 0.5 && payoffYear === loan.termYears) payoffYear = year;

    const tax = inflate(input.propertyTaxAnnual, input.inflationRate, year - 1);
    const insurance = inflate(input.homeInsuranceAnnual, input.inflationRate, year - 1);
    const hoa = inflate(input.hoaMonthly * 12, input.inflationRate, year - 1);
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
    if (year === months / 12 && balance <= 0.5) break;
  }

  const first = years[0];
  const firstHousingMonthly = first ? first.housing / 12 : 0;
  const housingRatio = input.annualIncome > 0 && first ? first.housing / first.income : 0;
  const obligationRatio =
    input.annualIncome > 0 && first ? (first.housing + first.loans) / first.income : 0;

  return {
    loanAmount: principal0,
    monthlyPI,
    firstHousingMonthly,
    housingRatio,
    obligationRatio,
    totalInterest,
    payoffYear,
    pmiDropYear,
    firstDrawYear,
    pileDepletedYear,
    endingPile: years[years.length - 1]?.endingPile ?? input.investmentPile,
    endingBalance: years[years.length - 1]?.endingBalance ?? principal0,
    snapshots,
    years,
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

export function estimateMortgage(input: MortgageInput): MortgageEstimate {
  const primary = runPath(input, loanFromPrimary(input));
  const compare = compareIsActive(input) ? runPath(input, loanFromCompare(input)) : null;
  return {
    input,
    status: statusFor(primary),
    primary,
    compare,
    warnings: warningsForMortgage(input),
  };
}
