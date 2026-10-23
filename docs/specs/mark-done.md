# Mark a task as done

## Context
Users of the task list can add tasks but cannot record that they finished one. This feature lets a user mark any task as done and undo that, so the list shows what is still open. Done tasks stay in the list and their title is shown with a strikethrough.

Original request (verbatim): "let users mark a task as done and undo it; done tasks show with a strikethrough"

## Scope
### In scope
- A per-task control to mark a task as done and to mark it as not done again (toggle).
- Visual strikethrough of the title of done tasks.
- Exposing the done state to assistive technology.
- A pure, unit-tested function for toggling a task's done state.
- New tasks start as not done.

### Out of scope
- Persistence across page reloads (the app is in-memory only today; that stays unchanged).
- Deleting, editing, reordering, filtering or sorting tasks (for example "hide done tasks" or "move done tasks to the bottom").
- Changing the task count text (it keeps counting all tasks, done or not).
- Bulk actions ("mark all as done", "clear completed").
- Timestamps or history of when a task was completed.
- Animations or transitions.

## Functional requirements
- FR-1: Every task has a `done` state that is a boolean. A newly added task has `done: false`.
- FR-2: Each rendered task has a checkbox control whose accessible name is exactly the task title. Checking it marks that task as done; unchecking it marks it as not done.
- FR-3: The title of a done task is rendered with a line-through text decoration. The title of a not-done task has no line-through.
- FR-4: Toggling affects only the task it belongs to, identified by task id (not by title). Other tasks keep their state, title and position.
- FR-5: Toggling does not change the order of tasks, the task count text, the empty state, the new-task input value or any validation error currently shown.
- FR-6: The control is fully operable by keyboard (Tab to reach it, Space to toggle), and focus stays on the same task's checkbox after toggling.
- FR-7: `src/tasks.js` exports a pure function `toggleTask(tasks, id)` that returns a new list in which the task with the given id has its `done` value inverted. It never mutates the input list or its task objects. If no task has the given id, it returns the input list unchanged (same reference).
- FR-8: Task titles continue to be rendered with `textContent`, never `innerHTML`, including inside the new checkbox label.

## Acceptance criteria
- AC-1 (FR-1, FR-2): Given the user adds the task "Buy milk", when the list renders, then a checkbox with accessible name "Buy milk" is visible and is not checked.
- AC-2 (FR-2, FR-3): Given a not-done task "Buy milk", when the user clicks its checkbox, then the checkbox is checked and the "Buy milk" title has computed `text-decoration-line` equal to `line-through`.
- AC-3 (FR-2, FR-3): Given a done task "Buy milk", when the user clicks its checkbox again, then the checkbox is not checked and the "Buy milk" title has computed `text-decoration-line` equal to `none`.
- AC-4 (FR-2): Given a not-done task "Buy milk", when the user clicks the title text "Buy milk" (the label, not the checkbox box itself), then the task becomes done (checkbox checked, title struck through).
- AC-5 (FR-4): Given tasks "First", "Second" and "Third", all not done, when the user marks "Second" as done, then only the "Second" checkbox is checked and only "Second" is struck through; "First" and "Third" are unchecked and not struck through.
- AC-6 (FR-4): Given two tasks that both have the title "Same", when the user checks the first one, then the first "Same" checkbox is checked and the second "Same" checkbox remains unchecked.
- AC-7 (FR-5): Given tasks "First", "Second" and "Third", when the user marks "First" as done, then the list items are still in the order "First", "Second", "Third" and the count text is still "3 tasks".
- AC-8 (FR-1, FR-5): Given task "First" is done, when the user adds a new task "Fourth", then "Fourth" appears last, is unchecked and not struck through, and "First" is still checked and struck through.
- AC-9 (FR-5): Given the error "Task title is required." is displayed and the input contains "draft", when the user toggles an existing task's checkbox, then the error text and the input value "draft" are unchanged.
- AC-10 (FR-6): Given a task "Buy milk" whose checkbox has keyboard focus, when the user presses Space, then the task becomes done and the "Buy milk" checkbox still has focus; when the user presses Space again, the task becomes not done and the checkbox still has focus.
- AC-11 (FR-8): Given the user adds a task titled `<img src=x onerror="window.__xss = true">` and marks it as done, then the title is shown as that literal text, no `img` element exists inside the task list, and `window.__xss` is undefined.
- AC-12 (FR-7): Given `tasks = [{ id: 'a', title: 'A', done: false }, { id: 'b', title: 'B', done: false }]`, when calling `toggleTask(tasks, 'b')`, then the result equals `[{ id: 'a', title: 'A', done: false }, { id: 'b', title: 'B', done: true }]`.
- AC-13 (FR-7): Given `tasks = [{ id: 'a', title: 'A', done: true }]`, when calling `toggleTask(tasks, 'a')`, then the result equals `[{ id: 'a', title: 'A', done: false }]`.
- AC-14 (FR-7): Given any task list, when calling `toggleTask`, then neither the input array nor any of its task objects is mutated (deep-equal to a snapshot taken before the call).
- AC-15 (FR-7): Given `tasks = [{ id: 'a', title: 'A', done: false }]`, when calling `toggleTask(tasks, 'missing')`, then the returned value is the same array reference as `tasks` (`toBe`).
- AC-16 (FR-7): Given an empty list `[]`, when calling `toggleTask([], 'a')`, then it returns that same empty array without throwing.
- AC-17 (FR-1): Given any valid title, when calling `addTask([], 'Task', { createId: () => 'id-1' })`, then the result's `tasks` equals `[{ id: 'id-1', title: 'Task', done: false }]`.

