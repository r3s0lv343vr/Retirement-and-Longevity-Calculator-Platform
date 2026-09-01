export const VISITOR_COOKIE = "ns_vid";
export const ADMIN_COOKIE = "ns_admin";
export const MIN_PASSWORD_LENGTH = 8;

export const KNOWN_PATHS = ["/", "/longevity", "/need", "/when", "/claim", "/housing", "/child", "/goal"] as const;
export type KnownPath = (typeof KNOWN_PATHS)[number];

export const CALCULATOR_TOOLS = ["longevity", "need", "when", "claim", "housing", "child", "goal"] as const;
export type CalculatorTool = (typeof CALCULATOR_TOOLS)[number];

export const TOOL_LABELS: Record<CalculatorTool, string> = {
  longevity: "How long",
  need: "How much",
  when: "When",
  claim: "67 vs 70",
  housing: "Housing",
  child: "Child",
  goal: "Goal",
};

export const PATH_LABELS: Record<string, string> = {
  "/": "Hub",
  "/longevity": "How long",
  "/need": "How much",
  "/when": "When",
  "/claim": "67 vs 70",
  "/housing": "Housing",
  "/child": "Child",
  "/goal": "Goal",
  other: "Other",
};

export function utcDay(at: Date | string): string {
  const d = typeof at === "string" ? new Date(at) : at;
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function normalizePath(raw: string): string {
  try {
    const path = raw.split("?")[0].split("#")[0];
    const clean = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
    return (KNOWN_PATHS as readonly string[]).includes(clean) ? clean : "other";
  } catch {
    return "other";
  }
}

export function isCalculatorTool(value: string): value is CalculatorTool {
  return (CALCULATOR_TOOLS as readonly string[]).includes(value);
}
