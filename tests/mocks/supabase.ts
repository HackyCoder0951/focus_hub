/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from "vitest";

/**
 * A minimal chainable query-builder stand-in: every filter/modifier method
 * returns itself, and the builder resolves to a fixed `{data,error}` (or
 * `{count,error}`) result whether awaited directly or via `.single()`/`.maybeSingle()`.
 */
function createQueryBuilder(result: any) {
  const builder: any = {};
  const chainMethods = [
    "select",
    "insert",
    "update",
    "delete",
    "upsert",
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "like",
    "ilike",
    "in",
    "is",
    "or",
    "order",
    "limit",
    "range",
    "match",
    "filter",
    "contains",
    "returns",
  ];
  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }
  // Real supabase-js keeps the builder chainable (e.g. `.returns<T>()`) even
  // after `.single()`/`.maybeSingle()`, so these return the builder itself
  // (still thenable) rather than a bare Promise.
  builder.single = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(() => builder);
  builder.then = (onFulfilled?: any, onRejected?: any) =>
    Promise.resolve(result).then(onFulfilled, onRejected);
  builder.catch = (onRejected?: any) => Promise.resolve(result).catch(onRejected);
  return builder;
}

/** A `{data, error: null}` (or error) resolving query builder for `.from(table)` chains. */
export function queryResult<T>(data: T, error: unknown = null) {
  return createQueryBuilder({ data, error });
}

/** A `{count, error: null}` resolving query builder for `.select(..., {count, head})` chains. */
export function countResult(count: number, error: unknown = null) {
  return createQueryBuilder({ count, error });
}

export interface SupabaseMockOverrides {
  from?: (table: string) => any;
  storageFrom?: (bucket: string) => any;
  rpc?: ReturnType<typeof vi.fn>;
  auth?: Record<string, unknown>;
  channel?: ReturnType<typeof vi.fn>;
}

/** Builds a fake `supabase` client matching the shape used across `src/features/*\/api`. */
export function createSupabaseMock(overrides: SupabaseMockOverrides = {}) {
  const from = vi.fn((table: string) =>
    overrides.from ? overrides.from(table) : queryResult(null)
  );

  const defaultStorageFrom = vi.fn(() => ({
    upload: vi.fn().mockResolvedValue({ data: { path: "mock/path" }, error: null }),
    getPublicUrl: vi
      .fn()
      .mockReturnValue({ data: { publicUrl: "https://mock.supabase.co/storage/v1/object/public/mock/path" } }),
    remove: vi.fn().mockResolvedValue({ data: null, error: null }),
  }));

  return {
    from,
    storage: { from: overrides.storageFrom ?? defaultStorageFrom },
    rpc: overrides.rpc ?? vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
      refreshSession: vi.fn().mockResolvedValue({ data: {}, error: null }),
      ...overrides.auth,
    },
    channel:
      overrides.channel ??
      vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn((cb?: (status: string) => void) => {
          cb?.("SUBSCRIBED");
          return { unsubscribe: vi.fn() };
        }),
      })),
    removeChannel: vi.fn(),
  };
}
