/**
 * GrabDocs - File Request Feature Tests
 * Group 5 - Playwright Testing
 * 
 * Feature: Send someone a link to upload a file, then access that file.
 * Capabilities tested:
 *   - Navigate to File Request section
 *   - Create a new file request link with a custom name
 *   - Share the link via email with a personal message
 */

// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('File Request Feature', () => {

  // Navigate to the dashboard before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('https://app.grabdocs.com/upload');
  });

  // Test: Navigate to File Request and verify it loads
  test('should navigate to File Request section', async ({ page }) => {
    await page.getByRole('link', { name: 'File Request' }).click();
    await expect(page).toHaveURL(/quick-links/i, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'File Request' })).toBeVisible();
  });

  // Test: Create a new file request link with a custom name
  test('should create a new file request link', async ({ page }) => {
    // Navigate to File Request section
    await page.getByRole('link', { name: 'File Request' }).click();

    // Click to create a new link (button text depends on whether links exist)
    const newLinkBtn = page.getByRole('button', { name: /New Link|Create Your First Link/i });
    await newLinkBtn.click();

    // Enter a custom link name with unique timestamp to avoid duplicates
    const linkName = `Group-5 test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Enter link name' }).click();
    await page.getByRole('textbox', { name: 'Enter link name' }).fill(linkName);

    // Submit link creation
    await page.getByRole('button', { name: 'Create Link' }).click();

    // Verify the link was created (Options button appears for the new link)
    await expect(page.getByRole('button', { name: 'Options' }).first()).toBeVisible({ timeout: 10000 });
  });

  // Test: Share a file request link via email
  test('should share a file request link via email', async ({ page }) => {
    // Navigate to File Request section
    await page.getByRole('link', { name: 'File Request' }).click();

    // Open options on an existing link
    await page.getByRole('button', { name: 'Options' }).first().click();

    // Click Share
    await page.getByRole('button', { name: 'Share' }).click();

    // Enter recipient email address
    await page.getByRole('textbox', { name: 'recipient1@example.com,' }).click();
    await page.getByRole('textbox', { name: 'recipient1@example.com,' }).fill('testrecipient@example.com');

    // Add a personal message
    await page.getByRole('textbox', { name: 'Add a personal message...' }).click();
    await page.getByRole('textbox', { name: 'Add a personal message...' }).fill('Group 5 Playwright test - file request link');

    // Send the email
    await page.getByRole('button', { name: 'Send Email' }).click();

    // Verify success (look for a success toast or confirmation message)
    await expect(page.getByText(/sent|success|shared|delivered/i).first()).toBeVisible({ timeout: 10000 });
  });
});
