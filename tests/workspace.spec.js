/**
 * GrabDocs - Workspace Feature Tests
 * Group 5 - Playwright Testing
 * 
 * Feature: Create a workspace, select a role, and send invitations.
 * 
 * Capabilities tested:
 *   - Create a new workspace with name and description
 *   - View shared files
 *   - View members and check role
 *   - Send a chat message, edit it, and delete it
 *   - Invite a member via email
 *   - View invitations and resend
 *   - Cancel an invitation
 *   - Delete the workspace
 */

// @ts-check
const { test, expect } = require('@playwright/test');

// Increase timeout since this test has many steps with pauses
test.setTimeout(120000);

test.describe('Workspace Feature', () => {

  // Test: Full workspace lifecycle in one flow
  test('should create, configure, invite, chat, and delete a workspace', async ({ page }) => {
    await page.goto('https://app.grabdocs.com/upload');
    await page.waitForTimeout(2000);

    // Navigate to Workspace
    await page.getByRole('link', { name: 'Workspace' }).click();
    await page.waitForTimeout(2000);

    // ----- CREATE WORKSPACE -----
    await page.getByRole('button', { name: 'Create Workspace' }).click();
    await page.waitForTimeout(2000);

    // Enter workspace name
    await page.getByRole('textbox', { name: 'Enter workspace name (max 35' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox', { name: 'Enter workspace name (max 35' }).fill('Group 5 test');
    await page.waitForTimeout(2000);

    // Enter description
    await page.getByRole('textbox', { name: 'Enter workspace description (' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox', { name: 'Enter workspace description (' }).fill('Group 5 Playwright test');
    await page.waitForTimeout(2000);

    // Submit creation
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await page.waitForTimeout(2000);

    // Verify workspace was created
    await expect(page.getByText('Group 5 test')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // ----- VIEW SHARED FILES -----
    await page.getByRole('button', { name: 'Shared Files' }).nth(1).click();
    await page.waitForTimeout(2000);

    // Close shared files panel
    await page.getByRole('button', { name: 'Close' }).first().click();
    await page.waitForTimeout(2000);

    // ----- VIEW MEMBERS -----
    await page.getByRole('button', { name: 'View Members' }).nth(1).click();
    await page.waitForTimeout(2000);

    // Verify owner role is visible
    await expect(page.getByRole('button', { name: 'owner' })).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Close members panel
    await page.locator('.text-gray-400.hover\\:text-gray-600').click();
    await page.waitForTimeout(2000);

    // ----- WORKSPACE CHAT -----
    await page.getByRole('button', { name: 'Start Chat' }).nth(1).click();
    await page.waitForTimeout(2000);

    // Type a message
    await page.getByRole('textbox', { name: 'Type a message... Use @ to' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox', { name: 'Type a message... Use @ to' }).fill('Hello from Group 5');
    await page.waitForTimeout(2000);

    // Click Send button
    await page.locator('.px-3.py-1\\.5.bg-blue-600.text-white.rounded-lg.hover\\:bg-blue-700.disabled\\:opacity-50').click();
    await page.waitForTimeout(2000);

    // Edit the message
    await page.getByRole('button', { name: 'Edit message' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('textbox').filter({ hasText: 'Hello from Group 5' }).fill('Hello from Group 5 - edited');
    await page.waitForTimeout(2000);

    // Save the edit
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(2000);

    // Delete the chat message
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Remove chat from history' }).first().click();
    await page.waitForTimeout(2000);

    // ----- INVITE A MEMBER -----
    // Go back to workspace list
    await page.getByRole('link', { name: 'Workspace' }).click();
    await page.waitForTimeout(2000);

    // Click Invite Member
    await page.getByRole('button', { name: 'Invite Member' }).click();
    await page.waitForTimeout(2000);

    // Enter invitee email
    await page.getByRole('textbox', { name: 'user1@example.com, user2@' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox', { name: 'user1@example.com, user2@' }).fill('test_invite@example.com');
    await page.waitForTimeout(2000);

    // Send the invitation
    await page.getByRole('button', { name: 'Send Invitation' }).click();
    await page.waitForTimeout(2000);

    // ----- VIEW INVITATIONS -----
    await page.getByRole('button', { name: 'View Invitations' }).click();
    await page.waitForTimeout(2000);

    // Resend all invitations
    await page.getByRole('button', { name: 'Resend All' }).click();
    await page.waitForTimeout(2000);

    // Cancel the invitation
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Cancel Invitation' }).click();
    await page.waitForTimeout(2000);

    // Close invitations panel
    await page.locator('.text-gray-400.hover\\:text-gray-600').click();
    await page.waitForTimeout(2000);

    // ----- DELETE WORKSPACE -----
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Delete Workspace' }).first().click();
    await page.waitForTimeout(2000);

    // Verify success toast
    await expect(page.getByText(/deleted successfully/i)).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);
  });
});
