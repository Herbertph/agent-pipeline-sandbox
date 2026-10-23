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
 * @typedef {{ id: string, title: string, done: boolean }} Task
 */

/**
 * Returns a new task list with the task appended. Never mutates the input list.
 * New tasks start as not done.
 * @param {Task[]} tasks
 * @param {unknown} rawTitle
 * @param {{ createId?: () => string }} [options]
 * @returns {{ tasks: Task[], error: string | null }}
 */
export function addTask(tasks, rawTitle, { createId = () => crypto.randomUUID() } = {}) {
  const result = validateTitle(rawTitle);
  if (!result.ok) {
    return { tasks, error: result.error };
  }
  return { tasks: [...tasks, { id: createId(), title: result.title, done: false }], error: null };
}

/**
 * Returns a new task list in which the task with the given id has its done state inverted.
 * Never mutates the input list or its tasks. Returns the input list unchanged when no task matches.
 * @param {Task[]} tasks
 * @param {string} id
 * @returns {Task[]}
 */
export function toggleTask(tasks, id) {
  if (!tasks.some((task) => task.id === id)) {
    return tasks;
  }
  return tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
}

/**
 * @param {number} count
 * @returns {string} For example "0 tasks", "1 task", "2 tasks".
 */
export function formatTaskCount(count) {
  return `${count} ${count === 1 ? 'task' : 'tasks'}`;
}
