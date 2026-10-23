// Pure task logic, no DOM access, so it can be unit tested in isolation.

export const MAX_TITLE_LENGTH = 120;

/**
 * Validates and normalizes a task title.
 * @param {unknown} rawTitle
 * @returns {{ ok: true, title: string } | { ok: false, error: string }}
 */
export function validateTitle(rawTitle) {
  const title = String(rawTitle ?? '').trim();

  if (title.length === 0) {
    return { ok: false, error: 'Task title is required.' };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { ok: false, error: `Task title must be ${MAX_TITLE_LENGTH} characters or fewer.` };
  }
  return { ok: true, title };
}

/**
 * Returns a new task list with the task appended. Never mutates the input list.
 * @param {Array<{ id: string, title: string }>} tasks
 * @param {unknown} rawTitle
 * @param {{ createId?: () => string }} [options]
 * @returns {{ tasks: Array<{ id: string, title: string }>, error: string | null }}
 */
export function addTask(tasks, rawTitle, { createId = () => crypto.randomUUID() } = {}) {
  const result = validateTitle(rawTitle);
  if (!result.ok) {
    return { tasks, error: result.error };
  }
  return { tasks: [...tasks, { id: createId(), title: result.title }], error: null };
}

/**
 * @param {number} count
 * @returns {string} For example "0 tasks", "1 task", "2 tasks".
 */
export function formatTaskCount(count) {
  return `${count} ${count === 1 ? 'task' : 'tasks'}`;
}
