import { MORTGAGE_DEFAULT } from "./defaults";
import { estimateMortgage } from "./estimateMortgage";
import { firstHousingBreakdown, moneyGoesRows } from "./exportSchedule";

const base = estimateMortgage(MORTGAGE_DEFAULT);
const ten = estimateMortgage({ ...MORTGAGE_DEFAULT, downPayment: 42_500, pmiMonthly: 180 });
const yearOne = base.primary.years[0]!;
const breakdown = firstHousingBreakdown(base);

export const TRUE_COST_GUIDE_FIGURES = {
  homePrice: MORTGAGE_DEFAULT.homePrice,
  downPayment: MORTGAGE_DEFAULT.downPayment,
  annualRate: MORTGAGE_DEFAULT.annualRate,
  termYears: MORTGAGE_DEFAULT.termYears,
  loanAmount: base.primary.loanAmount,
  monthlyPI: base.primary.monthlyPI,
  firstInterest: base.primary.firstPaymentInterest,
  firstPrincipal: base.primary.firstPaymentPrincipal,
  firstHousingMonthly: base.primary.firstHousingMonthly,
  housingGap: base.primary.firstHousingMonthly - base.primary.monthlyPI,
  crossoverYear: base.primary.crossoverYear,
  cashToBuy: base.cashToBuy,
  closingCost: MORTGAGE_DEFAULT.closingCost,
  movingCost: MORTGAGE_DEFAULT.movingCost,
  furnishingCost: MORTGAGE_DEFAULT.furnishingCost,
  maintenanceAnnual: MORTGAGE_DEFAULT.maintenanceAnnual,
  taxGrowth: MORTGAGE_DEFAULT.taxGrowthRate,
  yearOneTax: yearOne.tax,
  yearOneInsurance: yearOne.insurance,
  yearOneMaintenance: yearOne.maintenance,
  yearOneIncome: yearOne.income,
  yearOneHousing: yearOne.housing,
  yearOneLife: yearOne.life,
  yearOneLoans: yearOne.loans,
  yearOneLeftover: yearOne.leftover,
  housingRatio: base.primary.housingRatio,
  obligationRatio: base.primary.obligationRatio,
  totalInterest: base.primary.totalInterest,
  totalFinancing: base.primary.totalFinancing,
  totalOwnership: base.primary.totalOwnership,
  totalHousingOutflow: base.primary.totalHousingOutflow,
  outflowPlusCash: base.primary.totalHousingOutflow + base.cashToBuy,
  breakdown,
  moneyGoes: moneyGoesRows(base),
  tenDownPayment: 42_500,
  tenPmiMonthly: 180,
  tenLoan: ten.primary.loanAmount,
  tenMonthlyPI: ten.primary.monthlyPI,
  tenHousing: ten.primary.firstHousingMonthly,
  tenPmiDropYear: ten.primary.pmiDropYear,
  tenCashToBuy: ten.cashToBuy,
  compareRate: MORTGAGE_DEFAULT.compareAnnualRate,
  compareTerm: MORTGAGE_DEFAULT.compareTermYears,
};
