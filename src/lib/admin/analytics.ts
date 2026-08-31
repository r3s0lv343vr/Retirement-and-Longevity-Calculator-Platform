import { utcDay } from "./constants";
import type { CalculatorTool } from "./constants";

export type AnalyticsEvent =
  | { type: "pageview"; visitorId: string; path: string; at: string }
  | { type: "run"; visitorId: string; tool: CalculatorTool; at: string };

export type DayStats = {
  pageviews: number;
  visitorIds: string[];
  userIds: string[];
  paths: Record<string, number>;
  tools: Record<string, number>;
};

export type AnalyticsState = {
  lifetimePageviews: number;
  visitorFirstSeen: Record<string, string>;
  userFirstSeen: Record<string, string>;
  days: Record<string, DayStats>;
};

export type AnalyticsSnapshot = {
  generatedAt: string;
  persistence: "file" | "redis" | "memory";
  lifetime: { pageviews: number; visitors: number; users: number };
  today: { date: string; pageviews: number; visitors: number; users: number };
  last7: { pageviews: number; visitors: number; users: number };
  last30: { pageviews: number; visitors: number; users: number };
  byPath: { path: string; pageviews: number }[];
  byTool: { tool: CalculatorTool; runs: number }[];
  series: { date: string; pageviews: number; visitors: number; users: number }[];
};

const DAY_KEEP = 90;

export function emptyState(): AnalyticsState {
  return {
    lifetimePageviews: 0,
    visitorFirstSeen: {},
    userFirstSeen: {},
    days: {},
  };
}

function emptyDay(): DayStats {
  return { pageviews: 0, visitorIds: [], userIds: [], paths: {}, tools: {} };
}

function dayOf(state: AnalyticsState, date: string): DayStats {
  if (!state.days[date]) state.days[date] = emptyDay();
  return state.days[date];
}

function remember(list: string[], id: string): void {
  if (!list.includes(id)) list.push(id);
}

export function applyEvent(state: AnalyticsState, event: AnalyticsEvent): AnalyticsState {
  const next: AnalyticsState = {
    lifetimePageviews: state.lifetimePageviews,
    visitorFirstSeen: { ...state.visitorFirstSeen },
    userFirstSeen: { ...state.userFirstSeen },
    days: Object.fromEntries(
      Object.entries(state.days).map(([date, day]) => [
        date,
        {
          pageviews: day.pageviews,
          visitorIds: [...day.visitorIds],
          userIds: [...day.userIds],
          paths: { ...day.paths },
          tools: { ...day.tools },
        },
      ]),
    ),
  };

  const date = utcDay(event.at);
  const bucket = dayOf(next, date);

  if (!next.visitorFirstSeen[event.visitorId]) {
    next.visitorFirstSeen[event.visitorId] = date;
  }
  remember(bucket.visitorIds, event.visitorId);

  if (event.type === "pageview") {
    next.lifetimePageviews += 1;
    bucket.pageviews += 1;
    bucket.paths[event.path] = (bucket.paths[event.path] ?? 0) + 1;
  } else {
    if (!next.userFirstSeen[event.visitorId]) {
      next.userFirstSeen[event.visitorId] = date;
    }
    remember(bucket.userIds, event.visitorId);
    bucket.tools[event.tool] = (bucket.tools[event.tool] ?? 0) + 1;
  }

  pruneDays(next, date);
  return next;
}

function pruneDays(state: AnalyticsState, today: string): void {
  const cutoff = addUtcDays(today, -(DAY_KEEP - 1));
  for (const date of Object.keys(state.days)) {
    if (date < cutoff) delete state.days[date];
  }
}

export function addUtcDays(isoDay: string, delta: number): string {
  const d = new Date(`${isoDay}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function rangeDays(end: string, count: number): string[] {
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    days.push(addUtcDays(end, -i));
  }
  return days;
}

function unionCount(state: AnalyticsState, days: string[], field: "visitorIds" | "userIds"): number {
  const ids = new Set<string>();
  for (const date of days) {
    const bucket = state.days[date];
    if (!bucket) continue;
    for (const id of bucket[field]) ids.add(id);
  }
  return ids.size;
}

function sumPageviews(state: AnalyticsState, days: string[]): number {
  return days.reduce((sum, date) => sum + (state.days[date]?.pageviews ?? 0), 0);
}

export function snapshotFromState(
  state: AnalyticsState,
  persistence: AnalyticsSnapshot["persistence"],
  now = new Date(),
): AnalyticsSnapshot {
  const today = utcDay(now);
  const last7 = rangeDays(today, 7);
  const last30 = rangeDays(today, 30);
  const todayBucket = state.days[today];

  const pathTotals: Record<string, number> = {};
  const toolTotals: Record<string, number> = {};
  for (const day of Object.values(state.days)) {
    for (const [path, count] of Object.entries(day.paths)) {
      pathTotals[path] = (pathTotals[path] ?? 0) + count;
    }
    for (const [tool, count] of Object.entries(day.tools)) {
      toolTotals[tool] = (toolTotals[tool] ?? 0) + count;
    }
  }

  return {
    generatedAt: now.toISOString(),
    persistence,
    lifetime: {
      pageviews: state.lifetimePageviews,
      visitors: Object.keys(state.visitorFirstSeen).length,
      users: Object.keys(state.userFirstSeen).length,
    },
    today: {
      date: today,
      pageviews: todayBucket?.pageviews ?? 0,
      visitors: todayBucket?.visitorIds.length ?? 0,
      users: todayBucket?.userIds.length ?? 0,
    },
    last7: {
      pageviews: sumPageviews(state, last7),
      visitors: unionCount(state, last7, "visitorIds"),
      users: unionCount(state, last7, "userIds"),
    },
    last30: {
      pageviews: sumPageviews(state, last30),
      visitors: unionCount(state, last30, "visitorIds"),
      users: unionCount(state, last30, "userIds"),
    },
    byPath: Object.entries(pathTotals)
      .map(([path, pageviews]) => ({ path, pageviews }))
      .sort((a, b) => b.pageviews - a.pageviews),
    byTool: (Object.entries(toolTotals) as [CalculatorTool, number][])
      .map(([tool, runs]) => ({ tool, runs }))
      .sort((a, b) => b.runs - a.runs),
    series: last30.map((date) => {
      const bucket = state.days[date];
      return {
        date,
        pageviews: bucket?.pageviews ?? 0,
        visitors: bucket?.visitorIds.length ?? 0,
        users: bucket?.userIds.length ?? 0,
      };
    }),
  };
}
