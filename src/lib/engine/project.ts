import type { CalculatorInput, HousingKind, LifePhase, Outlook, ProjectionResult, YearRow } from "./types";
import { warningsFor } from "./validate";

export function inflate(amount: number, rate: number, years: number): number {
  return amount * (1 + rate) ** years;
}

/** FV = PV (1 + r)^n */
export function futureValueLump(presentValue: number, rate: number, years: number): number {
  if (years <= 0) return presentValue;
  return presentValue * (1 + rate) ** years;
}

/** Ordinary (end-of-year) annuity: FV = PMT [((1 + r)^n − 1) / r] */
export function futureValueOrdinaryAnnuity(payment: number, rate: number, years: number): number {
  if (years <= 0) return 0;
  if (Math.abs(rate) < 1e-12) return payment * years;
  return payment * (((1 + rate) ** years - 1) / rate);
}

/** Nest-egg phase: grow current savings, then add level annual deposits. */
export function nestEggAtRetirement(
  presentValue: number,
  annualSavings: number,
  rate: number,
  years: number,
): number {
  return futureValueLump(presentValue, rate, years) + futureValueOrdinaryAnnuity(annualSavings, rate, years);
}

/**
 * Ordinary annuity whose payment grows at `growth` each year.
 * First deposit is `payment`; deposit k is payment × (1+g)^(k-1).
 */
export function futureValueGrowingOrdinaryAnnuity(
  payment: number,
  rate: number,
  growth: number,
  years: number,
): number {
  if (years <= 0 || payment === 0) return 0;
  if (Math.abs(rate - growth) < 1e-12) return payment * years * (1 + rate) ** Math.max(years - 1, 0);
  return (payment * ((1 + rate) ** years - (1 + growth) ** years)) / (rate - growth);
}

export const SS_FRA_AGE = 67;
export const SS_MAX_CLAIM_AGE = 70;
export const BAD_DECADE_YEARS = 10;
export const BAD_DECADE_RETURN_CUT = 0.04;

/** US-style factor vs full retirement age 67. Age 70 is 124%. Entered annual is the benefit at the entered start age. */
export function socialSecurityClaimFactor(claimAge: number): number {
  const age = Math.min(SS_MAX_CLAIM_AGE, Math.max(62, Math.round(claimAge)));
  if (age >= SS_FRA_AGE) return 1 + 0.08 * (age - SS_FRA_AGE);
  const monthsEarly = (SS_FRA_AGE - age) * 12;
  const first36 = Math.min(monthsEarly, 36);
  let reduction = first36 * (5 / 9) / 100;
  if (monthsEarly > 36) reduction += (monthsEarly - 36) * (5 / 12) / 100;
  return 1 - reduction;
}

export function socialSecurityAnnualAtClaimAge(
  annualAtEnteredStart: number,
  enteredStartAge: number,
  claimAge: number,
): number {
  const from = socialSecurityClaimFactor(enteredStartAge);
  const to = socialSecurityClaimFactor(claimAge);
  if (from <= 0) return annualAtEnteredStart;
  return annualAtEnteredStart * (to / from);
}

export function badDecadeReturn(usual: number): number {
  return Math.max(0, usual - BAD_DECADE_RETURN_CUT);
}

/** Partner’s work-end, expressed as the first person’s age that year. */
export function partnerRetirementPrimaryAge(input: CalculatorInput): number {
  return input.currentAge + (input.partnerRetirementAge - input.partnerCurrentAge);
}

/** First year household spending is taken from the nest egg. Earlier of the two work-ends. */
export function drawdownStartPrimaryAge(input: CalculatorInput): number {
  if (!input.twoPerson) return input.retirementAge;
  return Math.min(input.retirementAge, partnerRetirementPrimaryAge(input));
}

/** Last year household yearly saving is deposited. Later of the two work-ends. */
export function savingEndPrimaryAge(input: CalculatorInput): number {
  if (!input.twoPerson) return input.retirementAge;
  return Math.max(input.retirementAge, partnerRetirementPrimaryAge(input));
}

/** Full-time pay that still comes in after household drawdowns have started. */
export function remainingWorkIncomeAtAge(
  age: number,
  input: CalculatorInput,
  yearsFromNow: number,
): number {
  if (!input.twoPerson) return 0;
  if (age < drawdownStartPrimaryAge(input)) return 0;
  const partnerAge = partnerAgeAt(age, input);
  const primaryPay =
    primaryAliveAt(age, input) && age < input.retirementAge && input.annualWorkIncome > 0
      ? inflate(input.annualWorkIncome, input.inflationRate, yearsFromNow)
      : 0;
  const partnerPay =
    partnerAliveAt(age, input) &&
    partnerAge < input.partnerRetirementAge &&
    input.partnerAnnualWorkIncome > 0
      ? inflate(input.partnerAnnualWorkIncome, input.inflationRate, yearsFromNow)
      : 0;
  return primaryPay + partnerPay;
}

/** Accumulation years until household drawdowns begin. Already in drawdown → 0. */
export function nestEggYears(input: CalculatorInput): number {
  return Math.max(0, drawdownStartPrimaryAge(input) - input.currentAge);
}

