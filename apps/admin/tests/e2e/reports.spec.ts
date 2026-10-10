import { expect, test } from '@playwright/test';

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

test('keeps reports source-labelled and excludes open attendance events', async ({ page }) => {
  await page.goto('/reports');

  await expect(page.getByRole('heading', { name: 'Attendance reporting' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Reports' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByText('Read each source on its own')).toBeVisible();
  await expect(
    page.getByText('Do not add individual check-ins and manual headcounts together.')
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'No completed events in this view' })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: '1 open event' })).toBeVisible();

  const period = page.getByRole('combobox', { name: 'Reporting period' });

  await expect(period).toBeVisible();
  await period.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('option', { name: 'All completed events' })).toBeVisible();
  await expect(
    page.getByRole('option', { name: 'Latest 30 days of completed events' })
  ).toBeVisible();
  await period.press('Escape');
  await expect(page.getByRole('listbox')).not.toBeVisible();
});

test('keeps report detail usable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/reports');

  const layout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth
  }));

  expect(layout.documentWidth).toBe(layout.viewportWidth);
});
