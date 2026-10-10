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

test('keeps announcements as an explicit discovery area', async ({ page }) => {
  await page.goto('/announcements');

  await expect(page.getByRole('link', { name: 'Announcements' })).toHaveAttribute(
    'aria-current',
    'page'
  );
  await expect(
    page.getByRole('heading', { name: 'No publishing workflow has been agreed yet' })
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Review resources' })).toHaveAttribute(
    'href',
    '/resources'
  );
});

test('records a synthetic announcement draft without sending it', async ({ page }) => {
  await page.goto('/announcements');

  await page.getByLabel('Title').fill('Prayer meeting reminder');
  await page
    .getByLabel('Short message')
    .fill('A synthetic notice for the church community to review together.');
  await page.getByLabel('Intended audience').click();
  await page.getByRole('option', { name: 'Recognised members' }).click();
  await page.getByRole('button', { name: 'Save draft' }).click();

  await expect(page.getByText('Draft announcement added. Nothing has been sent.')).toBeVisible();
  await expect(page.getByRole('listitem').first()).toContainText('Prayer meeting reminder');
  await expect(page.getByRole('listitem').first()).toContainText('Recognised members');
});
