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

test('records synthetic welfare governance questions without collecting welfare data', async ({
  page
}) => {
  await page.goto('/welfare');

  await expect(page.getByRole('link', { name: 'Welfare' })).toHaveAttribute('aria-current', 'page');
  await expect(
    page.getByRole('heading', { name: 'No financial or personal welfare records' })
  ).toBeVisible();

  await page.getByRole('link', { name: 'Add discovery item' }).first().click();
  await page.getByLabel('Topic').fill('Approval for recurring support');
  await page
    .getByLabel('Decision needed')
    .fill('Define the people who can request, approve, and correct recurring support.');
  await page.getByRole('button', { name: 'Add discovery item' }).click();

  await expect(page).toHaveURL(/\/welfare$/);
  await expect(page.getByRole('row', { name: /Approval for recurring support/ })).toContainText(
    'Contributions received'
  );
  await expect(
    page.getByText(/cannot record contributors, recipients, support amounts/i)
  ).toBeVisible();
});

test('keeps the Welfare discovery register within a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/welfare');

  const layout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth
  }));

  expect(layout.documentWidth).toBe(layout.viewportWidth);
});
