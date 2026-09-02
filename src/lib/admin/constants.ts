import { HUB_TITLE } from "@/lib/brand";
import { CALCULATOR_SEO, HUB_CLUSTERS, type CalculatorPath } from "@/lib/seo";

export const VISITOR_COOKIE = "ns_vid";
export const ADMIN_COOKIE = "ns_admin";
export const ADMIN_STORE_COOKIE = "ns_admin_cfg";
export const MIN_PASSWORD_LENGTH = 8;

export const KNOWN_PATHS = ["/", "/longevity", "/need", "/when", "/claim", "/housing", "/child", "/goal"] as const;
export type KnownPath = (typeof KNOWN_PATHS)[number];

export const CALCULATOR_TOOLS = ["longevity", "need", "when", "claim", "housing", "child", "goal"] as const;
export type CalculatorTool = (typeof CALCULATOR_TOOLS)[number];

export const TOOL_LABELS: Record<CalculatorTool, string> = {
  longevity: CALCULATOR_SEO["/longevity"].name,
  need: CALCULATOR_SEO["/need"].name,
  when: CALCULATOR_SEO["/when"].name,
  claim: CALCULATOR_SEO["/claim"].name,
  housing: CALCULATOR_SEO["/housing"].name,
  child: CALCULATOR_SEO["/child"].name,
  goal: CALCULATOR_SEO["/goal"].name,
};

export const PATH_LABELS: Record<string, string> = {
  "/": HUB_TITLE,
  "/longevity": CALCULATOR_SEO["/longevity"].name,
  "/need": CALCULATOR_SEO["/need"].name,
  "/when": CALCULATOR_SEO["/when"].name,
  "/claim": CALCULATOR_SEO["/claim"].name,
  "/housing": CALCULATOR_SEO["/housing"].name,
  "/child": CALCULATOR_SEO["/child"].name,
  "/goal": CALCULATOR_SEO["/goal"].name,
  other: "Other",
};

export function pagesWithCounts(byPath: { path: string; pageviews: number }[]) {
  const counts = new Map(byPath.map((row) => [row.path, row.pageviews]));
  const rows: { path: string; label: string; pageviews: number }[] = KNOWN_PATHS.map((path) => ({
    path,
    label: PATH_LABELS[path],
    pageviews: counts.get(path) ?? 0,
  }));
  const other = counts.get("other") ?? 0;
  if (other > 0) rows.push({ path: "other", label: PATH_LABELS.other, pageviews: other });
  return rows;
}

export function toolsWithCounts(byTool: { tool: CalculatorTool; runs: number }[]) {
  const counts = new Map(byTool.map((row) => [row.tool, row.runs]));
  return CALCULATOR_TOOLS.map((tool) => ({
    tool,
    label: TOOL_LABELS[tool],
    runs: counts.get(tool) ?? 0,
  }));
}

export function clusterPageGroups(byPath: { path: string; pageviews: number }[]) {
  const pages = pagesWithCounts(byPath);
  const byKey = new Map(pages.map((row) => [row.path, row]));
  return [
    {
      id: "hub",
      title: HUB_TITLE,
      note: "Front door. Switcher back to the cluster.",
      rows: [byKey.get("/")!],
    },
    ...HUB_CLUSTERS.map((cluster) => ({
      id: cluster.id,
      title: cluster.title,
      note: cluster.note,
      rows: cluster.paths.map((path: CalculatorPath) => byKey.get(path)!),
    })),
  ];
}

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
