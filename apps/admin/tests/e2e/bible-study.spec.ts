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

test('records synthetic study material without creating learner information', async ({ page }) => {
  await page.goto('/bible-study');

  await expect(page.getByRole('link', { name: 'Bible Study' })).toHaveAttribute(
    'aria-current',
    'page'
  );
  await expect(
    page.getByRole('heading', { name: 'Materials only, not learner records' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'No study material has been recorded' })
  ).toBeVisible();

  await page.getByRole('link', { name: 'Add material' }).first().click();
  await page.getByLabel('Material title').fill('Hope in difficult seasons');
  await page.getByLabel('Sermon or source reference').fill('Sunday sermon — Pastor Ama');
  await page.getByRole('button', { name: 'Add material' }).click();

  await expect(page).toHaveURL(/\/bible-study$/);
  await expect(page.getByRole('row', { name: /Hope in difficult seasons/ })).toContainText(
    'Study outline'
  );
  await expect(
    page.getByText(/enrol people|record attendance|grant facilitator access/i)
  ).toBeVisible();
});

test('keeps the Bible Study register within a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/bible-study');

  const layout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth
  }));

  expect(layout.documentWidth).toBe(layout.viewportWidth);
});
