import { DEFAULT_INPUT, FIELD_META, mergeInput } from "@/lib/engine";
import type { CalculatorInput, CalculatorPayload } from "@/lib/engine";

const FIELD_KEYS = Object.keys(FIELD_META) as (keyof CalculatorInput)[];

export function hasScenarioParams(search: string | URLSearchParams): boolean {
  const params = typeof search === "string" ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search) : search;
  return FIELD_KEYS.some((key) => params.has(key));
}

export function encodeScenarioValue(key: keyof CalculatorInput, value: CalculatorInput[keyof CalculatorInput]): string {
  const kind = FIELD_META[key].kind;
  if (kind === "toggle") return value ? "on" : "off";
  if (kind === "percent") return trimNumber(Number(value) * 100);
  if (kind === "multiplier") return trimNumber(Number(value));
  return trimNumber(Number(value));
}

export function decodeScenarioValue(key: keyof CalculatorInput, raw: string): CalculatorInput[keyof CalculatorInput] {
  const kind = FIELD_META[key].kind;
  if (kind === "toggle") {
    const s = raw.trim().toLowerCase();
    return ["true", "1", "yes", "on"].includes(s);
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_INPUT[key];
  if (kind === "percent") return Math.round((n / 100) * 1_000_000) / 1_000_000;
  return n;
}

export function inputToSearchParams(input: CalculatorInput): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of FIELD_KEYS) {
    params.set(key, encodeScenarioValue(key, input[key]));
  }
  return params;
}

export function searchParamsToInput(search: string | URLSearchParams): CalculatorInput {
  const params = typeof search === "string" ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search) : search;
  const payload: CalculatorPayload = {};
  for (const key of FIELD_KEYS) {
    const raw = params.get(key);
    if (raw == null || raw === "") continue;
    (payload[key] as CalculatorInput[typeof key]) = decodeScenarioValue(key, raw) as CalculatorInput[typeof key];
  }
  return mergeInput(payload);
}

export function writeScenarioUrl(input: CalculatorInput): void {
  if (typeof window === "undefined") return;
  const next = `${window.location.pathname}?${inputToSearchParams(input).toString()}${window.location.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next === current) return;
  window.history.replaceState(null, "", next);
}

export function readScenarioFromLocation(): CalculatorInput | null {
  if (typeof window === "undefined") return null;
  if (!hasScenarioParams(window.location.search)) return null;
  return searchParamsToInput(window.location.search);
}

function trimNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(6)));
}
