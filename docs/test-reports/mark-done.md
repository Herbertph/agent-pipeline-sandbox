# Test report: mark-done

- **Spec:** `docs/specs/mark-done.md`
- **Branch:** `worktree-mark-done`
- **Date:** 2026-10-23
- **Verdict:** PASS

## Summary

Every acceptance criterion (AC-1 to AC-17) has at least one passing test. The build, the unit suite and the end-to-end suite all pass. I found no bugs, no flaky tests and no spec issues.

The developer's tests already covered every AC. QA added stronger checks in separate files:

- `tests/unit/toggleTask.acceptance.test.js` (10 tests)
- `tests/e2e/mark-done.acceptance.spec.js` (10 tests)

These files add:

- AC-10: focus checks with several tasks and with duplicate titles. The developer's test used one task, so it could not show that focus returns to the *same* task's checkbox.
- AC-14: checks over several list shapes, using deep-frozen input.
- Checks for:
  - id-based toggling with duplicate titles
  - un-toggling by clicking the label
  - aria-invalid staying in place
  - the exact list-item text (the NFR regression)
  - the strikethrough being on the title only
  - rapid repeated toggling

## Commands run

| Command | Result |
|---------|--------|
| `npm run build` | pass |
| `npm test` | 31 / 31 passed (2 files) |
| `npm run test:e2e` | 29 / 29 passed (Chromium) |
| `npx playwright test --repeat-each=3` | 87 / 87 passed (stability check) |

**Totals:** 60 tests: 60 passed, 0 failed, 0 flaky.

There is no linter or type checker in this project, as `CLAUDE.md` states.

## Traceability

| AC | Test(s) | Result |
|----|---------|--------|
| AC-1 | e2e `AC-1: a new task has an unchecked checkbox named after its title`; e2e `AC-1: the list item text is exactly the title (no extra visible text)` | PASS |
| AC-2 | e2e `AC-2: checking the checkbox marks the task done with a strikethrough` | PASS |
| AC-3 | e2e `AC-3: unchecking a done task removes the strikethrough`; e2e `AC-3: clicking the title of a done task makes it not done again` | PASS |
| AC-4 | e2e `AC-4: clicking the title text toggles the task` | PASS |
| AC-5 | e2e `AC-5: toggling one task leaves the others unchanged` | PASS |
| AC-6 | e2e `AC-6: tasks with the same title are toggled independently`; e2e `AC-6: only the first of two same-titled tasks is struck through` | PASS |
| AC-7 | e2e `AC-7: toggling keeps the order and the count`; e2e `AC-7: toggling keeps the order, the count and the hidden empty state` | PASS |
| AC-8 | e2e `AC-8: a task added after toggling starts not done` | PASS |
| AC-9 | e2e `AC-9: toggling keeps the error and the input value`; e2e `AC-9: toggling twice keeps the error, aria-invalid and the draft input` | PASS |
| AC-10 | e2e `AC-10: Space toggles the focused checkbox and focus stays on it`; e2e `AC-10: focus returns to the toggled task, not another one, in a multi-task list`; e2e `AC-10: focus stays on the same duplicate-titled checkbox after Space` | PASS |
| AC-11 | e2e `AC-11: a done task with HTML in its title is rendered as plain text`; e2e `AC-11: the done task shows the literal title as its only text` | PASS |
| AC-12 | unit `AC-12: marks only the task with the given id as done`; unit `AC-12: returns a new array and a new object for the toggled task only`; unit `AC-12: toggles by id, not by title, when titles are duplicated` | PASS |
| AC-13 | unit `AC-13: marks a done task as not done`; unit `AC-13: toggling twice returns to the original done value` | PASS |
| AC-14 | unit `AC-14: does not mutate the input list or its tasks`; unit `AC-14: does not mutate the input for %s (deep-frozen input, snapshot compare)` x4 | PASS |
| AC-15 | unit `AC-15: returns the same list when no task has the id`; unit `AC-15: returns the same reference for a missing id in a multi-task list` | PASS |
| AC-16 | unit `AC-16: returns the same empty list without throwing`; unit `AC-16: returns the same empty array reference without throwing` | PASS |
| AC-17 | unit `AC-17: creates new tasks as not done`; unit `AC-17: addTask creates a task whose done value is the boolean false` | PASS |

## Exploratory testing

- Rapid repeated toggling (5 clicks) leaves the checkbox and strikethrough in the expected state, with no duplicate rows. Pass.
- The strikethrough is on the title span only; the `<li>` row has `text-decoration-line: none`. Pass.
- Toggling does not hide the empty state or change the task count. Pass.
- Code review: titles are set with `textContent`, and the task id is stored in `data-id`, also through `dataset`. No `innerHTML` is used.

## Bugs

None.

## Flaky tests

None. All 87 runs passed with `--repeat-each=3`.

## Spec issues

None. Every AC was clear and testable.

One small note: AC-14 says "given any task list". I read that as a representative set of lists: matching id, missing id, empty list and a done task.
