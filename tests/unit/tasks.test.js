import { describe, expect, it } from 'vitest';
import { addTask, formatTaskCount, MAX_TITLE_LENGTH, toggleTask, validateTitle } from '../../src/tasks.js';

describe('validateTitle', () => {
  it('trims surrounding whitespace', () => {
    expect(validateTitle('  Buy milk  ')).toEqual({ ok: true, title: 'Buy milk' });
  });

  it.each([
    ['an empty string', ''],
    ['whitespace only', '   \t '],
    ['undefined', undefined],
    ['null', null],
  ])('rejects %s', (_label, value) => {
    expect(validateTitle(value)).toEqual({ ok: false, error: 'Task title is required.' });
  });

  it(`accepts exactly ${MAX_TITLE_LENGTH} characters (upper boundary)`, () => {
    const title = 'a'.repeat(MAX_TITLE_LENGTH);
    expect(validateTitle(title)).toEqual({ ok: true, title });
  });

  it(`rejects ${MAX_TITLE_LENGTH + 1} characters (just over the boundary)`, () => {
    const result = validateTitle('a'.repeat(MAX_TITLE_LENGTH + 1));
    expect(result.ok).toBe(false);
    expect(result.error).toBe(`Task title must be ${MAX_TITLE_LENGTH} characters or fewer.`);
  });

  it('measures length after trimming', () => {
    const title = 'a'.repeat(MAX_TITLE_LENGTH);
    expect(validateTitle(`  ${title}  `)).toEqual({ ok: true, title });
  });
});

describe('addTask', () => {
  const fixedId = () => 'id-1';

  it('appends a task to the end of the list', () => {
    const existing = [{ id: 'id-0', title: 'First' }];
    const result = addTask(existing, 'Second', { createId: fixedId });
    expect(result.error).toBeNull();
    expect(result.tasks).toEqual([
      { id: 'id-0', title: 'First' },
      { id: 'id-1', title: 'Second', done: false },
    ]);
  });

  it('AC-17: creates new tasks as not done', () => {
    expect(addTask([], 'Task', { createId: fixedId }).tasks).toEqual([{ id: 'id-1', title: 'Task', done: false }]);
  });

  it('does not mutate the original list', () => {
    const existing = [];
    addTask(existing, 'Task', { createId: fixedId });
    expect(existing).toEqual([]);
  });

  it('returns the same list and an error for an invalid title', () => {
    const existing = [{ id: 'id-0', title: 'First' }];
    const result = addTask(existing, '   ', { createId: fixedId });
    expect(result.tasks).toBe(existing);
    expect(result.error).toBe('Task title is required.');
  });

  it('gives each task a unique id by default', () => {
    const first = addTask([], 'A');
    const second = addTask(first.tasks, 'B');
    const [a, b] = second.tasks;
    expect(a.id).not.toBe(b.id);
  });
});

describe('toggleTask', () => {
  it('AC-12: marks only the task with the given id as done', () => {
    const tasks = [
      { id: 'a', title: 'A', done: false },
      { id: 'b', title: 'B', done: false },
    ];
    expect(toggleTask(tasks, 'b')).toEqual([
      { id: 'a', title: 'A', done: false },
      { id: 'b', title: 'B', done: true },
    ]);
  });

  it('AC-13: marks a done task as not done', () => {
    const tasks = [{ id: 'a', title: 'A', done: true }];
    expect(toggleTask(tasks, 'a')).toEqual([{ id: 'a', title: 'A', done: false }]);
  });

  it('AC-14: does not mutate the input list or its tasks', () => {
    const tasks = [
      { id: 'a', title: 'A', done: false },
      { id: 'b', title: 'B', done: true },
    ];
    const snapshot = structuredClone(tasks);
    const originals = [...tasks];
    toggleTask(tasks, 'a');
    toggleTask(tasks, 'b');
    expect(tasks).toEqual(snapshot);
    expect(tasks[0]).toBe(originals[0]);
    expect(tasks[1]).toBe(originals[1]);
  });

  it('AC-15: returns the same list when no task has the id', () => {
    const tasks = [{ id: 'a', title: 'A', done: false }];
    expect(toggleTask(tasks, 'missing')).toBe(tasks);
  });

  it('AC-16: returns the same empty list without throwing', () => {
    const tasks = [];
    expect(toggleTask(tasks, 'a')).toBe(tasks);
  });
});

describe('formatTaskCount', () => {
  it.each([
    [0, '0 tasks'],
    [1, '1 task'],
    [2, '2 tasks'],
  ])('formats %i as "%s"', (count, expected) => {
    expect(formatTaskCount(count)).toBe(expected);
  });
});