export function nestEggBreakdown(input: CalculatorInput): {
  years: number;
  lump: number;
  annuity: number;
  total: number;
} {
  const years = nestEggYears(input);
  const lump = futureValueLump(input.currentSavings, input.preRetirementReturn, years);
  const annuity = input.savingsGrowWithInflation
    ? futureValueGrowingOrdinaryAnnuity(
        input.annualContribution,
        input.preRetirementReturn,
        input.inflationRate,
        years,
      )
    : futureValueOrdinaryAnnuity(input.annualContribution, input.preRetirementReturn, years);
  return { years, lump, annuity, total: lump + annuity };
}

export function phasedWorkWindow(input: CalculatorInput): { start: number; end: number; years: number } {
  const start = Math.max(input.partTimeStartAge, drawdownStartPrimaryAge(input), input.currentAge);
  const end = input.partTimeEndAge;
  if (end < start) return { start, end, years: 0 };
  return { start, end, years: end - start + 1 };
}

/**
 * Guaranteed-income window for one stream.
 * Starts at the later of the benefit start, the nest-egg cutoff (full-time work ends),
 * and current age; ends at the plan-through age.
 */
export function guaranteedIncomeWindow(
  startAge: number,
  input: CalculatorInput,
): { start: number; end: number; years: number } {
  const start = Math.max(startAge, input.retirementAge, input.currentAge);
  const end = input.planToAge;
  if (end < start) return { start, end, years: 0 };
  return { start, end, years: end - start + 1 };
}

/**
 * Sum of n annual payments that grow at `rate`, starting `firstYearsFromNow` years from today.
 * At r = 0% this is payment × years.
 */
export function growingPaymentSum(payment: number, rate: number, firstYearsFromNow: number, years: number): number {
  if (years <= 0 || payment <= 0) return 0;
  if (Math.abs(rate) < 1e-12) return payment * years;
  return payment * (1 + rate) ** firstYearsFromNow * (((1 + rate) ** years - 1) / rate);
}

/**
 * Social Security with COLA (general inflation) plus pension.
 * Pension is omitted when it is $0. Pension COLA follows `pensionCola`.
 */
export function guaranteedIncomeAnnuity(input: CalculatorInput): number {
  const ss = guaranteedIncomeWindow(input.socialSecurityStartAge, input);
  const socialSecurity = growingPaymentSum(
    input.socialSecurityAnnual,
    input.inflationRate,
    ss.start - input.currentAge,
    ss.years,
  );
  if (input.pensionAnnual <= 0) return socialSecurity;
  const pension = guaranteedIncomeWindow(input.pensionStartAge, input);
  const pensionRate = input.pensionCola ? input.inflationRate : 0;
  return (
    socialSecurity +
    growingPaymentSum(input.pensionAnnual, pensionRate, pension.start - input.currentAge, pension.years)
  );
}

function streamPay(annual: number, cola: boolean, inflationRate: number, yearsFromNow: number): number {
  if (annual <= 0) return 0;
  return cola ? inflate(annual, inflationRate, yearsFromNow) : annual;
}

export function partnerAgeAt(primaryAge: number, input: CalculatorInput): number {
  return input.partnerCurrentAge + (primaryAge - input.currentAge);
}

/** Last primary-age year modeled: one-person plan-through, or the later of the two lives. */
export function planHorizonPrimaryAge(input: CalculatorInput): number {
  if (!input.twoPerson) return input.planToAge;
  return (
    input.currentAge +
    Math.max(input.planToAge - input.currentAge, input.partnerPlanToAge - input.partnerCurrentAge)
  );
}

export function primaryAliveAt(primaryAge: number, input: CalculatorInput): boolean {
  return primaryAge <= input.planToAge;
}

export function partnerAliveAt(primaryAge: number, input: CalculatorInput): boolean {
  if (!input.twoPerson) return false;
  return partnerAgeAt(primaryAge, input) <= input.partnerPlanToAge;
}

/** Face amount in the first year only one person is still in the plan. $0 or one-person is skipped. */
export function lifeInsuranceAtAge(age: number, input: CalculatorInput): number {
  if (!input.twoPerson || input.lifeInsuranceLump <= 0) return 0;
  const primaryAlive = primaryAliveAt(age, input);
  const partnerAlive = partnerAliveAt(age, input);
  if (!(primaryAlive || partnerAlive) || (primaryAlive && partnerAlive)) return 0;
  if (!primaryAliveAt(age - 1, input) || !partnerAliveAt(age - 1, input)) return 0;
  return input.lifeInsuranceLump;
}

/** Funeral cost the year each person leaves the plan. One amount per death; $0 skips. */
export function funeralCostAtAge(age: number, input: CalculatorInput, yearsFromNow: number): number {
  if (!input.twoPerson || input.funeralCost <= 0) return 0;
  const primaryDies = primaryAliveAt(age, input) && !primaryAliveAt(age + 1, input);
  const partnerDies = partnerAliveAt(age, input) && !partnerAliveAt(age + 1, input);
  const deaths = (primaryDies ? 1 : 0) + (partnerDies ? 1 : 0);
  if (deaths === 0) return 0;
  return deaths * inflate(input.funeralCost, input.inflationRate, yearsFromNow);
}

