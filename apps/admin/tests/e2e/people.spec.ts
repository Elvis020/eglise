import { expect, test } from '@playwright/test';

test('shows the fictional people directory and shared account boundary', async ({ page }) => {
  await page.goto('/people');

  await expect(page.getByRole('heading', { name: 'People directory' })).toBeVisible();
  await expect(page.getByText('Shared pilot account')).toBeVisible();
  await expect(page.getByText('Ama Owusu')).toBeVisible();
});

test('ships a standalone offline document without app bundles', async ({ request }) => {
  const response = await request.get('/offline.html');
  const document = await response.text();

  expect(response.ok()).toBe(true);
  expect(document).toContain('This pilot needs a connection');
  expect(document).not.toContain('<script');
  expect(document).not.toContain('/_app/');
});

test('adds an eligible fictional person without showing their date of birth', async ({ page }) => {
  await page.goto('/people/add');

  await page.getByLabel('Full name').fill('Esi Addo');
  await page.getByLabel('Phone number').fill('+233 24 555 0167');
  await page.getByLabel('Neighbourhood').fill('Osu');
  await page.getByLabel('Date of birth').fill('2000-01-01');
  await page.getByRole('button', { name: 'Save person' }).click();

  await expect(page.getByText('Person saved. Their date of birth was discarded')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Esi Addo' })).toBeVisible();
  await expect(page.getByText('2000-01-01')).not.toBeVisible();
});

test('requires an explicit possible-duplicate import decision', async ({ page }) => {
  await page.goto('/people/import');

  const confirm = page.getByRole('button', { name: 'Confirm reviewed import' });

  await expect(confirm).toBeDisabled();

  await page.getByLabel('Exclude row').check();
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page.getByRole('heading', { name: 'Confirm reviewed import' })).toBeVisible();
  await page.getByRole('button', { name: 'Create fictional people' }).click();

  await expect(
    page.getByText('3 fictional people imported. Invalid rows were excluded.')
  ).toBeVisible();
  await expect(page.getByText('Nana Badu')).toBeVisible();
});

test('records then corrects a membership record with a removal note', async ({ page }) => {
  await page.goto('/people/kojo-boateng');

  await page.getByRole('button', { name: 'Record membership' }).click();
  await page.getByLabel('Recognition evidence or reference').fill('Recognition register, 2026');
  await page.getByLabel('Recognition date').fill('2026-09-30');
  await page.getByRole('button', { name: 'Save membership record' }).click();
  await expect(page.getByText('Membership record saved.')).toBeVisible();

  await page.getByRole('button', { name: 'Correct membership' }).click();
  await page.getByLabel('Membership record').selectOption({ label: 'Not recorded' });
  await page.getByLabel('Correction note').fill('Recorded against the wrong fictional person.');
  await page.getByRole('button', { name: 'Save membership record' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm membership correction' })).toBeVisible();
  await page.getByRole('button', { name: 'Mark as not recorded' }).click();

  await expect(page.getByText('Membership correction saved.')).toBeVisible();
  await expect(page.getByText('Recorded against the wrong fictional person.')).toBeVisible();
});

test('asks before leaving a dirty fictional entry', async ({ page }) => {
  await page.goto('/people/add');

  await page.getByLabel('Full name').fill('Unsaved Person');
  await page.getByRole('link', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Leave unsaved entry?' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep editing' }).click();

  await expect(page.getByLabel('Full name')).toHaveValue('Unsaved Person');
});

test('registers a PWA worker and redirects an offline navigation to the standalone explanation', async ({
  page,
  context
}) => {
  await page.goto('/people');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true);

  const cachedUrls = await page.evaluate(async () => {
    const cacheNames = await caches.keys();
    const cache = await caches.open(
      cacheNames.find((name) => name.startsWith('eglise-shell-')) ?? ''
    );
    const requests = await cache.keys();

    return requests.map((request) => new URL(request.url).pathname);
  });

  expect(cachedUrls).toContain('/offline.html');
  expect(cachedUrls).not.toContainEqual(expect.stringMatching(/^\/_app\//));

  await context.setOffline(true);
  await page.goto('/people');

  await expect(page).toHaveURL(/offline\.html$/);
  await expect(page.getByRole('heading', { name: 'This pilot needs a connection' })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/offline\.html$/);
  await expect(page.getByRole('heading', { name: 'This pilot needs a connection' })).toBeVisible();
  await context.setOffline(false);
});
