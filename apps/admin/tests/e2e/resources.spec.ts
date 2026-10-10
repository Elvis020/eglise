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

test('keeps resources staff-curated while allowing an existing link to be recorded', async ({
  page
}) => {
  await page.goto('/resources');

  await expect(page.getByRole('link', { name: 'Resources' })).toHaveAttribute(
    'aria-current',
    'page'
  );
  await expect(page.getByRole('heading', { name: 'Staff curation only, for now' })).toBeVisible();
  await expect(
    page.getByText('Eglise does not replace the church’s Telegram or WhatsApp channels.')
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No resources have been added' })).toBeVisible();

  await page.getByRole('link', { name: 'Add resource' }).first().click();
  await page.getByLabel('Title').fill('Sunday teaching notes');
  await page.getByLabel('Existing link').fill('https://t.me/eglise-test');
  await page.getByRole('button', { name: 'Add resource' }).click();

  await expect(page).toHaveURL(/\/resources$/);
  await expect(page.getByRole('cell', { name: 'Church note' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open link' })).toHaveAttribute(
    'href',
    'https://t.me/eglise-test'
  );
});

test('keeps the resource register within a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/resources');

  const layout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth
  }));

  expect(layout.documentWidth).toBe(layout.viewportWidth);
});