function onePersonSocialSecurity(age: number, input: CalculatorInput, yearsFromNow: number): number {
  const ss = guaranteedIncomeWindow(input.socialSecurityStartAge, input);
  if (ss.years <= 0 || age < ss.start || age > ss.end) return 0;
  return streamPay(input.socialSecurityAnnual, true, input.inflationRate, yearsFromNow);
}

function onePersonPension(age: number, input: CalculatorInput, yearsFromNow: number): number {
  if (input.pensionAnnual <= 0) return 0;
  const pension = guaranteedIncomeWindow(input.pensionStartAge, input);
  if (pension.years <= 0 || age < pension.start || age > pension.end) return 0;
  return streamPay(input.pensionAnnual, input.pensionCola, input.inflationRate, yearsFromNow);
}

function personBenefit(
  annual: number,
  startAge: number,
  personAge: number,
  cola: boolean,
  inflationRate: number,
  yearsFromNow: number,
  retired: boolean,
): number {
  if (!retired || annual <= 0 || personAge < startAge) return 0;
  return streamPay(annual, cola, inflationRate, yearsFromNow);
}

export function socialSecurityAtAge(age: number, input: CalculatorInput, yearsFromNow: number): number {
  if (!input.twoPerson) return onePersonSocialSecurity(age, input, yearsFromNow);
  const retired = age >= drawdownStartPrimaryAge(input);
  const primaryRecord = personBenefit(
    input.socialSecurityAnnual,
    input.socialSecurityStartAge,
    age,
    true,
    input.inflationRate,
    yearsFromNow,
    retired,
  );
  const partnerRecord = personBenefit(
    input.partnerSocialSecurityAnnual,
    input.partnerSocialSecurityStartAge,
    partnerAgeAt(age, input),
    true,
    input.inflationRate,
    yearsFromNow,
    retired,
  );
  const primaryAlive = primaryAliveAt(age, input);
  const partnerAlive = partnerAliveAt(age, input);
  if (primaryAlive && partnerAlive) return primaryRecord + partnerRecord;
  if (primaryAlive || partnerAlive) return Math.max(primaryRecord, partnerRecord);
  return 0;
}

export function pensionAtAge(age: number, input: CalculatorInput, yearsFromNow: number): number {
  if (!input.twoPerson) return onePersonPension(age, input, yearsFromNow);
  const retired = age >= drawdownStartPrimaryAge(input);
  const primaryFull = personBenefit(
    input.pensionAnnual,
    input.pensionStartAge,
    age,
    input.pensionCola,
    input.inflationRate,
    yearsFromNow,
    retired,
  );
  const partnerFull = personBenefit(
    input.partnerPensionAnnual,
    input.partnerPensionStartAge,
    partnerAgeAt(age, input),
    input.partnerPensionCola,
    input.inflationRate,
    yearsFromNow,
    retired,
  );
  const primaryAlive = primaryAliveAt(age, input);
  const partnerAlive = partnerAliveAt(age, input);
  const primaryPay = primaryAlive ? primaryFull : primaryFull * input.pensionSurvivorPercent;
  const partnerPay = partnerAlive ? partnerFull : partnerFull * input.partnerPensionSurvivorPercent;
  if (!primaryAlive && !partnerAlive) return 0;
  return primaryPay + partnerPay;
}

function guaranteedIncomeAtAge(age: number, input: CalculatorInput, yearsFromNow: number): number {
  return socialSecurityAtAge(age, input, yearsFromNow) + pensionAtAge(age, input, yearsFromNow);
}

export function lifePhase(age: number, input: CalculatorInput): LifePhase {
  if (age < drawdownStartPrimaryAge(input)) return "working";
  if (age <= input.goGoEndAge) return "go-go";
  if (age <= input.slowGoEndAge) return "slow-go";
  return "no-go";
}

export function lifestyleMultiplier(age: number, input: CalculatorInput): number {
  const phase = lifePhase(age, input);
  if (phase === "working") return 1;
  if (phase === "go-go") return input.goGoLifestyleMultiplier;
  if (phase === "slow-go") return input.slowGoLifestyleMultiplier;
  return input.noGoLifestyleMultiplier;
}

const HOUSING_LIFESTYLE_FACTOR: Record<Exclude<HousingKind, null>, number> = {
  independent: 0.72,
  ccrc: 0.58,
  nursing: 0.42,
};

