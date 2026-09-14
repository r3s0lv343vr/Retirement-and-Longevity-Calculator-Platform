import type { MortgageEstimate } from "./estimateMortgage";

export function mortgageCsvFilename(input: { homePrice: number; termYears: number }): string {
  return `can-i-get-a-mortgage-${Math.round(input.homePrice)}-${input.termYears}yr.csv`;
}

export function mortgageScheduleCsv(result: MortgageEstimate): string {
  const header = "Month,Year,Principal,Interest,Extra,PMI,Balance";
  const rows = result.primary.months.map((row) =>
    [
      row.month,
      row.year,
      row.principal.toFixed(2),
      row.interest.toFixed(2),
      row.extra.toFixed(2),
      row.pmi.toFixed(2),
      row.endingBalance.toFixed(2),
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

export function downloadMortgageCsv(result: MortgageEstimate): void {
  const blob = new Blob([mortgageScheduleCsv(result)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = mortgageCsvFilename(result.input);
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function firstHousingBreakdown(result: MortgageEstimate) {
  const row = result.primary.years[0];
  if (!row) {
    return {
      pi: result.primary.monthlyPI,
      tax: 0,
      insurance: 0,
      pmi: 0,
      hoa: 0,
      maintenance: 0,
    };
  }
  return {
    pi: result.primary.monthlyPI,
    tax: row.tax / 12,
    insurance: row.insurance / 12,
    pmi: row.pmi / 12,
    hoa: row.hoa / 12,
    maintenance: row.maintenance / 12,
  };
}

export function moneyGoesRows(result: MortgageEstimate) {
  const years = result.primary.years;
  return [
    { label: "Principal", amount: years.reduce((sum, row) => sum + row.principal + row.extra, 0) },
    { label: "Interest", amount: result.primary.totalInterest },
    { label: "Property tax", amount: years.reduce((sum, row) => sum + row.tax, 0) },
    { label: "Insurance", amount: years.reduce((sum, row) => sum + row.insurance, 0) },
    { label: "HOA", amount: years.reduce((sum, row) => sum + row.hoa, 0) },
    { label: "Upkeep", amount: years.reduce((sum, row) => sum + row.maintenance, 0) },
    { label: "PMI", amount: years.reduce((sum, row) => sum + row.pmi, 0) },
    { label: "Cash to buy (beyond the loan)", amount: result.cashToBuy },
  ].filter((row) => row.amount > 0.5);
}

