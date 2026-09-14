export type MortgageInput = {
  homePrice: number;
  downPayment: number;
  annualRate: number;
  termYears: number;
  extraMonthly: number;
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  hoaMonthly: number;
  pmiMonthly: number;
  maintenanceAnnual: number;
  annualIncome: number;
  foodMonthly: number;
  schoolMonthly: number;
  travelMonthly: number;
  extracurricularMonthly: number;
  carLoanMonthly: number;
  carLoanYears: number;
  otherLoanMonthly: number;
  otherLoanYears: number;
  dependentsMonthly: number;
  healthMonthly: number;
  investmentPile: number;
  investmentReturn: number;
  inflationRate: number;
  compareHomePrice: number;
  compareDownPayment: number;
  compareAnnualRate: number;
  compareTermYears: number;
};

export type MortgagePayload = Partial<MortgageInput>;

/** A first-home run that is tight once taxes, insurance, and life costs sit beside the payment. */
export const MORTGAGE_DEFAULT: MortgageInput = {
  homePrice: 425_000,
  downPayment: 85_000,
  annualRate: 0.065,
  termYears: 30,
  extraMonthly: 0,
  propertyTaxAnnual: 6_375,
  homeInsuranceAnnual: 1_800,
  hoaMonthly: 0,
  pmiMonthly: 0,
  maintenanceAnnual: 4_250,
  annualIncome: 96_000,
  foodMonthly: 800,
  schoolMonthly: 0,
  travelMonthly: 200,
  extracurricularMonthly: 0,
  carLoanMonthly: 380,
  carLoanYears: 4,
  otherLoanMonthly: 0,
  otherLoanYears: 0,
  dependentsMonthly: 0,
  healthMonthly: 420,
  investmentPile: 22_000,
  investmentReturn: 0.05,
  inflationRate: 0.026,
  compareHomePrice: 425_000,
  compareDownPayment: 85_000,
  compareAnnualRate: 0.059,
  compareTermYears: 15,
};
