import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'eglise-prototype-session-v1',
      JSON.stringify({
        administrator: { email: 'admin@eglise.test', name: 'Ama Owusu' },
        churchName: 'Eglise',
        signedIn: true,
        version: 1
      })
    );
  });
});

test('adds a visitor, checks them in and carries the calendar filter into a PDF report', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/attendance/sample-sunday-service');
  await expect(page.locator('.sidebar').getByText('Ama Owusu', { exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Add person and check in' }).click();
  await page.getByLabel('Full name').fill('Mobile Visitor');
  await page.getByRole('button', { name: 'Save and check in' }).click();
  await expect(page.locator('#phone-error')).not.toBeEmpty();
  await page.getByLabel('Phone number').fill('024 555 0199');
  await page.getByRole('button', { name: 'Save and check in' }).click();
  await expect(page.getByRole('button', { name: 'Undo check-in', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Attendance', exact: true }).click();
  await page.getByLabel('Date within period', { exact: true }).fill('05/10/2026');
  await page.getByLabel('Date within period', { exact: true }).press('Tab');
  await page.getByRole('link', { name: /Total attendance/ }).click();
  await expect(page).toHaveURL(/reports\?period=month&date=2026-10-05/);
  await page.getByText('1 attendees', { exact: true }).click();
  await expect(page.getByText('Mobile Visitor', { exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', { name: 'Download PDF' }).click();
  const download = await downloadPromise;

  await download.saveAs('test-results/attendance-report.pdf');
  const file = await download.path();
  const bytes = await readFile(file!);

  expect(bytes.subarray(0, 8).toString()).toBe('%PDF-1.4');
  expect(download.suggestedFilename()).toBe('attendance-2026-10-01-2026-10-31.pdf');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  await page.screenshot({ path: 'test-results/attendance-mobile.png', fullPage: true });
});

test('keeps quick navigation on forms and uses browser history', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/people');
  const quick = page.getByRole('navigation', { name: 'Mobile quick navigation' });

  await quick.getByRole('link', { name: 'Settings' }).click();
  await quick.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(/\/people$/);
  await page.getByRole('button', { name: 'Open application navigation' }).click();
  await expect(quick).toHaveCount(0);
  await page.getByRole('button', { name: 'Close application navigation' }).click();
  await expect(quick).toBeVisible();
  await page.getByRole('link', { name: 'Add person', exact: true }).click();
  await expect(quick).toBeVisible();
});

test('shows the mobile loading film until navigation settles', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/people');
  await expect(page.locator('.sidebar').getByText('Ama Owusu', { exact: true })).toHaveCount(1);
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route('**/settings/__data.json*', async (route) => {
    await gate;
    await route.continue();
  });
  const navigation = page
    .getByRole('navigation', { name: 'Mobile quick navigation' })
    .getByRole('link', { name: 'Settings' })
    .click();

  await expect(page.locator('.mobile-route-overlay')).toBeVisible();
  release();
  await navigation;
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.locator('.mobile-route-overlay')).toHaveCount(0);
});
