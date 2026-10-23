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
});
