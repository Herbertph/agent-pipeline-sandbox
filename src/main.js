import './style.css';
import { addTask, formatTaskCount } from './tasks.js';

const form = document.querySelector('#task-form');
const input = document.querySelector('#task-title');
const error = document.querySelector('#task-error');
const list = document.querySelector('#task-list');
const count = document.querySelector('#task-count');
const emptyState = document.querySelector('#empty-state');

// In-memory only: tasks are lost on reload.
let tasks = [];

function render() {
  list.replaceChildren(
    ...tasks.map((task) => {
      const item = document.createElement('li');
      // textContent, never innerHTML: user input must not be parsed as HTML.
      item.textContent = task.title;
      return item;
    }),
  );
  count.textContent = formatTaskCount(tasks.length);
  emptyState.hidden = tasks.length > 0;
}

function showError(message) {
  error.textContent = message;
  input.setAttribute('aria-invalid', 'true');
}

function clearError() {
  error.textContent = '';
  input.removeAttribute('aria-invalid');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const result = addTask(tasks, input.value);
  if (result.error) {
    showError(result.error);
    input.focus();
    return;
  }

  tasks = result.tasks;
  clearError();
  input.value = '';
  input.focus();
  render();
});

render();
