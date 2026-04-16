// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Workspace Feature', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://app.grabdocs.com/upload');
  });

  test('should create a new workspace', async ({ page }) => {
    // Use a unique name so repeated runs don't collide with old workspaces
    const workspaceName = `Group 5 test ${Date.now()}`;

    await page.getByRole('link', { name: 'Workspace' }).click();
    await page.getByRole('button', { name: 'Create Workspace' }).click();

    await page.getByRole('textbox', { name: 'Enter workspace name (max 35' })
      .fill(workspaceName);
    await page.getByRole('textbox', { name: 'Enter workspace description (' })
      .fill('playwright grab docs test');

    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(workspaceName)).toBeVisible({ timeout: 10000 });
  });
});
