import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";

/** Tables the admin dashboard counts rows for. */
type CountedTable = "profiles" | "posts" | "chat_messages" | "filemodels";

interface DateRange {
  start: string;
  end: string;
}

/** One dashboard metric: overall total plus current/previous month for the delta. */
export interface StatDelta {
  total: number;
  currentMonth: number;
  previousMonth: number;
  /** Percent change of currentMonth vs previousMonth (rounded). */
  change: number;
}

export interface AdminStats {
  users: StatDelta;
  posts: StatDelta;
  messages: StatDelta;
  files: StatDelta;
}

function getMonthRange(offset = 0): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

/** Percent change, matching the original dashboard math. */
function percent(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

async function countRows(table: CountedTable, range?: DateRange): Promise<number> {
  // All counted tables share `id` and `created_at`; the cast keeps the
  // builder typed without resorting to `any`.
  let query = supabase
    .from(table as "profiles")
    .select("id", { count: "exact", head: true });
  if (range) {
    query = query.gte("created_at", range.start).lt("created_at", range.end);
  }
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const curr = getMonthRange(0);
  const prev = getMonthRange(-1);

  const [
    userTotal,
    postTotal,
    msgTotal,
    fileTotal,
    userCurr,
    userPrev,
    postCurr,
    postPrev,
    msgCurr,
    msgPrev,
    fileCurr,
    filePrev,
  ] = await Promise.all([
    countRows("profiles"),
    countRows("posts"),
    countRows("chat_messages"),
    countRows("filemodels"),
    countRows("profiles", curr),
    countRows("profiles", prev),
    countRows("posts", curr),
    countRows("posts", prev),
    countRows("chat_messages", curr),
    countRows("chat_messages", prev),
    countRows("filemodels", curr),
    countRows("filemodels", prev),
  ]);

  const stat = (total: number, currentMonth: number, previousMonth: number): StatDelta => ({
    total,
    currentMonth,
    previousMonth,
    change: percent(currentMonth, previousMonth),
  });

  return {
    users: stat(userTotal, userCurr, userPrev),
    posts: stat(postTotal, postCurr, postPrev),
    messages: stat(msgTotal, msgCurr, msgPrev),
    files: stat(fileTotal, fileCurr, filePrev),
  };
}

/** One month bucket for the analytics charts. */
export interface AnalyticsPoint {
  month: string;
  users: number;
  posts: number;
  files: number;
}

const MONTHS_SHOWN = 6;

/**
 * Fetches creation dates for profiles/posts/filemodels over the last
 * 6 months (created_at only) and buckets them per month client-side.
 */
export async function fetchAdminAnalytics(): Promise<AnalyticsPoint[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (MONTHS_SHOWN - 1), 1);
  const startIso = start.toISOString();

  const fetchDates = (table: "profiles" | "posts" | "filemodels") =>
    unwrap(
      supabase
        .from(table as "profiles")
        .select("created_at")
        .gte("created_at", startIso)
    );

  const [profileRows, postRows, fileRows] = await Promise.all([
    fetchDates("profiles"),
    fetchDates("posts"),
    fetchDates("filemodels"),
  ]);

  const bucketKeys: string[] = [];
  const buckets: AnalyticsPoint[] = [];
  for (let i = MONTHS_SHOWN - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    bucketKeys.push(`${d.getFullYear()}-${d.getMonth()}`);
    buckets.push({
      month: d.toLocaleString("en-US", { month: "short" }),
      users: 0,
      posts: 0,
      files: 0,
    });
  }

  const tally = (rows: { created_at: string }[], field: "users" | "posts" | "files") => {
    for (const row of rows ?? []) {
      const d = new Date(row.created_at);
      const idx = bucketKeys.indexOf(`${d.getFullYear()}-${d.getMonth()}`);
      if (idx >= 0) buckets[idx][field] += 1;
    }
  };

  tally(profileRows, "users");
  tally(postRows, "posts");
  tally(fileRows, "files");

  return buckets;
}
