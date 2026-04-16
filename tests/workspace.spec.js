/**
 * GrabDocs - Workspace Feature Tests
 * Group 5 - Playwright Testing
 * 
 * Feature: Create a workspace, select a role, and send invitations.
 * Confirm that when accepted, the invitee shows up on the dashboard.
 * 
 * Capabilities tested:
 *   - Create a new workspace with name and description
 *   - Verify workspace appears after creation
 *   - Delete the workspace and verify removal
 */

// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Workspace Feature', () => {

  // Navigate to the dashboard before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('https://app.grabdocs.com/upload');
  });

  // Test: Full lifecycle — create a workspace, verify it, then delete it
  test('should create and delete a workspace', async ({ page }) => {
    const workspaceName = `Group 5 test ${Date.now()}`;

    // Navigate to Workspace section via sidebar
    await page.getByRole('link', { name: 'Workspace' }).click();

    // ----- CREATE -----
    await page.getByRole('button', { name: 'Create Workspace' }).click();

    // Fill in workspace name
    await page.getByRole('textbox', { name: 'Enter workspace name (max 35' })
      .fill(workspaceName);

    // Fill in workspace description
    await page.getByRole('textbox', { name: 'Enter workspace description (' })
      .fill('playwright grab docs test');

    // Submit the form
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    // Verify the workspace was created and is visible
    await expect(page.getByText(workspaceName)).toBeVisible({ timeout: 10000 });

    // ----- DELETE -----
    // Accept the confirmation dialog when it appears
    page.once('dialog', dialog => dialog.accept());

    // Click delete on the workspace we just created
    await page.getByRole('button', { name: 'Delete Workspace' }).first().click();

    // Verify the success toast appears confirming deletion
    await expect(page.getByText(/deleted successfully/i)).toBeVisible({ timeout: 10000 });

    // Verify the workspace name is no longer on the page
    await expect(page.getByText(workspaceName)).toBeHidden({ timeout: 10000 });
  });
});
