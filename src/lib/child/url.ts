import { CHILD_DEFAULT, type ChildInput } from "./defaults";
import { mergeChildInput } from "./estimateChild";

const KEYS: { query: string; field: keyof ChildInput }[] = [
  { query: "ca", field: "childAge" },
  { query: "ss", field: "schoolStartAge" },
  { query: "sc", field: "schoolAnnualToday" },
  { query: "ex", field: "extraAnnualToday" },
  { query: "rs", field: "raisingSavings" },
  { query: "ra", field: "raisingAnnualSave" },
  { query: "us", field: "universityStartAge" },
  { query: "uy", field: "universityYears" },
  { query: "uc", field: "universityAnnualToday" },
  { query: "uv", field: "universitySavings" },
  { query: "ua", field: "universityAnnualSave" },
  { query: "inf", field: "inflationRate" },
  { query: "ret", field: "returnRate" },
];

export function childToSearchParams(input: ChildInput): URLSearchParams {
  const params = new URLSearchParams();
  for (const { query, field } of KEYS) {
    params.set(query, String(input[field]));
  }
  return params;
}

export function childFromSearchParams(params: URLSearchParams): ChildInput | null {
  if (!KEYS.some(({ query }) => params.has(query))) return null;
  const payload: Partial<ChildInput> = {};
  for (const { query, field } of KEYS) {
    if (!params.has(query)) continue;
    payload[field] = Number(params.get(query));
  }
  return mergeChildInput({ ...CHILD_DEFAULT, ...payload });
}

export function writeChildUrl(input: ChildInput): void {
  const next = `?${childToSearchParams(input).toString()}`;
  window.history.replaceState(window.history.state, "", next);
}

export function readChildFromLocation(): ChildInput | null {
  return childFromSearchParams(new URLSearchParams(window.location.search));
}
