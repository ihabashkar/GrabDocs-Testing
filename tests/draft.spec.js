/**
 * GrabDocs - Draft Feature Tests
 * Group 5 - Playwright Testing
 * 
 * Feature: Google Docs clone - multiple users can make modifications
 * to a single file concurrently.
 * 
 * Capabilities tested:
 *   - Create a new draft document
 *   - Type and format text (bold, italic, alignment)
 *   - Invite someone to edit with a role and share link
 *   - Rename the draft
 *   - Save changes
 *   - Delete the draft
 */

// @ts-check
const { test, expect } = require('@playwright/test');

// Increase timeout since this test has many steps with pauses
test.setTimeout(120000);

test.describe('Draft Feature', () => {

  // Test: Full draft lifecycle in one flow
  test('should create, edit, share, and delete a draft', async ({ page }) => {
    await page.goto('https://app.grabdocs.com/upload');
    await page.waitForTimeout(2000);

    // Navigate to Drafts
    await page.getByRole('link', { name: 'Drafts' }).click();
    await page.waitForTimeout(2000);

    // ----- CREATE NEW DRAFT -----
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'New Draft' }).first().click();
    const draftPage = await popupPromise;
    await draftPage.waitForTimeout(2000);

    // ----- TYPE CONTENT -----
    await draftPage.locator('.tiptap').click();
    await draftPage.waitForTimeout(1000);
    await draftPage.locator('.tiptap').fill('Group 5 Playwright Test');
    await draftPage.waitForTimeout(2000);

    // ----- FORMAT TEXT -----
    // Select all text
    await draftPage.keyboard.press('ControlOrMeta+a');
    await draftPage.waitForTimeout(1000);

    // Bold
    await draftPage.getByRole('button', { name: 'Bold' }).click();
    await draftPage.waitForTimeout(1000);

    // Italic
    await draftPage.getByRole('button', { name: 'Italic' }).click();
    await draftPage.waitForTimeout(1000);

    // Align center
    await draftPage.getByRole('button', { name: 'Align center' }).click();
    await draftPage.waitForTimeout(1000);

    // Align back to left
    await draftPage.getByRole('button', { name: 'Align left' }).click();
    await draftPage.waitForTimeout(2000);

    // ----- INVITE TO EDIT (Member role) -----
    await draftPage.getByRole('button', { name: 'Invite to Edit' }).click();
    await draftPage.waitForTimeout(2000);

    // Select member role
    await draftPage.getByRole('combobox').selectOption('member');
    await draftPage.waitForTimeout(1000);

    // Set max uses
    await draftPage.getByPlaceholder('e.g.,').click();
    await draftPage.waitForTimeout(1000);
    await draftPage.getByPlaceholder('e.g.,').fill('1');
    await draftPage.waitForTimeout(1000);

    // Create the invite link
    await draftPage.getByRole('button', { name: 'Create Link' }).click();
    await draftPage.waitForTimeout(2000);

    // Enter recipient email
    await draftPage.getByRole('textbox', { name: 'user1@example.com, user2@' }).click();
    await draftPage.waitForTimeout(1000);
    await draftPage.getByRole('textbox', { name: 'user1@example.com, user2@' }).fill('example@email.com');
    await draftPage.waitForTimeout(2000);

    // Add a personal message
    await draftPage.getByRole('textbox', { name: 'Add a personal message...' }).click();
    await draftPage.waitForTimeout(1000);
    await draftPage.getByRole('textbox', { name: 'Add a personal message...' }).fill('Group 5 test invite');
    await draftPage.waitForTimeout(2000);

    // Send the email
    await draftPage.getByRole('button', { name: 'Send Email' }).click();
    await draftPage.waitForTimeout(2000);

    // Close the invite panel
    await draftPage.getByRole('button', { name: 'Done' }).click();
    await draftPage.waitForTimeout(2000);

    // ----- CLEAN UP INVITE LINKS -----
    await draftPage.getByRole('button', { name: 'Invite to Edit' }).click();
    await draftPage.waitForTimeout(2000);

    // Delete the invite link
    draftPage.once('dialog', dialog => dialog.accept());
    await draftPage.getByRole('button', { name: 'Delete link permanently' }).first().click();
    await draftPage.waitForTimeout(2000);

    // Close invite panel
    await draftPage.locator('.text-gray-400').click();
    await draftPage.waitForTimeout(2000);

    // ----- RENAME THE DRAFT -----
    await draftPage.getByTitle('Edit: Untitled Draft.txt').click();
    await draftPage.waitForTimeout(2000);
    await draftPage.getByRole('textbox', { name: 'Filename' }).fill('Group 5 Draft');
    await draftPage.waitForTimeout(2000);

    // ----- SAVE CHANGES -----
    await draftPage.getByRole('button', { name: 'Save Changes' }).click();
    await draftPage.waitForTimeout(2000);

    // Verify content persists after save
    await expect(draftPage.locator('.tiptap')).toContainText('Group 5 Playwright Test');
    await draftPage.waitForTimeout(2000);

    // ----- DELETE THE DRAFT -----
    // Close the popup editor and go back to the Drafts list page
    await draftPage.close();
    await page.waitForTimeout(2000);

    // Reload the drafts list to see the saved draft
    await page.getByRole('link', { name: 'Drafts' }).click();
    await page.waitForTimeout(2000);

    // Delete the draft from the list
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Delete' }).first().click();
    await page.waitForTimeout(2000);
  });
});
