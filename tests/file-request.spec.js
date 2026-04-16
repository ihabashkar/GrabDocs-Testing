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
    await expect(page).toHaveURL(/file-request|filerequest|files/i, { timeout: 10000 });
  });

  // Test: Create a new file request link with a custom name
  test('should create a new file request link', async ({ page }) => {
    // Navigate to File Request section
    await page.getByRole('link', { name: 'File Request' }).click();

    // Click to create a new link
    await page.getByRole('button', { name: 'Create Your First Link' }).click();

    // Enter a custom link name
    await page.getByRole('textbox', { name: 'Enter link name' }).click();
    await page.getByRole('textbox', { name: 'Enter link name' }).fill('Group-5 test');

    // Submit link creation
    await page.getByRole('button', { name: 'Create Link' }).click();

    // Verify the link was created (Options button appears for the new link)
    await expect(page.getByRole('button', { name: 'Options' })).toBeVisible({ timeout: 10000 });
  });

  // Test: Share a file request link via email
  test('should share a file request link via email', async ({ page }) => {
    // Navigate to File Request section
    await page.getByRole('link', { name: 'File Request' }).click();

    // Open options on an existing link
    await page.getByRole('button', { name: 'Options' }).click();

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

    // Verify success (button disappears or success message shows)
    await expect(page.getByRole('button', { name: 'Send Email' })).toBeHidden({ timeout: 10000 });
  });
});
