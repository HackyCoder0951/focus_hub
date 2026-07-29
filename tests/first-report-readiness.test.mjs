import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { test } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readProjectFile(path) {
  return readFileSync(resolve(root, path), "utf8");
}

test("package exposes first-report quality check scripts", () => {
  const pkg = JSON.parse(readProjectFile("package.json"));

  assert.equal(pkg.scripts.typecheck, "tsc --noEmit");
  assert.equal(pkg.scripts.lint, "eslint .");
  assert.equal(pkg.scripts.test, "vitest run");
  assert.equal(pkg.scripts.precommit, "npm run check");
  assert.match(pkg.scripts.check, /typecheck/);
  assert.match(pkg.scripts.check, /lint/);
  assert.match(pkg.scripts.check, /npm test/);
});

test("API contract baseline documents key frontend and server contracts", () => {
  const path = "docs/implementation/14_API_CONTRACTS.md";
  assert.equal(existsSync(resolve(root, path)), true);

  const doc = readProjectFile(path);
  for (const expected of [
    "Feed",
    "Q&A Questions",
    "AI Answers",
    "Chat",
    "Resources",
    "Admin",
    "GET /api/health",
    "POST /api/ai-answers/generate",
    "PATCH /api/ai-answers/:id/feedback",
  ]) {
    assert.match(doc, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("security classification documents sensitive data and recovery checklist", () => {
  const path = "docs/implementation/15_SECURITY_DATA_CLASSIFICATION.md";
  assert.equal(existsSync(resolve(root, path)), true);

  const doc = readProjectFile(path);
  for (const expected of [
    "Authentication data",
    "Chat content",
    "Resource files",
    "Backup and Restore Plan",
    "Integration-Day Checklist",
    "Run `npm run typecheck`",
    "Run `npm test`",
  ]) {
    assert.match(doc, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
