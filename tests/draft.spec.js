// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Draft Feature', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://app.grabdocs.com/upload');
  });

  test('should create a new draft and save content', async ({ page }) => {
    await page.getByRole('link', { name: 'Drafts' }).click();

    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'New Draft' }).first().click();
    const draftPage = await popupPromise;

    await draftPage.locator('.tiptap').click();
    await draftPage.locator('.tiptap').fill('Group 5 test playwright');
    await draftPage.getByRole('button', { name: 'Save Changes' }).click();

    await expect(draftPage.locator('.tiptap')).toContainText('Group 5 test playwright');
  });

  test('should allow the same user to access Drafts from a second session', async ({ browser }) => {
    // ----- Session 1: create and save a draft -----
    const context1 = await browser.newContext({ storageState: 'auth.json' });
    const page1 = await context1.newPage();
    await page1.goto('https://app.grabdocs.com/upload');
    await page1.getByRole('link', { name: 'Drafts' }).click();

    const popupPromise = page1.waitForEvent('popup');
    await page1.getByRole('button', { name: 'New Draft' }).first().click();
    const draft1 = await popupPromise;

    await draft1.locator('.tiptap').click();
    await draft1.locator('.tiptap').fill('Concurrent session test from Group 5');
    await draft1.getByRole('button', { name: 'Save Changes' }).click();
    await draft1.waitForTimeout(2000);

    // ----- Session 2: verify Drafts page loads in a separate context -----
    const context2 = await browser.newContext({ storageState: 'auth.json' });
    const page2 = await context2.newPage();
    await page2.goto('https://app.grabdocs.com/upload');
    await page2.getByRole('link', { name: 'Drafts' }).click();

    // Confirm the Drafts page loaded (New Draft button is visible)
    await expect(page2.getByRole('button', { name: 'New Draft' }).first())
      .toBeVisible({ timeout: 15000 });

    await context1.close();
    await context2.close();
  });
});
