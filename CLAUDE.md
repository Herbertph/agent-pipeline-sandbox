# agent-pipeline-sandbox

A small task-list web app used as a sandbox for a multi-agent pipeline: requirements analyst → developer → tester → pull request. A human reviews and merges every PR.

## Stack

- Vanilla JavaScript (ES modules), no framework
- Vite for the dev server and build
- Vitest for unit tests
- Playwright for end-to-end tests (Chromium)

## Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Dev server | `npm run dev` (http://localhost:5173) |
| Build | `npm run build` |
| Unit tests | `npm test` |
| End-to-end tests | `npm run test:e2e` (starts the dev server on its own) |
| Everything | `npm run test:all` |

There is no linter or type checker configured. Do not add one unless a spec asks for it.

## Structure

- `src/tasks.js`: pure logic (validation, list operations). No DOM access. Unit tested.
- `src/main.js`: DOM wiring and rendering only. Covered by end-to-end tests.
- `tests/unit/`: Vitest tests, `*.test.js`
- `tests/e2e/`: Playwright tests, `*.spec.js`
- `docs/specs/`: feature specs written by the requirements analyst
- `docs/test-reports/`: test reports written by the tester

## Conventions

- Everything in the repository is written in English: code, comments, docs, commit messages, PR descriptions.
- Keep business logic in pure functions in `src/` and keep `main.js` thin.
- Render user input with `textContent`, never `innerHTML`.
- Prefer accessible markup (labels, roles, `aria-*`). Playwright tests locate elements with `getByRole`, `getByLabel` and `getByText`, not CSS selectors, unless no accessible locator exists.
- Name tests after behavior. Acceptance tests start with their criterion ID, for example `AC-2: rejects a blank title`.
- Commits follow Conventional Commits: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`.
- Feature branches are named `feature/<slug>`, or keep the branch Claude Code created for a worktree session. Never commit to `main`.

## Definition of done

- Every acceptance criterion in the spec is covered by at least one test.
- `npm run build`, `npm test` and `npm run test:e2e` all pass.
- No unrelated changes in the diff.
