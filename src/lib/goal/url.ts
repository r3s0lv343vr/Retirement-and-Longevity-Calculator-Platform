import { GOAL_DEFAULT, type GoalInput } from "./defaults";
import { mergeGoalInput } from "./estimateGoal";

const NUMBER_KEYS: { query: string; field: Exclude<keyof GoalInput, "goalName"> }[] = [
  { query: "ga", field: "goalAmountToday" },
  { query: "yt", field: "yearsToGoal" },
  { query: "gs", field: "goalSavings" },
  { query: "pa", field: "plannedAnnualToGoal" },
  { query: "yi", field: "annualIncome" },
  { query: "ye", field: "annualExpenses" },
  { query: "os", field: "otherSavings" },
  { query: "inf", field: "inflationRate" },
  { query: "gr", field: "goalReturn" },
  { query: "or", field: "otherReturn" },
];

export function goalToSearchParams(input: GoalInput): URLSearchParams {
  const params = new URLSearchParams();
  if (input.goalName) params.set("gn", input.goalName);
  for (const { query, field } of NUMBER_KEYS) {
    params.set(query, String(input[field]));
  }
  return params;
}

export function goalFromSearchParams(params: URLSearchParams): GoalInput | null {
  if (!params.has("gn") && !NUMBER_KEYS.some(({ query }) => params.has(query))) return null;
  const payload: Partial<GoalInput> = {};
  if (params.has("gn")) payload.goalName = params.get("gn") ?? "";
  for (const { query, field } of NUMBER_KEYS) {
    if (!params.has(query)) continue;
    payload[field] = Number(params.get(query));
  }
  return mergeGoalInput({ ...GOAL_DEFAULT, ...payload });
}

export function writeGoalUrl(input: GoalInput): void {
  const next = `?${goalToSearchParams(input).toString()}`;
  window.history.replaceState(window.history.state, "", next);
}

export function readGoalFromLocation(): GoalInput | null {
  return goalFromSearchParams(new URLSearchParams(window.location.search));
}