/** One facility stream at a time: CCRC, else nursing, else senior rental. */
export function facilityHousing(
  age: number,
  input: CalculatorInput,
  yearsFromNow: number,
  medicalRate: number,
): { rent: number; kind: HousingKind; lifestyleFactor: number } {
  if (input.ccrcRentAnnual > 0 && age >= input.ccrcStartAge) {
    return {
      rent: inflate(input.ccrcRentAnnual, medicalRate, yearsFromNow),
      kind: "ccrc",
      lifestyleFactor: HOUSING_LIFESTYLE_FACTOR.ccrc,
    };
  }
  if (input.nursingHomeRentAnnual > 0 && age >= input.nursingHomeStartAge) {
    return {
      rent: inflate(input.nursingHomeRentAnnual, medicalRate, yearsFromNow),
      kind: "nursing",
      lifestyleFactor: HOUSING_LIFESTYLE_FACTOR.nursing,
    };
  }
  if (input.seniorHomeRentAnnual > 0 && age >= input.seniorHomeStartAge) {
    return {
      rent: inflate(input.seniorHomeRentAnnual, input.inflationRate, yearsFromNow),
      kind: "independent",
      lifestyleFactor: HOUSING_LIFESTYLE_FACTOR.independent,
    };
  }
  return { rent: 0, kind: null, lifestyleFactor: 1 };
}

export function healthcareAgeFactor(age: number): number {
  if (age < 65) return 1;
  if (age < 75) return 1.22;
  if (age < 85) return 1.75;
  return 2.45;
}

function emptyHousing(): { rent: number; kind: HousingKind; lifestyleFactor: number } {
  return { rent: 0, kind: null, lifestyleFactor: 1 };
}

function partnerNursingHousing(
  partnerAge: number,
  input: CalculatorInput,
  yearsFromNow: number,
  medicalRate: number,
): { rent: number; kind: HousingKind; lifestyleFactor: number } {
  if (input.partnerNursingHomeRentAnnual > 0 && partnerAge >= input.partnerNursingHomeStartAge) {
    return {
      rent: inflate(input.partnerNursingHomeRentAnnual, medicalRate, yearsFromNow),
      kind: "nursing",
      lifestyleFactor: HOUSING_LIFESTYLE_FACTOR.nursing,
    };
  }
  return emptyHousing();
}

function householdHousing(
  age: number,
  partnerAge: number | null,
  primaryAlive: boolean,
  partnerAlive: boolean,
  input: CalculatorInput,
  yearsFromNow: number,
  medicalRate: number,
  straightLine: boolean,
): {
  rent: number;
  kind: HousingKind;
  lifestyleFactor: number;
  primaryCareFacility: boolean;
  partnerCareFacility: boolean;
} {
  if (straightLine) {
    return { ...emptyHousing(), primaryCareFacility: false, partnerCareFacility: false };
  }
  if (!input.twoPerson) {
    const housing = facilityHousing(age, input, yearsFromNow, medicalRate);
    const care = housing.kind === "nursing" || housing.kind === "ccrc";
    return { ...housing, primaryCareFacility: care, partnerCareFacility: false };
  }

  if (input.ccrcRentAnnual > 0 && age >= input.ccrcStartAge && (primaryAlive || partnerAlive)) {
    return {
      rent: inflate(input.ccrcRentAnnual, medicalRate, yearsFromNow),
      kind: "ccrc",
      lifestyleFactor: HOUSING_LIFESTYLE_FACTOR.ccrc,
      primaryCareFacility: primaryAlive,
      partnerCareFacility: partnerAlive,
    };
  }

  const withoutHouseholdCcrc = { ...input, ccrcRentAnnual: 0 };
  const primaryH = primaryAlive
    ? facilityHousing(age, withoutHouseholdCcrc, yearsFromNow, medicalRate)
    : emptyHousing();
  const partnerH =
    partnerAlive && partnerAge != null
      ? partnerNursingHousing(partnerAge, input, yearsFromNow, medicalRate)
      : emptyHousing();
  const primaryCare = primaryH.kind === "nursing";
  const partnerCare = partnerH.kind === "nursing";
  const bothAlive = primaryAlive && partnerAlive;
  let lifestyleFactor = 1;
  if (bothAlive && ((primaryCare && !partnerCare) || (!primaryCare && partnerCare))) {
    lifestyleFactor = 1;
  } else if (bothAlive) {
    lifestyleFactor =
      primaryCare && partnerCare
        ? Math.min(primaryH.lifestyleFactor, partnerH.lifestyleFactor)
        : primaryH.kind
          ? primaryH.lifestyleFactor
          : partnerH.lifestyleFactor;
  } else {
    lifestyleFactor = primaryAlive ? primaryH.lifestyleFactor : partnerH.lifestyleFactor;
  }
  const kind: HousingKind =
    primaryH.kind === "nursing" || partnerH.kind === "nursing"
      ? "nursing"
      : primaryH.kind ?? partnerH.kind;
  return {
    rent: primaryH.rent + partnerH.rent,
    kind,
    lifestyleFactor,
    primaryCareFacility: primaryCare,
    partnerCareFacility: partnerCare,
  };
}

type RunYearOptions = {
  straightLine?: boolean;
  badFirstDecade?: boolean;
};

