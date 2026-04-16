# GrabDocs Playwright Testing — Group 5

## Before Running Tests

GrabDocs uses (2FA) which cant be automated. You must log in once before running any tests.


### Step 1 — Generate your login session:
```bash
node save-auth.js
```

A browser window will open to the GrabDocs login page. Do the following:

1. Enter your GrabDocs email and password
2. Enter the 2FA verification code from your authenticator app
3. Check "Remember me" if available
4. Wait until the dashboard loads (URL shows `/upload`)
5. Go back to the terminal and press **ENTER**

This saves your session to `auth.json`. All tests will use this file to skip login automatically.

If your session expires, just re-run `node save-auth.js` to get a fresh one.

### Step 2 — Run the tests:
```bash
npx playwright test --headed --workers=1
```

### Step 3 — View results:
```bash
npx playwright show-report
```
