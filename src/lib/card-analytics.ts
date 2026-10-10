/**
 * Anonymous card insights — stored locally for the card owner.
 * Public viewers only increment a counter; no identity is stored.
 * Respects Settings → insightsEnabled.
 */

import { readSettings } from "./app-settings";

export type DayBucket = { day: string; views: number; shares: number; saves: number };

export type CardInsights = {
  days: Record<string, { views: number; shares: number; saves: number }>;
  totalViews: number;
  totalShares: number;
  totalSaves: number;
};

const KEY = "cc.insights.v1";

function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function readAll(): Record<string, CardInsights> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, CardInsights>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, CardInsights>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function empty(): CardInsights {
  return { days: {}, totalViews: 0, totalShares: 0, totalSaves: 0 };
}

export function getInsights(cardKey: string): CardInsights {
  return readAll()[cardKey] || empty();
}

function bump(cardKey: string, field: "views" | "shares" | "saves") {
  if (typeof window === "undefined" || !cardKey) return;
  try {
    if (!readSettings().insightsEnabled) return;
  } catch {
    // ignore
  }
  const all = readAll();
  const row = all[cardKey] || empty();
  const day = todayKey();
  const bucket = row.days[day] || { views: 0, shares: 0, saves: 0 };
  bucket[field] += 1;
  row.days[day] = bucket;
  if (field === "views") row.totalViews += 1;
  if (field === "shares") row.totalShares += 1;
  if (field === "saves") row.totalSaves += 1;
  all[cardKey] = row;
  writeAll(all);
}

export function recordView(cardKey: string) {
  if (typeof window === "undefined") return;
  const flag = `cc.viewed.${cardKey}`;
  const last = sessionStorage.getItem(flag);
  const now = Date.now();
  if (last && now - Number(last) < 60 * 60 * 1000) return;
  sessionStorage.setItem(flag, String(now));
  bump(cardKey, "views");
}

export function recordShare(cardKey: string) {
  bump(cardKey, "shares");
}

export function recordSave(cardKey: string) {
  bump(cardKey, "saves");
}

function sumRange(ins: CardInsights, daysBack: number) {
  let views = 0;
  let shares = 0;
  let saves = 0;
  const start = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  for (const [day, b] of Object.entries(ins.days)) {
    if (new Date(day + "T12:00:00Z").getTime() >= start) {
      views += b.views;
      shares += b.shares;
      saves += b.saves;
    }
  }
  return { views, shares, saves };
}

export function insightsSummary(cardKey: string) {
  const ins = getInsights(cardKey);
  return {
    today: sumRange(ins, 1),
    week: sumRange(ins, 7),
    month: sumRange(ins, 30),
    allTime: {
      views: ins.totalViews,
      shares: ins.totalShares,
      saves: ins.totalSaves,
    },
    recentDays: Object.entries(ins.days)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .slice(0, 14)
      .map(([day, b]) => ({ day, ...b })),
  };
}
