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
 */

// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Workspace Feature', () => {

  // Navigate to the dashboard before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('https://app.grabdocs.com/upload');
  });

  // Test: Create a new workspace and verify it appears on the page
  test('should create a new workspace', async ({ page }) => {
    // Use a unique name so repeated runs don't conflict with old workspaces
    const workspaceName = `Group 5 test ${Date.now()}`;

    // Navigate to Workspace section via sidebar
    await page.getByRole('link', { name: 'Workspace' }).click();

    // Click "Create Workspace" button
    await page.getByRole('button', { name: 'Create Workspace' }).click();

    // Fill in workspace name (max 35 characters)
    await page.getByRole('textbox', { name: 'Enter workspace name (max 35' })
      .fill(workspaceName);

    // Fill in workspace description
    await page.getByRole('textbox', { name: 'Enter workspace description (' })
      .fill('playwright grab docs test');

    // Submit the form
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    // Verify the workspace was created and is visible
    await expect(page.getByText(workspaceName)).toBeVisible({ timeout: 10000 });
  });
});
