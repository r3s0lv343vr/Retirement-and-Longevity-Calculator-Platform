import { MORTGAGE_DEFAULT, type MortgageInput } from "./defaults";
import { mergeMortgageInput } from "./estimateMortgage";

const NUMBER_KEYS: { query: string; field: keyof MortgageInput }[] = [
  { query: "hp", field: "homePrice" },
  { query: "dp", field: "downPayment" },
  { query: "ar", field: "annualRate" },
  { query: "ty", field: "termYears" },
  { query: "ex", field: "extraMonthly" },
  { query: "ea", field: "extraAnnual" },
  { query: "eo", field: "extraOneTime" },
  { query: "em", field: "extraOneTimeMonth" },
  { query: "tx", field: "propertyTaxAnnual" },
  { query: "ins", field: "homeInsuranceAnnual" },
  { query: "hoa", field: "hoaMonthly" },
  { query: "pmi", field: "pmiMonthly" },
  { query: "mn", field: "maintenanceAnnual" },
  { query: "tg", field: "taxGrowthRate" },
  { query: "ig", field: "insuranceGrowthRate" },
  { query: "hg", field: "hoaGrowthRate" },
  { query: "cc", field: "closingCost" },
  { query: "mv", field: "movingCost" },
  { query: "fn", field: "furnishingCost" },
  { query: "yi", field: "annualIncome" },
  { query: "fd", field: "foodMonthly" },
  { query: "sc", field: "schoolMonthly" },
  { query: "tr", field: "travelMonthly" },
  { query: "xc", field: "extracurricularMonthly" },
  { query: "cr", field: "carLoanMonthly" },
  { query: "cy", field: "carLoanYears" },
  { query: "ol", field: "otherLoanMonthly" },
  { query: "oy", field: "otherLoanYears" },
  { query: "dpn", field: "dependentsMonthly" },
  { query: "hl", field: "healthMonthly" },
  { query: "ip", field: "investmentPile" },
  { query: "ir", field: "investmentReturn" },
  { query: "inf", field: "inflationRate" },
  { query: "chp", field: "compareHomePrice" },
  { query: "cdp", field: "compareDownPayment" },
  { query: "car", field: "compareAnnualRate" },
  { query: "cty", field: "compareTermYears" },
];

export function mortgageToSearchParams(input: MortgageInput): URLSearchParams {
  const params = new URLSearchParams();
  for (const { query, field } of NUMBER_KEYS) {
    params.set(query, String(input[field]));
  }
  return params;
}

export function mortgageFromSearchParams(params: URLSearchParams): MortgageInput | null {
  if (!NUMBER_KEYS.some(({ query }) => params.has(query))) return null;
  const payload: Partial<MortgageInput> = {};
  for (const { query, field } of NUMBER_KEYS) {
    if (!params.has(query)) continue;
    payload[field] = Number(params.get(query));
  }
  return mergeMortgageInput({ ...MORTGAGE_DEFAULT, ...payload });
}

export function writeMortgageUrl(input: MortgageInput): void {
  const next = `?${mortgageToSearchParams(input).toString()}`;
  window.history.replaceState(window.history.state, "", next);
}

export function readMortgageFromLocation(): MortgageInput | null {
  return mortgageFromSearchParams(new URLSearchParams(window.location.search));
}