function runYears(input: CalculatorInput, option: boolean | RunYearOptions): YearRow[] {
  const opts: RunYearOptions = typeof option === "boolean" ? { straightLine: option } : option;
  const straightLine = Boolean(opts.straightLine);
  const badFirstDecade = Boolean(opts.badFirstDecade);
  const years: YearRow[] = [];
  let balance = input.currentSavings;
  let depleted = false;
  const workWindow = phasedWorkWindow(input);
  let investActive = input.partTimeAnnualInvestment > 0;
  const retirementStartAge = Math.max(drawdownStartPrimaryAge(input), input.currentAge);
  const savingEndAge = savingEndPrimaryAge(input);
  const weakReturn = badDecadeReturn(input.postRetirementReturn);
  const horizon = planHorizonPrimaryAge(input);
  let forceWorkingIncremental = false;

  for (let age = input.currentAge; age <= horizon; age += 1) {
    const yearsFromNow = age - input.currentAge;
    const working = age < drawdownStartPrimaryAge(input);
    const partnerAge = input.twoPerson ? partnerAgeAt(age, input) : null;
    const primaryAlive = primaryAliveAt(age, input);
    const partnerAlive = partnerAliveAt(age, input);

    if (working) {
      const yearsDone = age - input.currentAge;
      const rate = input.preRetirementReturn;
      const contribution = input.savingsGrowWithInflation
        ? inflate(input.annualContribution, input.inflationRate, yearsFromNow)
        : input.annualContribution;
      const lifeInsurance = lifeInsuranceAtAge(age, input);
      const funeralSpend = funeralCostAtAge(age, input, yearsFromNow);
      let startBalance: number;
      let endBalance: number;
      let growth: number;
      if (input.savingsGrowWithInflation || forceWorkingIncremental) {
        startBalance = balance;
        growth = startBalance * rate;
        endBalance = startBalance + growth + contribution + lifeInsurance - funeralSpend;
      } else {
        startBalance = nestEggAtRetirement(
          input.currentSavings,
          input.annualContribution,
          rate,
          yearsDone,
        );
        endBalance = nestEggAtRetirement(
          input.currentSavings,
          input.annualContribution,
          rate,
          yearsDone + 1,
        );
        growth = startBalance * rate;
        endBalance += lifeInsurance - funeralSpend;
      }
      if (lifeInsurance > 0 || funeralSpend > 0) forceWorkingIncremental = true;
      balance = endBalance;
      years.push({
        age,
        partnerAge,
        primaryAlive,
        partnerAlive,
        phase: "working",
        startBalance,
        growth,
        contribution,
        guaranteedIncome: 0,
        partTimeIncome: 0,
        workIncome: 0,
        lifeInsurance,
        lifestyleSpend: 0,
        healthcareSpend: 0,
        longTermCareSpend: 0,
        housingSpend: 0,
        funeralSpend,
        housingKind: null,
        totalSpend: funeralSpend,
        netCashFlow: contribution + lifeInsurance - funeralSpend,
        endBalance,
        depleted: false,
      });
      continue;
    }

    const startBalance = Math.max(balance, 0);
    const yearsIntoRetirement = age - retirementStartAge;
    const rate =
      badFirstDecade && yearsIntoRetirement < BAD_DECADE_YEARS
        ? weakReturn
        : input.postRetirementReturn;
    if (!primaryAlive && !partnerAlive) continue;

    const inPhasedWork =
      primaryAlive && age >= workWindow.start && age <= workWindow.end && workWindow.years > 0;
    const investPmt =
      investActive && inPhasedWork && input.partTimeAnnualInvestment > 0 ? input.partTimeAnnualInvestment : 0;
    const investYear = inPhasedWork ? age - workWindow.start + 1 : 0;
    const sidecar =
      investPmt > 0 && investYear > 0
        ? nestEggAtRetirement(0, investPmt, input.partTimeInvestmentReturn, investYear)
        : 0;
    const stillSaving = age < savingEndAge && input.annualContribution > 0;
    const householdSave = stillSaving
      ? input.savingsGrowWithInflation
        ? inflate(input.annualContribution, input.inflationRate, yearsFromNow)
        : input.annualContribution
      : 0;
    const contribution = investPmt + householdSave;
    const guaranteedIncome = guaranteedIncomeAtAge(age, input, yearsFromNow);

    const primaryPartTime =
      primaryAlive &&
      input.partTimeAnnualIncome > 0 &&
      age >= input.partTimeStartAge &&
      age <= input.partTimeEndAge
        ? inflate(input.partTimeAnnualIncome, input.inflationRate, yearsFromNow)
        : 0;
    const partnerPartTime =
      partnerAlive &&
      input.partnerPartTimeAnnualIncome > 0 &&
      partnerAge != null &&
      partnerAge >= input.partnerPartTimeStartAge &&
      partnerAge <= input.partnerPartTimeEndAge
        ? inflate(input.partnerPartTimeAnnualIncome, input.inflationRate, yearsFromNow)
        : 0;
    const partTimeIncome = primaryPartTime + partnerPartTime;
    const workIncome = remainingWorkIncomeAtAge(age, input, yearsFromNow);
    const lifeInsurance = lifeInsuranceAtAge(age, input);
    const funeralSpend = funeralCostAtAge(age, input, yearsFromNow);

    const healthInflation = straightLine ? input.inflationRate : input.healthcareInflationRate;
    const lifeMult = straightLine ? 1 : lifestyleMultiplier(age, input);
    const housing = householdHousing(
      age,
      partnerAge,
      primaryAlive,
      partnerAlive,
      input,
      yearsFromNow,
      healthInflation,
      straightLine,
    );
    const housingSpend = housing.rent;
    const housingKind = housing.kind;
    const survivor =
      input.twoPerson && (primaryAlive || partnerAlive) && !(primaryAlive && partnerAlive);
    const lifestyleSpend =
      inflate(input.lifestyleSpendToday, input.inflationRate, yearsFromNow) *
      lifeMult *
      (survivor ? input.survivorLifestyleFactor : 1) *
      housing.lifestyleFactor;
    const primaryHealthcare = primaryAlive
      ? inflate(input.healthcareSpendToday, healthInflation, yearsFromNow) *
        (straightLine ? 1 : healthcareAgeFactor(age))
      : 0;
    const partnerHealthcare =
      partnerAlive && input.partnerHealthcareSpendToday > 0
        ? inflate(input.partnerHealthcareSpendToday, healthInflation, yearsFromNow) *
          (straightLine ? 1 : healthcareAgeFactor(partnerAge ?? age))
        : 0;
    const healthcareSpend = primaryHealthcare + partnerHealthcare;
    const longTermCareSpend =
      (!straightLine &&
      primaryAlive &&
      !housing.primaryCareFacility &&
      age >= input.longTermCareStartAge &&
      input.longTermCareAnnual > 0
        ? inflate(input.longTermCareAnnual, healthInflation, yearsFromNow)
        : 0) +
      (!straightLine &&
      partnerAlive &&
      !housing.partnerCareFacility &&
      partnerAge != null &&
      partnerAge >= input.partnerLongTermCareStartAge &&
      input.partnerLongTermCareAnnual > 0
        ? inflate(input.partnerLongTermCareAnnual, healthInflation, yearsFromNow)
        : 0);

    const totalSpend = lifestyleSpend + healthcareSpend + longTermCareSpend + housingSpend + funeralSpend;
    const inflow = guaranteedIncome + partTimeIncome + workIncome + lifeInsurance;
    const netCashFlow = inflow - totalSpend + householdSave;

    const afterCash = startBalance + netCashFlow;
    let growth: number;
    let mainEnd: number;
    let endBalance: number;
    if (afterCash < 0) {
      growth = 0;
      if (afterCash + sidecar >= 0) {
        mainEnd = afterCash + sidecar;
        endBalance = mainEnd;
        depleted = false;
        investActive = false;
      } else {
        mainEnd = 0;
        endBalance = 0;
        depleted = true;
        investActive = false;
      }
      balance = mainEnd;
    } else {
      growth = afterCash * rate;
      mainEnd = afterCash + growth;
      if (inPhasedWork && age < workWindow.end) {
        endBalance = mainEnd + sidecar;
        balance = mainEnd;
      } else if (inPhasedWork && age === workWindow.end) {
        mainEnd += sidecar;
        endBalance = mainEnd;
        balance = mainEnd;
      } else {
        endBalance = mainEnd;
        balance = mainEnd;
      }
    }

    if (endBalance < 0) {
      depleted = true;
      endBalance = 0;
      balance = 0;
    }

    years.push({
      age,
      partnerAge,
      primaryAlive,
      partnerAlive,
      phase: lifePhase(age, input),
      startBalance,
      growth,
      contribution,
      guaranteedIncome: working ? 0 : guaranteedIncome,
      partTimeIncome,
      workIncome,
      lifeInsurance,
      lifestyleSpend,
      healthcareSpend,
      longTermCareSpend,
      housingSpend,
      funeralSpend,
      housingKind,
      totalSpend,
      netCashFlow,
      endBalance,
      depleted: depleted && endBalance === 0 && !working,
    });
  }

  return years;
}

