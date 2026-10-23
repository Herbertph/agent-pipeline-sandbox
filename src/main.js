import './style.css';
import { addTask, formatTaskCount, toggleTask } from './tasks.js';

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
      const label = document.createElement('label');
      label.className = 'task';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.dataset.id = task.id;
      const title = document.createElement('span');
      title.className = task.done ? 'task-title done' : 'task-title';
      // textContent, never innerHTML: user input must not be parsed as HTML.
      title.textContent = task.title;
      label.append(checkbox, title);
      item.append(label);
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

list.addEventListener('change', (event) => {
  const checkbox = event.target;
  if (!(checkbox instanceof HTMLInputElement) || checkbox.type !== 'checkbox') {
    return;
  }
  const { id } = checkbox.dataset;
  tasks = toggleTask(tasks, id);
  render();
  // render() replaces every row, so move focus back to the toggled task's checkbox.
  const toggled = [...list.querySelectorAll('input[type="checkbox"]')].find((el) => el.dataset.id === id);
  toggled?.focus();
});

render();
