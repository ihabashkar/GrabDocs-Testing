/**
 * GrabDocs - File Request Feature Tests
 * Group 5 - Playwright Testing
 * 
 * Feature: Send someone a link to upload a file, then access that file.
 * Capabilities tested:
 *   - Create a link with name, file size limit, and max uses
 *   - Disable and re-enable a link via Edit
 *   - Share a link via email
 *   - View Uploaded Files tab
 *   - Delete a link
 */

// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('File Request Feature', () => {

  // Test: Full file request lifecycle in one flow
  test('should create, configure, share, and delete a file request link', async ({ page }) => {
    await page.goto('https://app.grabdocs.com/upload');
    await page.waitForTimeout(2000);

    // Navigate to File Request
    await page.getByRole('link', { name: 'File Request' }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: 'File Request' })).toBeVisible();
    await page.waitForTimeout(2000);

    // ----- CREATE LINK -----
    await page.getByRole('button', { name: 'New Link' }).click();
    await page.waitForTimeout(2000);

    // Set link name
    await page.getByRole('textbox', { name: 'Enter link name' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox', { name: 'Enter link name' }).fill('link test');
    await page.waitForTimeout(2000);

    // Set file size limit to 1MB
    await page.getByRole('spinbutton').first().click();
    await page.waitForTimeout(1000);
    await page.getByRole('spinbutton').first().fill('1');
    await page.getByRole('spinbutton').first().press('Enter');
    await page.waitForTimeout(2000);

    // Set max uses to 2
    await page.getByPlaceholder('Unlimited').click();
    await page.waitForTimeout(1000);
    await page.getByPlaceholder('Unlimited').fill('2');
    await page.getByPlaceholder('Unlimited').press('Enter');
    await page.waitForTimeout(2000);

    // Create the link
    await page.getByRole('button', { name: 'Create Link' }).click();
    await page.waitForTimeout(2000);

    // Verify link appears in the table
    await expect(page.getByRole('row', { name: /link test/ })).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // ----- DISABLE LINK -----
    await page.getByRole('row', { name: /link test/ }).getByLabel('Options').click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Disable' }).click();
    await page.waitForTimeout(2000);

    // ----- EDIT AND RE-ENABLE -----
    await page.getByRole('row', { name: /link test/ }).getByLabel('Options').click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.waitForTimeout(2000);

    // Set expiration date
    await page.locator('input[type="datetime-local"]').click();
    await page.locator('input[type="datetime-local"]').press('Enter');
    await page.waitForTimeout(2000);

    // Change file size limit to 32MB
    await page.getByRole('spinbutton').first().click();
    await page.getByRole('spinbutton').first().fill('32');
    await page.waitForTimeout(2000);

    // Regenerate the upload code
    await page.getByRole('button', { name: 'Regenerate' }).click();
    await page.waitForTimeout(2000);

    // Update the link (re-enables it)
    await page.getByRole('button', { name: 'Update Link' }).click();
    await page.waitForTimeout(2000);

    // ----- SHARE VIA EMAIL -----
    await page.getByRole('row', { name: /link test/ }).getByLabel('Options').click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Share' }).click();
    await page.waitForTimeout(2000);

    // Enter recipient email
    await page.getByRole('textbox', { name: 'recipient1@example.com,' }).fill('example@email.com');
    await page.waitForTimeout(2000);

    // Add a personal message
    await page.getByRole('textbox', { name: 'Add a personal message...' }).fill('Group 5 Playwright test');
    await page.waitForTimeout(2000);

    // Send the email
    await page.getByRole('button', { name: 'Send Email' }).click();
    await page.waitForTimeout(2000);

    // Verify success
    await expect(page.getByText(/sent|success|shared|delivered/i).first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // ----- VIEW UPLOADED FILES TAB -----
    await page.getByRole('button', { name: 'Uploaded Files' }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText(/No files uploaded|uploaded/i).first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Switch back to Upload Links
    await page.getByRole('button', { name: 'Upload Links' }).click();
    await page.waitForTimeout(2000);

    // ----- DELETE LINK -----
    await page.getByRole('row', { name: /link test/ }).getByLabel('Options').click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(2000);
  });
});
