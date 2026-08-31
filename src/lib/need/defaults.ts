import { DEFAULT_INPUT } from "@/lib/engine";
import type { CalculatorInput } from "@/lib/engine";

/** Lean starting point: the entered plan only. Extras stay at $0 unless this form sets them. */
export const NEED_DEFAULT: CalculatorInput = {
  ...DEFAULT_INPUT,
  partTimeAnnualIncome: 0,
  partTimeAnnualInvestment: 0,
  longTermCareAnnual: 0,
  seniorHomeRentAnnual: 0,
  nursingHomeRentAnnual: 0,
  ccrcRentAnnual: 0,
  pensionAnnual: 0,
  twoPerson: false,
  annualWorkIncome: 0,
  partnerAnnualWorkIncome: 0,
  partnerSocialSecurityAnnual: 0,
  partnerPensionAnnual: 0,
  partnerPartTimeAnnualIncome: 0,
  partnerHealthcareSpendToday: 0,
  partnerLongTermCareAnnual: 0,
  partnerNursingHomeRentAnnual: 0,
  lifeInsuranceLump: 0,
  funeralCost: 0,
};
