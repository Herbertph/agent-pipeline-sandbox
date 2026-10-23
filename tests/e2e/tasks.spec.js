import { expect, test } from '@playwright/test';

test.describe('Task list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the empty state on first load', async ({ page }) => {
    await expect(page.getByText('No tasks yet.')).toBeVisible();
    await expect(page.getByText('0 tasks')).toBeVisible();
    await expect(page.getByRole('list', { name: 'Tasks' }).getByRole('listitem')).toHaveCount(0);
  });

  test('adds a task and clears the input', async ({ page }) => {
    const input = page.getByLabel('New task');

    await input.fill('Buy milk');
    await page.getByRole('button', { name: 'Add task' }).click();

    await expect(page.getByRole('list', { name: 'Tasks' }).getByRole('listitem')).toHaveText(['Buy milk']);
    await expect(page.getByText('1 task', { exact: true })).toBeVisible();
    await expect(page.getByText('No tasks yet.')).toBeHidden();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
  });

  test('adds a task with the Enter key', async ({ page }) => {
    await page.getByLabel('New task').fill('Walk the dog');
    await page.getByLabel('New task').press('Enter');

    await expect(page.getByRole('list', { name: 'Tasks' }).getByRole('listitem')).toHaveText(['Walk the dog']);
  });

  test('keeps tasks in the order they were added', async ({ page }) => {
    const input = page.getByLabel('New task');
    for (const title of ['First', 'Second', 'Third']) {
      await input.fill(title);
      await input.press('Enter');
    }

    await expect(page.getByRole('list', { name: 'Tasks' }).getByRole('listitem')).toHaveText([
      'First',
      'Second',
      'Third',
    ]);
    await expect(page.getByText('3 tasks')).toBeVisible();
  });

  test('rejects a blank title and adds nothing', async ({ page }) => {
    const input = page.getByLabel('New task');

    await input.fill('   ');
    await input.press('Enter');

    await expect(page.getByRole('alert')).toHaveText('Task title is required.');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('list', { name: 'Tasks' }).getByRole('listitem')).toHaveCount(0);
  });

  test('clears the error after a valid task is added', async ({ page }) => {
    const input = page.getByLabel('New task');

    await input.press('Enter');
    await expect(page.getByRole('alert')).toHaveText('Task title is required.');

    await input.fill('Valid task');
    await input.press('Enter');

    await expect(page.getByRole('alert')).toHaveText('');
    await expect(input).not.toHaveAttribute('aria-invalid');
  });

  test('trims surrounding whitespace from the title', async ({ page }) => {
    await page.getByLabel('New task').fill('   Pay rent   ');
    await page.getByLabel('New task').press('Enter');

    await expect(page.getByRole('list', { name: 'Tasks' }).getByRole('listitem')).toHaveText(['Pay rent']);
  });

  test('renders HTML in a title as plain text', async ({ page }) => {
    const title = '<img src=x onerror="window.__xss = true">';

    await page.getByLabel('New task').fill(title);
    await page.getByLabel('New task').press('Enter');

    await expect(page.getByRole('list', { name: 'Tasks' }).getByRole('listitem')).toHaveText([title]);
    await expect(page.locator('#task-list img')).toHaveCount(0);
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  });

  test.describe('Mark a task as done', () => {
    async function addTasks(page, titles) {
      const input = page.getByLabel('New task');
      for (const title of titles) {
        await input.fill(title);
        await input.press('Enter');
      }
    }

    test('AC-1: a new task has an unchecked checkbox named after its title', async ({ page }) => {
      await addTasks(page, ['Buy milk']);

      const checkbox = page.getByRole('checkbox', { name: 'Buy milk' });
      await expect(checkbox).toBeVisible();
      await expect(checkbox).not.toBeChecked();
    });

    test('AC-2: checking the checkbox marks the task done with a strikethrough', async ({ page }) => {
      await addTasks(page, ['Buy milk']);

      await page.getByRole('checkbox', { name: 'Buy milk' }).click();

      await expect(page.getByRole('checkbox', { name: 'Buy milk' })).toBeChecked();
      await expect(page.getByText('Buy milk', { exact: true })).toHaveCSS('text-decoration-line', 'line-through');
    });

    test('AC-3: unchecking a done task removes the strikethrough', async ({ page }) => {
      await addTasks(page, ['Buy milk']);
      await page.getByRole('checkbox', { name: 'Buy milk' }).click();

      await page.getByRole('checkbox', { name: 'Buy milk' }).click();

      await expect(page.getByRole('checkbox', { name: 'Buy milk' })).not.toBeChecked();
      await expect(page.getByText('Buy milk', { exact: true })).toHaveCSS('text-decoration-line', 'none');
    });

    test('AC-4: clicking the title text toggles the task', async ({ page }) => {
      await addTasks(page, ['Buy milk']);

      await page.getByText('Buy milk', { exact: true }).click();

      await expect(page.getByRole('checkbox', { name: 'Buy milk' })).toBeChecked();
      await expect(page.getByText('Buy milk', { exact: true })).toHaveCSS('text-decoration-line', 'line-through');
    });

    test('AC-5: toggling one task leaves the others unchanged', async ({ page }) => {
      await addTasks(page, ['First', 'Second', 'Third']);

      await page.getByRole('checkbox', { name: 'Second' }).click();

      await expect(page.getByRole('checkbox', { name: 'Second' })).toBeChecked();
      await expect(page.getByText('Second', { exact: true })).toHaveCSS('text-decoration-line', 'line-through');
      for (const title of ['First', 'Third']) {
        await expect(page.getByRole('checkbox', { name: title })).not.toBeChecked();
        await expect(page.getByText(title, { exact: true })).toHaveCSS('text-decoration-line', 'none');
      }
    });

    test('AC-6: tasks with the same title are toggled independently', async ({ page }) => {
      await addTasks(page, ['Same', 'Same']);
      const checkboxes = page.getByRole('checkbox', { name: 'Same' });

      await checkboxes.nth(0).click();

      await expect(checkboxes.nth(0)).toBeChecked();
      await expect(checkboxes.nth(1)).not.toBeChecked();
    });

    test('AC-7: toggling keeps the order and the count', async ({ page }) => {
      await addTasks(page, ['First', 'Second', 'Third']);

      await page.getByRole('checkbox', { name: 'First' }).click();

      await expect(page.getByRole('checkbox', { name: 'First' })).toBeChecked();
      await expect(page.getByRole('list', { name: 'Tasks' }).getByRole('listitem')).toHaveText([
        'First',
        'Second',
        'Third',
      ]);
      await expect(page.getByText('3 tasks')).toBeVisible();
    });

    test('AC-8: a task added after toggling starts not done', async ({ page }) => {
      await addTasks(page, ['First', 'Second', 'Third']);
      await page.getByRole('checkbox', { name: 'First' }).click();

      await addTasks(page, ['Fourth']);

      await expect(page.getByRole('list', { name: 'Tasks' }).getByRole('listitem').last()).toHaveText('Fourth');
      await expect(page.getByRole('checkbox', { name: 'Fourth' })).not.toBeChecked();
      await expect(page.getByText('Fourth', { exact: true })).toHaveCSS('text-decoration-line', 'none');
      await expect(page.getByRole('checkbox', { name: 'First' })).toBeChecked();
      await expect(page.getByText('First', { exact: true })).toHaveCSS('text-decoration-line', 'line-through');
    });

    test('AC-9: toggling keeps the error and the input value', async ({ page }) => {
      await addTasks(page, ['Buy milk']);
      const input = page.getByLabel('New task');
      await input.fill('');
      await input.press('Enter');
      await input.fill('draft');
      await expect(page.getByRole('alert')).toHaveText('Task title is required.');

      await page.getByRole('checkbox', { name: 'Buy milk' }).click();

      await expect(page.getByRole('checkbox', { name: 'Buy milk' })).toBeChecked();
      await expect(page.getByRole('alert')).toHaveText('Task title is required.');
      await expect(input).toHaveValue('draft');
    });

    test('AC-10: Space toggles the focused checkbox and focus stays on it', async ({ page }) => {
      await addTasks(page, ['Buy milk']);
      const checkbox = page.getByRole('checkbox', { name: 'Buy milk' });
      await page.getByRole('button', { name: 'Add task' }).focus();
      await page.keyboard.press('Tab');
      await expect(checkbox).toBeFocused();

      await page.keyboard.press('Space');
      await expect(checkbox).toBeChecked();
      await expect(checkbox).toBeFocused();

      await page.keyboard.press('Space');
      await expect(checkbox).not.toBeChecked();
      await expect(checkbox).toBeFocused();
    });

    test('AC-11: a done task with HTML in its title is rendered as plain text', async ({ page }) => {
      const title = '<img src=x onerror="window.__xss = true">';
      await addTasks(page, [title]);

      await page.getByRole('checkbox', { name: title }).click();

      await expect(page.getByRole('checkbox', { name: title })).toBeChecked();
      await expect(page.getByText(title, { exact: true })).toBeVisible();
      await expect(page.locator('#task-list img')).toHaveCount(0);
      expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    });
  });
});
