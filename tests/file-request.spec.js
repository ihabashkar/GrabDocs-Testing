// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('File Request Feature', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://app.grabdocs.com/upload');
  });

  test('should navigate to Files section', async ({ page }) => {
    await page.getByRole('link', { name: 'Files' }).click();
    await expect(page).toHaveURL(/files/i, { timeout: 10000 });
  });
});