## Non-functional requirements
- Accessibility: the done state is conveyed by the native checked state of an `<input type="checkbox">` (exposed as role `checkbox`), not by strikethrough alone. Each checkbox is labelled by its task title so Playwright can locate it with `getByRole('checkbox', { name: '<title>' })`.
- Regression: all existing unit and end-to-end tests keep passing. The existing e2e assertions that list items have exactly the title as their text (for example `toHaveText(['Buy milk'])`) must still hold, so the task row must not add extra visible text.

## Assumptions
- The toggle control is a native checkbox placed before the title, with the title as its label. The request did not name a control type; a checkbox is the conventional, accessible choice.
- "Undo" means unchecking the same checkbox. No separate undo button or toast is added.
- Done tasks stay in place in the list; they are not moved, hidden or dimmed beyond the strikethrough. Optional muted color is allowed but not required or tested.
- The task count keeps counting all tasks (done and not done). Showing "N remaining" is not part of this request.
- Done state is in-memory only, like tasks themselves, and is lost on reload.
- Strikethrough applies to the title text only, not the checkbox or the whole row.

## Open questions
- [non-blocking] Should the count change to show remaining (not done) tasks, for example "2 of 3 tasks left"? Assumed no; current text is kept.
- [non-blocking] Should done tasks be visually muted (grey text) in addition to the strikethrough? Assumed optional, not tested.

## Technical notes
- `src/tasks.js`: extend `addTask` to create tasks as `{ id, title, done: false }` and update its JSDoc types. Add and export `toggleTask(tasks, id)` following the same immutable style as `addTask` (return a new array with `map`, return the input unchanged when the id is not found).
- `tests/unit/tasks.test.js`: the existing test "appends a task to the end of the list" uses `toEqual` with objects lacking `done`; the new task in that expectation will need `done: false` (the pre-existing `id-0` fixture object is passed through unchanged). This is a required, related change, not an unrelated one. Add `toggleTask` tests for AC-12 to AC-16 and an `addTask` test for AC-17.
- `src/main.js`: in `render()`, build each `<li>` as `<label><input type="checkbox"><span>title</span></label>` (or equivalent), setting the title via `textContent` and `checkbox.checked = task.done`. Handle `change` events (a single delegated listener on `#task-list` is fine; store the task id in a `data-id` attribute) by calling `toggleTask` and re-rendering.
- Focus (AC-10): `render()` currently rebuilds every list item with `replaceChildren`, which destroys the focused checkbox. After re-rendering on toggle, restore focus to the checkbox with the same task id (or update the existing row in place instead of re-rendering). This is the most likely place for a bug.
- `src/style.css`: add a rule such as a `.done` class on the title span (or `input:checked + span`) with `text-decoration: line-through`. The e2e tests check `text-decoration-line` via `toHaveCSS` on the title element, so the decoration must be on the element containing the title text, located with `getByText('<title>', { exact: true })`.
- `index.html`: no change expected.
- `tests/e2e/tasks.spec.js`: add tests named `AC-n: ...` per project convention, locating controls with `getByRole('checkbox', { name })`. AC-6 can use `.nth(0)` / `.nth(1)` on the duplicate-name checkboxes. AC-11 may reuse the existing `#task-list img` locator because no accessible locator exists for the negative check.
