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

test('records a synthetic Care School topic without creating participant or clinic records', async ({
  page
}) => {
  await page.goto('/care-school');

  await expect(page.getByRole('link', { name: 'Care School' })).toHaveAttribute(
    'aria-current',
    'page'
  );
  await expect(page.getByRole('heading', { name: 'Programme topics only, for now' })).toBeVisible();

  await page.getByRole('link', { name: 'Add topic' }).first().click();
  await page.getByLabel('Topic', { exact: true }).fill('Foundations of care and prayer');
  await page.getByLabel('Possible next step').fill('Agree who should facilitate this topic.');
  await page.getByRole('button', { name: 'Add topic' }).click();

  await expect(page).toHaveURL(/\/care-school$/);
  await expect(page.getByRole('row', { name: /Foundations of care and prayer/ })).toBeVisible();
  await expect(page.getByText(/not a participant record.*clinic workflow/i)).toBeVisible();
});

test('keeps the Care School topic register within a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/care-school');

  const layout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth
  }));

  expect(layout.documentWidth).toBe(layout.viewportWidth);
});
