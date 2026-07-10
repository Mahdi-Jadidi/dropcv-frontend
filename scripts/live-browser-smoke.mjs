import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium } from '@playwright/test';
import {
  LIVE_BACKEND_ORIGIN,
  LIVE_FRONTEND_API_BASE,
  LIVE_FRONTEND_ORIGIN,
  resolveLiveUrl,
} from './live-targets.mjs';

function findBrowserExecutable() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROME_PATH,
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA || ''}\\Google\\Chrome\\Application\\chrome.exe`,
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    `${process.env.LOCALAPPDATA || ''}\\Microsoft\\Edge\\Application\\msedge.exe`,
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate));
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    const executablePath = findBrowserExecutable();
    if (executablePath) {
      return chromium.launch({ headless: true, executablePath });
    }

    throw error;
  }
}

const browser = await launchBrowser();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1200 },
});
const page = await context.newPage();
const pageErrors = [];
const consoleErrors = [];
const runId = Date.now().toString(36);
const slug = `qa-smoke-${runId}`;
const email = `${slug}@test.drop.cv`;
const password = 'Password123!';
const fullName = 'QA Smoke Tester';

page.on('pageerror', (error) => {
  pageErrors.push(error.message);
});

page.on('console', (message) => {
  if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) {
    consoleErrors.push(message.text());
  }
});

async function expectNoRuntimeErrors(label) {
  assert.equal(pageErrors.length, 0, `${label} should not throw a page error: ${pageErrors.join(' | ')}`);

  if (consoleErrors.length > 0) {
    console.log(`${label} logged console errors: ${consoleErrors.join(' | ')}`);
  }
}

try {
  await page.goto(resolveLiveUrl(LIVE_FRONTEND_ORIGIN, '/'), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('a[href="signup.html"]');
  await page.waitForFunction(
    (expectedApiBase) => window.dropCVConfig && window.dropCVConfig.apiBaseUrl === expectedApiBase,
    LIVE_FRONTEND_API_BASE,
  );
  await page.waitForFunction(() => {
    const amount = document.querySelector('[data-dropcv-plan-amount="Standard"]');
    return amount && !/loading price/i.test(amount.textContent || '');
  });
  await expectNoRuntimeErrors('Homepage');

  const homeConfig = await page.evaluate(() => window.dropCVConfig?.apiBaseUrl || '');
  assert.equal(homeConfig, LIVE_FRONTEND_API_BASE, 'Homepage should point at the live frontend proxy base');

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.locator('a[href="signup.html"]').first().click(),
  ]);
  assert.ok(page.url().includes('/signup.html'), 'Signup link should navigate to the signup page');
  await page.waitForSelector('section[data-step="1"] button[data-plan="Premium"]');
  await page.waitForFunction(
    (expectedApiBase) => window.dropCVConfig && window.dropCVConfig.apiBaseUrl === expectedApiBase,
    LIVE_FRONTEND_API_BASE,
  );
  await page.locator('section[data-step="1"] button[data-plan="Premium"]').click();
  await page.locator('section[data-step="1"] button[data-next]').click();
  await page.waitForSelector('#fullName');
  await expectNoRuntimeErrors('Signup step 2');

  await page.locator('#fullName').fill(fullName);
  await page.locator('#slug').fill(slug);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#passwordToggle').click();
  assert.equal(await page.locator('#password').getAttribute('type'), 'text', 'Password toggle should reveal the password');
  await page.locator('#passwordToggle').click();
  assert.equal(await page.locator('#password').getAttribute('type'), 'password', 'Password toggle should hide the password again');

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.locator('a[href="login.html"]').first().click(),
  ]);
  assert.ok(page.url().includes('/login.html'), 'Login link should navigate to the login page');
  await page.waitForSelector('#form');
  await page.waitForFunction(
    (expectedApiBase) => window.dropCVConfig && window.dropCVConfig.apiBaseUrl === expectedApiBase,
    LIVE_FRONTEND_API_BASE,
  );
  await page.locator('#email').fill('qa-smoke@example.com');
  await page.locator('#password').fill('Password123!');
  const loginPageText = await page.locator('body').innerText();
  assert.ok(
    !/magic\s*link|passwordless|email me a link|send me a link/i.test(loginPageText),
    'Login page should not advertise a magic-link flow',
  );
  assert.equal(await page.locator('input[type="password"]').count(), 1, 'Login page should require a password field');
  await expectNoRuntimeErrors('Login page');

  await page.goto(resolveLiveUrl(LIVE_FRONTEND_ORIGIN, '/signup.html'), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await waitForFrontendBoot(page);
  await page.waitForSelector('section[data-step="1"] button[data-plan="Premium"]');
  await page.locator('section[data-step="1"] button[data-plan="Premium"]').click();
  await page.locator('section[data-step="1"] button[data-next]').click();
  await page.waitForSelector('#registerBtn');
  await page.locator('#fullName').fill(fullName);
  await page.locator('#slug').fill(slug);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);

  await Promise.all([
    page.waitForURL('**/dashboard-premium.html', { waitUntil: 'domcontentloaded', timeout: 60000 }),
    page.locator('#registerBtn').click(),
  ]);
  assert.ok(page.url().includes('/dashboard-premium.html'), 'Signup should redirect to the premium dashboard');
  await page.waitForSelector('.sign-out-link');

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null),
    page.locator('.sign-out-link').click(),
  ]);

  await page.goto(resolveLiveUrl(LIVE_FRONTEND_ORIGIN, '/login.html'), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForSelector('#form');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);

  await Promise.all([
    page.waitForURL('**/dashboard-premium.html', { waitUntil: 'domcontentloaded', timeout: 60000 }),
    page.locator('#submit').click(),
  ]);
  assert.ok(page.url().includes('/dashboard-premium.html'), 'Login should redirect to the premium dashboard');

  console.log('Live browser smoke passed: homepage, signup redirect, login page, and dashboard login all loaded cleanly.');
} finally {
  await context.close();
  await browser.close();
}
