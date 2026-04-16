const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://app.grabdocs.com/login?redirect=%2F');
  console.log('======================================');
  console.log('Log in manually in the browser');
  console.log('Wait until you are on the dashboard');
  console.log('Then press ENTER here');
  console.log('======================================');
  process.stdin.once('data', async () => {
    await context.storageState({ path: 'auth.json' });
    console.log('auth.json saved successfully');
    await browser.close();
    process.exit();
  });
})();