function firstDepletionAge(years: YearRow[]): number | null {
  const row = years.find((y) => y.depleted);
  return row ? row.age : null;
}

function fundedThrough(years: YearRow[], horizonAge: number): number {
  const depletion = firstDepletionAge(years);
  if (depletion == null) return horizonAge;
  return Math.max(depletion, years[0]?.age ?? depletion);
}

function firstDeathPrimaryAge(years: YearRow[]): number | null {
  let lastBoth: number | null = null;
  for (const row of years) {
    if (row.primaryAlive && row.partnerAlive) lastBoth = row.age;
  }
  const hasSurvivor = years.some((row) => row.primaryAlive !== row.partnerAlive);
  return hasSurvivor ? lastBoth : null;
}

function fundedRetirementYears(years: YearRow[]): YearRow[] {
  const funded: YearRow[] = [];
  for (const y of years) {
    if (y.phase === "working") continue;
    funded.push(y);
    if (y.depleted) break;
  }
  return funded;
}

function buildOutlook(input: CalculatorInput, years: YearRow[], straight: YearRow[]): Outlook {
  const fundedYears = fundedRetirementYears(years);
  const last = years[years.length - 1];
  const depletionAge = firstDepletionAge(years);
  const depleted = depletionAge != null;
  const horizon = planHorizonPrimaryAge(input);
  const fundedThroughAge = fundedThrough(years, horizon);
  const endingBalance = depleted ? 0 : last?.endBalance ?? 0;
  const lastYearSpend = fundedYears.at(-1)?.totalSpend ?? 0;

  const totalHealthcareSpend = fundedYears.reduce((s, y) => s + y.healthcareSpend, 0);
  const totalLifestyleSpend = fundedYears.reduce((s, y) => s + y.lifestyleSpend, 0);
  const totalLongTermCareSpend = fundedYears.reduce((s, y) => s + y.longTermCareSpend, 0);
  const totalHousingSpend = fundedYears.reduce((s, y) => s + y.housingSpend, 0);
  const funeralTotal = fundedYears.reduce((s, y) => s + y.funeralSpend, 0);
  const totalSpend = totalHealthcareSpend + totalLifestyleSpend + totalLongTermCareSpend + totalHousingSpend + funeralTotal;
  const healthcareShare = totalSpend > 0 ? (totalHealthcareSpend + totalLongTermCareSpend + totalHousingSpend) / totalSpend : 0;
  const nestEgg = nestEggBreakdown(input);
  const partTimeWages = fundedYears.reduce((s, y) => s + y.partTimeIncome, 0);
  const workIncomeTotal = fundedYears.reduce((s, y) => s + y.workIncome, 0);
  const window = phasedWorkWindow(input);
  const investedYears = fundedYears.filter((y) => y.age >= window.start && y.age <= window.end).length;
  const partTimeInvested = nestEggAtRetirement(
    0,
    input.partTimeAnnualInvestment,
    input.partTimeInvestmentReturn,
    investedYears,
  );
  const partTimeTotal = partTimeWages + partTimeInvested;
  const socialSecurityTotal = fundedYears.reduce(
    (s, y) => s + socialSecurityAtAge(y.age, input, y.age - input.currentAge),
    0,
  );
  const pensionTotal = fundedYears.reduce(
    (s, y) => s + pensionAtAge(y.age, input, y.age - input.currentAge),
    0,
  );
  const lifeInsuranceTotal = fundedYears.reduce((s, y) => s + y.lifeInsurance, 0);
  const retirementIncomeTotal = socialSecurityTotal + pensionTotal + partTimeTotal + workIncomeTotal + lifeInsuranceTotal;
  const fundingTotal = nestEgg.total + retirementIncomeTotal;
  const totalMedicalSpend = totalHealthcareSpend + totalLongTermCareSpend + totalHousingSpend;
  const totalRetirementSpend = totalLifestyleSpend + totalMedicalSpend + funeralTotal;

  let peakHealthcareAge: number | null = null;
  let peakHealthcareSpend = 0;
  for (const y of fundedYears) {
    const medical = y.healthcareSpend + y.longTermCareSpend + y.housingSpend;
    if (medical > peakHealthcareSpend) {
      peakHealthcareSpend = medical;
      peakHealthcareAge = y.age;
    }
  }

  const straightLineFundedThroughAge = fundedThrough(straight, horizon);
  const straightLineEndingBalance = firstDepletionAge(straight) != null ? 0 : straight.at(-1)?.endBalance ?? 0;
  const longevityGapYears = straightLineFundedThroughAge - fundedThroughAge;

  const modeledFromAge = years[0]?.age ?? input.currentAge;
  const retirementStartAge = Math.max(drawdownStartPrimaryAge(input), modeledFromAge);
  const yearsInRetirement = Math.max(0, horizon - retirementStartAge + 1);
  const yearsCovered = Math.min(
    yearsInRetirement,
    Math.max(0, fundedThroughAge - retirementStartAge + 1),
  );
  const requiredMonths = yearsInRetirement * 12;
  const coveredMonths = yearsCovered * 12;
  const remainingSavings = depleted ? 0 : endingBalance;
  const remainingExpenseNeed = years
    .filter((y) => y.phase !== "working" && y.age > fundedThroughAge)
    .reduce((s, y) => s + Math.max(0, y.totalSpend - y.guaranteedIncome - y.partTimeIncome - y.workIncome - y.lifeInsurance), 0);
  const surplusMonths =
    !depleted && remainingSavings > 0 && lastYearSpend > 0
      ? remainingSavings / (lastYearSpend / 12)
      : 0;
  const accumulatedMonths = coveredMonths + surplusMonths;
  const surpassesRequiredMonths = !depleted && remainingSavings > 0 && coveredMonths >= requiredMonths;

  let status: Outlook["status"];
  if (!depleted && endingBalance >= lastYearSpend * 3) {
    status = "strong";
  } else if (!depleted) {
    status = "watchful";
  } else if (depletionAge != null && depletionAge >= horizon - 4) {
    status = "watchful";
  } else if (depletionAge != null && depletionAge >= retirementStartAge + 12) {
    status = "at-risk";
  } else {
    status = "shortfall";
  }

  const targetAge = horizon;
  const partnerAtFunded =
    input.twoPerson ? partnerAgeAt(fundedThroughAge, input) : null;
  const twoPersonNote = input.twoPerson
    ? partnerAtFunded != null
      ? ` Ages are the first person’s; the partner is ${partnerAtFunded} in that year.`
      : ""
    : "";
  const copy: Record<Outlook["status"], { title: string; summary: string }> = {
    strong: {
      title: "On track through your longevity target",
      summary: `Under these assumptions, savings last through age ${fundedThroughAge} with a cushion of ${formatCompact(endingBalance)} remaining.${twoPersonNote}`,
    },
    watchful: {
      title: "Likely to last — with little slack",
      summary: depleted
        ? `Savings reach about age ${fundedThroughAge}, close to your target of ${targetAge}. Small changes in health costs or returns could tip the result.${twoPersonNote}`
        : `You reach age ${fundedThroughAge}, but the remaining balance is thin relative to later-life medical costs.${twoPersonNote}`,
    },
    "at-risk": {
      title: "Savings may not outlive you",
      summary: `The portfolio is modeled to run out around age ${fundedThroughAge}, ${Math.max(0, targetAge - fundedThroughAge)} years before your longevity target.${twoPersonNote}`,
    },
    shortfall: {
      title: "A meaningful longevity gap",
      summary: `Funds are modeled to last only to about age ${fundedThroughAge}. Healthcare inflation and later-life care are the largest pressure points.${twoPersonNote}`,
    },
  };

  return {
    status,
    title: copy[status].title,
    summary: copy[status].summary,
    fundedThroughAge,
    depleted,
    depletionAge,
    endingBalance,
    yearsInRetirement,
    yearsCovered,
    totalHealthcareSpend,
    totalLifestyleSpend,
    totalLongTermCareSpend,
    totalHousingSpend,
    funeralTotal,
    totalMedicalSpend,
    totalRetirementSpend,
    healthcareShare,
    peakHealthcareAge,
    peakHealthcareSpend,
    nestEggYears: nestEgg.years,
    nestEggLump: nestEgg.lump,
    nestEggAnnuity: nestEgg.annuity,
    nestEggAtRetirement: nestEgg.total,
    socialSecurityTotal,
    pensionTotal,
    partTimeWages,
    workIncomeTotal,
    partTimeInvested,
    partTimeTotal,
    retirementIncomeTotal,
    lifeInsuranceTotal,
    fundingTotal,
    straightLineFundedThroughAge,
    straightLineEndingBalance,
    longevityGapYears,
    lastYearSpend,
    requiredMonths,
    coveredMonths,
    surplusMonths,
    accumulatedMonths,
    surpassesRequiredMonths,
    remainingSavings,
    remainingExpenseNeed,
    householdHorizonAge: horizon,
    firstDeathPrimaryAge: input.twoPerson ? firstDeathPrimaryAge(years) : null,
    partnerFundedThroughAge: input.twoPerson ? partnerAgeAt(fundedThroughAge, input) : null,
    ...longevityToolExtras(input, fundedThroughAge),
  };
}

