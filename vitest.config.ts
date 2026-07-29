import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    env: {
      // Dummy values so `src/integrations/supabase/client.ts` doesn't throw at
      // import time. Tests must not depend on these being real credentials —
      // they exist purely so importing feature `api/*`/`hooks/*` modules
      // doesn't crash in environments (like CI) with no real `.env`.
      VITE_SUPABASE_URL: "https://mock.supabase.co",
      VITE_SUPABASE_ANON_KEY: "mock-anon-key",
      // Same reasoning for the server-side singletons (server/supabaseClient.js,
      // server/requireAuth.js) exercised by Supertest-based backend tests.
      SUPABASE_URL: "https://mock.supabase.co",
      SUPABASE_ANON_KEY: "mock-anon-key",
      SUPABASE_JWT_SECRET: "test-jwt-secret-not-for-production",
    },
  },
});
