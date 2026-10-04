import { expect, test } from '@playwright/test';

const storageKey = 'eglise-prototype-session-v1';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.evaluate((key) => window.localStorage.removeItem(key), storageKey);
});

test('creates a prototype administrator, preserves the workspace, and logs out', async ({
  page
}) => {
  await page.goto('/signup');

  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Account setup progress' })).toBeVisible();
  await expect(page.getByLabel('Church name')).toHaveCount(0);
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByLabel('Password')).toHaveCount(0);

  await page.getByLabel('Full name').fill('Ama Owusu');
  await page.getByLabel('Email address').fill('ama@church.org');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByText('2 Access')).toHaveAttribute('aria-current', 'step');
  await expect(page.getByText('Ama Owusu', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByLabel('Full name')).toHaveValue('Ama Owusu');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Password').fill('prototype-password');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/people$/);
  await expect(page.locator('#application-sidebar')).toContainText('Ama Owusu');
  await expect(page.locator('.administrator-avatar')).toBeVisible();

  const storedWorkspace = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    storageKey
  );

  expect(storedWorkspace).toContain('ama@church.org');
  expect(storedWorkspace).not.toContain('prototype-password');

  await page.reload();
  await expect(page).toHaveURL(/\/people$/);
  await expect(page.locator('#application-sidebar')).toContainText('Ama Owusu');

  await page.getByRole('link', { name: 'Church settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await page.getByLabel('Church name').fill('Grace Fellowship');
  await page.getByRole('button', { name: 'Save church name' }).click();

  await expect(page.locator('[data-sonner-toast]')).toContainText('Church name saved.');
  await expect(page.locator('#application-sidebar')).toContainText('Grace Fellowship');

  await page.getByRole('button', { name: 'Open administrator menu' }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

  await page.getByLabel('Email address').fill('ama@church.org');
  await page.getByLabel('Password').fill('another-password');
  await page.getByRole('button', { name: 'Sign in to workspace' }).click();

  await expect(page).toHaveURL(/\/people$/);
  await expect(page.locator('#application-sidebar')).toContainText('Grace Fellowship');
  await expect(page.locator('#application-sidebar')).toContainText('Ama Owusu');
});

test('keeps the authentication flow usable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect(page.getByText('Administrator access', { exact: true })).toBeVisible();
  await expect(page.getByText('Sign in to manage people and membership.')).toBeVisible();
  await expect(page.getByText('Your password is not checked or stored.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create one' })).toHaveCSS('min-height', '44px');

  const layout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth
  }));

  expect(layout.documentWidth).toBe(layout.viewportWidth);
});

test('keeps authentication validation beneath the affected field', async ({ page }) => {
  await page.goto('/login');

  const email = page.getByLabel('Email address');
  const error = page.locator('#auth-email-error');

  await email.fill('not-an-email');
  await page.getByLabel('Password').fill('prototype-password');
  await page.getByRole('button', { name: 'Sign in to workspace' }).click();

  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(error).toHaveText('Enter a valid email address.');
  await expect(error).toHaveCSS('color', 'rgb(168, 69, 53)');
  await expect(error).toHaveCSS('font-size', '12px');

  const [emailBox, errorBox] = await Promise.all([email.boundingBox(), error.boundingBox()]);

  expect(emailBox).not.toBeNull();
  expect(errorBox).not.toBeNull();

  if (emailBox && errorBox) {
    expect(errorBox.y).toBeGreaterThanOrEqual(emailBox.y + emailBox.height);
    expect(errorBox.height).toBeLessThanOrEqual(15);
  }

  await email.fill('admin@church.org');
  await expect(email).not.toHaveAttribute('aria-invalid', 'true');
  await expect(error).toBeEmpty();
});
