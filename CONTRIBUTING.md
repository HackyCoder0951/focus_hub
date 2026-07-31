# Contributing to Focus Hub

Thanks for your interest in contributing! Focus Hub is MIT-licensed and open to contributions — bug reports, fixes, features, docs, and tests are all welcome.

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your own Supabase/Groq credentials (see `docs/AI_INTEGRATION_SETUP.md` and `docs/GROQ_AI_INTEGRATION_SETUP.md`).
4. Start the dev server and, in a second terminal, the API server:
   ```bash
   npm run dev      # frontend, http://localhost:5173
   npm run server   # backend, http://localhost:8080
   ```

## Making changes

1. Create a branch off `main` for your change: `git checkout -b fix/short-description`.
2. Keep changes focused — one bug fix or feature per pull request.
3. Match the existing code style (TypeScript, feature-sliced structure under `src/features/`, Tailwind for styling). There's no separate formatter config beyond ESLint; run the linter before committing.
4. Add or update tests for any behavior you change (see `docs/project_report/Test_Traceability_Matrix.md` for current coverage and gaps). Unit/component tests live under `tests/`, E2E specs under `cypress/e2e/`.

## Before opening a pull request

Run the full check locally — this is the same thing CI runs:

```bash
npm run check   # typecheck + lint + unit tests
```

For changes touching user-facing flows, also run the relevant Cypress spec(s):

```bash
npm run dev
npx cypress run --config baseUrl=http://localhost:5173 --spec "cypress/e2e/<your-spec>.cy.js"
```

## Pull requests

- Describe **what** changed and **why**, not just what files were touched.
- Link any related issue.
- Keep the PR scoped — unrelated cleanups belong in a separate PR.
- Be responsive to review feedback; small, iterative fixes are easier to review than one large rewrite.

## Reporting bugs

Open a GitHub issue with:
- Steps to reproduce
- What you expected vs. what happened
- Browser/OS if relevant, and any console/network errors

## Code of conduct

Be respectful and constructive. Disagreements about code are fine; personal attacks aren't. Maintainers may close issues/PRs that don't follow this.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
