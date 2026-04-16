/**
 * GrabDocs Authentication 
 * Group 5 - Playwright Testing
 * 
 * This script opens a browser for manual login.
 * After login, it saves the session to auth.json so tests
 * can run without re-authenticating each time.
 * 
 * Usage: node save-auth.js
 */

const { chromium } = require('@playwright/test');

(async () => {
  // Launch a visible browser for manual login
  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to GrabDocs login page
  await page.goto('https://app.grabdocs.com/login?redirect=%2F');

  console.log('Log in manually in the browser');
  console.log('Wait until you are on the dashboard');
  console.log('Then press ENTER here');

  // Wait for user to complete login + 2FA, then save session
  process.stdin.once('data', async () => {
    await context.storageState({ path: 'auth.json' });
    console.log('auth.json saved successfully');
    await browser.close();
    process.exit();
  });
})();
