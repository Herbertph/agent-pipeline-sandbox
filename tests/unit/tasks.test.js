import { describe, expect, it } from 'vitest';
import { addTask, formatTaskCount, MAX_TITLE_LENGTH, validateTitle } from '../../src/tasks.js';

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
      { id: 'id-1', title: 'Second' },
    ]);
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

describe('formatTaskCount', () => {
  it.each([
    [0, '0 tasks'],
    [1, '1 task'],
    [2, '2 tasks'],
  ])('formats %i as "%s"', (count, expected) => {
    expect(formatTaskCount(count)).toBe(expected);
  });
});
