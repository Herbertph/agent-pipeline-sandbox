import { describe, expect, it } from 'vitest';
import { addTask, toggleTask } from '../../src/tasks.js';

// Additional acceptance tests for docs/specs/mark-done.md (FR-1, FR-7), written by QA.

function deepFreeze(tasks) {
  tasks.forEach((task) => Object.freeze(task));
  return Object.freeze(tasks);
}

describe('toggleTask (QA acceptance)', () => {
  it('AC-12: returns a new array and a new object for the toggled task only', () => {
    const tasks = [
      { id: 'a', title: 'A', done: false },
      { id: 'b', title: 'B', done: false },
    ];
    const result = toggleTask(tasks, 'b');
    expect(result).toEqual([
      { id: 'a', title: 'A', done: false },
      { id: 'b', title: 'B', done: true },
    ]);
    expect(result).not.toBe(tasks);
    expect(result[1]).not.toBe(tasks[1]);
  });

  it('AC-12: toggles by id, not by title, when titles are duplicated', () => {
    const tasks = [
      { id: 'a', title: 'Same', done: false },
      { id: 'b', title: 'Same', done: false },
    ];
    expect(toggleTask(tasks, 'a')).toEqual([
      { id: 'a', title: 'Same', done: true },
      { id: 'b', title: 'Same', done: false },
    ]);
  });

  it('AC-13: toggling twice returns to the original done value', () => {
    const tasks = [{ id: 'a', title: 'A', done: true }];
    expect(toggleTask(toggleTask(tasks, 'a'), 'a')).toEqual(tasks);
  });

  it.each([
    ['a matching id in a mixed list', [{ id: 'a', title: 'A', done: false }, { id: 'b', title: 'B', done: true }], 'b'],
    ['a missing id', [{ id: 'a', title: 'A', done: false }], 'missing'],
    ['an empty list', [], 'a'],
    ['a single done task', [{ id: 'a', title: 'A', done: true }], 'a'],
  ])('AC-14: does not mutate the input for %s (deep-frozen input, snapshot compare)', (_label, tasks, id) => {
    const snapshot = structuredClone(tasks);
    const frozen = deepFreeze(tasks);
    // Frozen objects make any mutation attempt throw in ES module strict mode.
    expect(() => toggleTask(frozen, id)).not.toThrow();
    expect(frozen).toEqual(snapshot);
  });

  it('AC-15: returns the same reference for a missing id in a multi-task list', () => {
    const tasks = [
      { id: 'a', title: 'A', done: false },
      { id: 'b', title: 'B', done: true },
    ];
    expect(toggleTask(tasks, 'missing')).toBe(tasks);
  });

  it('AC-16: returns the same empty array reference without throwing', () => {
    const tasks = [];
    let result;
    expect(() => {
      result = toggleTask(tasks, 'a');
    }).not.toThrow();
    expect(result).toBe(tasks);
    expect(result).toEqual([]);
  });

  it('AC-17: addTask creates a task whose done value is the boolean false', () => {
    const { tasks } = addTask([], 'Task', { createId: () => 'id-1' });
    expect(tasks).toEqual([{ id: 'id-1', title: 'Task', done: false }]);
    expect(tasks[0].done).toBe(false);
  });
});
