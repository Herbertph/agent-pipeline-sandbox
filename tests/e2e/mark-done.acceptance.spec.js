import { expect, test } from '@playwright/test';

// Additional acceptance and exploratory tests for docs/specs/mark-done.md, written by QA.

async function addTasks(page, titles) {
  const input = page.getByLabel('New task');
  for (const title of titles) {
    await input.fill(title);
    await input.press('Enter');
  }
}

function items(page) {
  return page.getByRole('list', { name: 'Tasks' }).getByRole('listitem');
}

test.describe('Mark a task as done (QA acceptance)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('AC-1: the list item text is exactly the title (no extra visible text)', async ({ page }) => {
    await addTasks(page, ['Buy milk']);

    await expect(page.getByRole('checkbox', { name: 'Buy milk', exact: true })).not.toBeChecked();
    await expect(items(page)).toHaveText(['Buy milk']);
  });

  test('AC-3: clicking the title of a done task makes it not done again', async ({ page }) => {
    await addTasks(page, ['Buy milk']);
    const title = page.getByText('Buy milk', { exact: true });

    await title.click();
    await expect(title).toHaveCSS('text-decoration-line', 'line-through');
    await title.click();

    await expect(page.getByRole('checkbox', { name: 'Buy milk' })).not.toBeChecked();
    await expect(title).toHaveCSS('text-decoration-line', 'none');
  });

  test('AC-6: only the first of two same-titled tasks is struck through', async ({ page }) => {
    await addTasks(page, ['Same', 'Same']);

    await page.getByRole('checkbox', { name: 'Same' }).nth(0).click();

    await expect(page.getByRole('checkbox', { name: 'Same' }).nth(0)).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Same' }).nth(1)).not.toBeChecked();
    await expect(page.getByText('Same', { exact: true }).nth(0)).toHaveCSS('text-decoration-line', 'line-through');
    await expect(page.getByText('Same', { exact: true }).nth(1)).toHaveCSS('text-decoration-line', 'none');
  });

  test('AC-7: toggling keeps the order, the count and the hidden empty state', async ({ page }) => {
    await addTasks(page, ['First', 'Second', 'Third']);

    await page.getByRole('checkbox', { name: 'First' }).click();

    await expect(items(page)).toHaveText(['First', 'Second', 'Third']);
    await expect(page.locator('#task-count')).toHaveText('3 tasks');
    await expect(page.getByText('No tasks yet.')).toBeHidden();
  });

  test('AC-9: toggling twice keeps the error, aria-invalid and the draft input', async ({ page }) => {
    await addTasks(page, ['Buy milk']);
    const input = page.getByLabel('New task');
    await input.press('Enter');
    await input.fill('draft');
    await expect(page.getByRole('alert')).toHaveText('Task title is required.');

    await page.getByRole('checkbox', { name: 'Buy milk' }).click();
    await page.getByRole('checkbox', { name: 'Buy milk' }).click();

    await expect(page.getByRole('alert')).toHaveText('Task title is required.');
    await expect(input).toHaveValue('draft');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  test('AC-10: focus returns to the toggled task, not another one, in a multi-task list', async ({ page }) => {
    await addTasks(page, ['First', 'Second', 'Third']);
    const second = page.getByRole('checkbox', { name: 'Second' });
    await page.getByRole('button', { name: 'Add task' }).focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(second).toBeFocused();

    await page.keyboard.press('Space');
    await expect(second).toBeChecked();
    await expect(second).toBeFocused();
    await expect(page.getByRole('checkbox', { name: 'First' })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Third' })).not.toBeChecked();

    await page.keyboard.press('Space');
    await expect(second).not.toBeChecked();
    await expect(second).toBeFocused();
  });

  test('AC-10: focus stays on the same duplicate-titled checkbox after Space', async ({ page }) => {
    await addTasks(page, ['Same', 'Same']);
    const secondSame = page.getByRole('checkbox', { name: 'Same' }).nth(1);
    await secondSame.focus();

    await page.keyboard.press('Space');

    await expect(secondSame).toBeChecked();
    await expect(secondSame).toBeFocused();
    await expect(page.getByRole('checkbox', { name: 'Same' }).nth(0)).not.toBeChecked();
  });

  test('AC-11: the done task shows the literal title as its only text', async ({ page }) => {
    const title = '<img src=x onerror="window.__xss = true">';
    await addTasks(page, [title]);

    await page.getByRole('checkbox', { name: title }).click();

    await expect(items(page)).toHaveText([title]);
    await expect(page.getByText(title, { exact: true })).toHaveCSS('text-decoration-line', 'line-through');
    await expect(page.locator('#task-list img')).toHaveCount(0);
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  });

  test('exploratory: rapid repeated toggling ends in the expected state', async ({ page }) => {
    await addTasks(page, ['Buy milk']);
    const checkbox = page.getByRole('checkbox', { name: 'Buy milk' });

    for (let i = 0; i < 5; i += 1) {
      await checkbox.click();
    }

    await expect(checkbox).toBeChecked();
    await expect(page.getByText('Buy milk', { exact: true })).toHaveCSS('text-decoration-line', 'line-through');
    await expect(items(page)).toHaveCount(1);
  });

  test('exploratory: strikethrough is on the title only, not the row', async ({ page }) => {
    await addTasks(page, ['Buy milk']);

    await page.getByRole('checkbox', { name: 'Buy milk' }).click();

    await expect(items(page).first()).toHaveCSS('text-decoration-line', 'none');
    await expect(page.getByText('Buy milk', { exact: true })).toHaveCSS('text-decoration-line', 'line-through');
  });
});
