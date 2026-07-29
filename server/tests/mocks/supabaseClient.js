import { vi } from "vitest";

function createQueryBuilder(result) {
  const builder = {};
  const chainMethods = [
    "select",
    "insert",
    "update",
    "delete",
    "upsert",
    "eq",
    "neq",
    "order",
    "limit",
    "range",
  ];
  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }
  builder.single = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(() => builder);
  builder.then = (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected);
  return builder;
}

export function queryResult(data, error = null) {
  return createQueryBuilder({ data, error });
}

/** Builds a fake server-side `supabase` client matching `server/supabaseClient.js`'s shape. */
export function createServerSupabaseMock(overrides = {}) {
  return {
    from: vi.fn((table) => (overrides.from ? overrides.from(table) : queryResult(null))),
  };
}