function longevityToolExtras(
  input: CalculatorInput,
  mainFundedThroughAge: number,
): Pick<
  Outlook,
  | "badDecadeFundedThroughAge"
  | "badDecadeEndingBalance"
  | "badDecadeGapYears"
  | "badDecadeReturn"
  | "claiming67Annual"
  | "claiming70Annual"
  | "claiming67FundedThroughAge"
  | "claiming70FundedThroughAge"
> {
  const claiming67Annual = socialSecurityAnnualAtClaimAge(
    input.socialSecurityAnnual,
    input.socialSecurityStartAge,
    67,
  );
  const claiming70Annual = socialSecurityAnnualAtClaimAge(
    input.socialSecurityAnnual,
    input.socialSecurityStartAge,
    70,
  );
  const years67 = runYears(
    { ...input, socialSecurityAnnual: claiming67Annual, socialSecurityStartAge: 67 },
    false,
  );
  const years70 = runYears(
    { ...input, socialSecurityAnnual: claiming70Annual, socialSecurityStartAge: 70 },
    false,
  );
  const bad = runYears(input, { badFirstDecade: true });
  const horizon = planHorizonPrimaryAge(input);
  const badDecadeFundedThroughAge = fundedThrough(bad, horizon);
  const badDepleted = firstDepletionAge(bad) != null;
  return {
    claiming67Annual,
    claiming70Annual,
    claiming67FundedThroughAge: fundedThrough(years67, horizon),
    claiming70FundedThroughAge: fundedThrough(years70, horizon),
    badDecadeFundedThroughAge,
    badDecadeEndingBalance: badDepleted ? 0 : bad.at(-1)?.endBalance ?? 0,
    badDecadeGapYears: Math.max(0, mainFundedThroughAge - badDecadeFundedThroughAge),
    badDecadeReturn: badDecadeReturn(input.postRetirementReturn),
  };
}

function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function projectBase(input: CalculatorInput): Omit<ProjectionResult, "comfort"> {
  const years = runYears(input, false);
  const straight = runYears(input, true);
  return {
    input,
    years,
    outlook: buildOutlook(input, years, straight),
    warnings: warningsFor(input),
  };
}
