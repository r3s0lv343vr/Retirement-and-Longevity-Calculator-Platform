import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT } from "@/lib/engine";
import {
  decodeScenarioValue,
  encodeScenarioValue,
  hasScenarioParams,
  inputToSearchParams,
  searchParamsToInput,
} from "./scenarioUrl";

describe("scenario URL", () => {
  it("round-trips the default form", () => {
    const params = inputToSearchParams(DEFAULT_INPUT);
    expect(hasScenarioParams(params)).toBe(true);
    expect(searchParamsToInput(params)).toEqual(DEFAULT_INPUT);
  });

  it("writes percents as form-style numbers, not decimals", () => {
    expect(encodeScenarioValue("preRetirementReturn", 0.07)).toBe("7");
    expect(encodeScenarioValue("inflationRate", 0.026)).toBe("2.6");
    expect(decodeScenarioValue("preRetirementReturn", "7")).toBeCloseTo(0.07);
  });

  it("writes pension COLA as on or off", () => {
    expect(encodeScenarioValue("pensionCola", true)).toBe("on");
    expect(encodeScenarioValue("pensionCola", false)).toBe("off");
    expect(decodeScenarioValue("pensionCola", "off")).toBe(false);
  });

  it("fills missing keys from defaults so a short link still works", () => {
    const input = searchParamsToInput("currentAge=41&currentSavings=71000");
    expect(input.currentAge).toBe(41);
    expect(input.currentSavings).toBe(71000);
    expect(input.retirementAge).toBe(DEFAULT_INPUT.retirementAge);
    expect(input.pensionCola).toBe(DEFAULT_INPUT.pensionCola);
  });

  it("ignores an empty query", () => {
    expect(hasScenarioParams("")).toBe(false);
    expect(hasScenarioParams("utm_source=newsletter")).toBe(false);
  });
});
