const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: 'auth.json' });
  const page = await context.newPage();

  await page.goto('https://app.grabdocs.com/workspaces');
  await page.waitForTimeout(2000);

  let count = 0;

  while (true) {
    const deleteBtn = page.getByRole('button', { name: 'Delete Workspace' }).first();

    // Check if any delete buttons remain
    if (!(await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      break;
    }

    // Accept the confirmation dialog
    page.once('dialog', dialog => dialog.accept());

    await deleteBtn.click();
    await page.waitForTimeout(1500);
    count++;
  }

  console.log(`Deleted ${count} workspace(s).`);
  await browser.close();
  process.exit(0);
})();
