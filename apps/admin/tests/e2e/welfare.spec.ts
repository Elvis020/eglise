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

for (const width of [390, 1440]) {
  test(`records contributions and recurring payments at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/welfare');
    await page.getByRole('link', { name: 'Add contribution', exact: true }).click();
    await page.getByLabel('Find a person').fill('Ama');
    await page.getByRole('button', { name: /Ama Owusu/ }).click();
    await page.getByLabel('Contribution description').fill('October welfare collection');
    await page.getByLabel('Amount (GHS)').fill('125.50');
    await page.getByRole('button', { name: 'Save contribution' }).click();
    await expect(page.getByRole('row', { name: /Ama Owusu/ })).toContainText('125.50');
    await page.getByRole('link', { name: 'Add welfare', exact: true }).click();
    await page.getByLabel('Find a person').fill('Ama');
    await page.getByRole('button', { name: /Ama Owusu/ }).click();
    await page.getByLabel('Support name').fill('Monthly support');
    await page.getByLabel('Amount (GHS) per payment').fill('100');
    await page.getByLabel('First payment due', { exact: true }).fill('01/01/2026');
    await page.getByLabel('First payment due', { exact: true }).press('Tab');
    await page.getByLabel('Schedule end date', { exact: true }).fill('01/12/2026');
    await page.getByLabel('Schedule end date', { exact: true }).press('Tab');
    await page.getByRole('button', { name: 'Save welfare', exact: true }).click();
    await expect(page.getByText('Outstanding · due but unpaid')).toBeVisible();
    const firstPayment = page.getByRole('button', {
      name: /Mark Monthly support.*2026-01-01 paid/
    });

    await firstPayment.click();
    await expect(firstPayment).toHaveCount(0);
    await expect(page.getByRole('row', { name: /Ama Owusu.*2026-01-01/ })).toContainText('Paid');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    await page.screenshot({ path: `test-results/welfare-${width}.png`, fullPage: true });
  });
}

test('guards calendar-only edits and preserves the form when cancelled', async ({ page }) => {
  await page.goto('/welfare/new');
  await expect(page.locator('.sidebar').getByText('Ama Owusu', { exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Open calendar' }).first().click();
  await page.locator('.eglise-date-picker-grid button:not([disabled])').first().click();
  await page.getByRole('link', { name: 'Cancel', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Leave without saving?' });

  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Keep editing' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(/\/welfare\/new$/);
});

test('adds a contributor inline and records emergency assistance', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/welfare/new?category=contributions');
  await expect(page.locator('.sidebar').getByText('Ama Owusu', { exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Add person', exact: true }).click();
  await page.getByLabel('Full name').fill('Ama Owusu');
  await page.getByLabel('Phone number').fill('024 555 0188');
  await page.getByRole('button', { name: 'Save person', exact: true }).click();
  await expect(page.getByText('Possible existing person: Ama Owusu')).toBeVisible();
  await page.getByLabel('Full name').fill('New Contributor');
  await page.getByRole('button', { name: 'Save person', exact: true }).click();
  await expect(page.getByText('New Contributor', { exact: true })).toBeVisible();
  await page.getByLabel('Contribution description').fill('Welfare fund');
  await page.getByLabel('Amount (GHS)', { exact: true }).fill('50');
  await page.getByRole('button', { name: 'Save contribution' }).click();
  await expect(page.getByRole('row', { name: /New Contributor/ })).toContainText('50.00');
  await page.getByRole('link', { name: 'Add welfare', exact: true }).click();
  await page.getByRole('combobox', { name: 'Support type' }).click();
  await page.getByRole('option', { name: 'Emergency assistance', exact: true }).click();
  await page.getByLabel('Find a person').fill('New Contributor');
  await page.getByRole('button', { name: /New Contributor/ }).click();
  await page.getByLabel('Support name').fill('Emergency support');
  await page.getByLabel('Amount (GHS)', { exact: true }).fill('20');
  await page.getByRole('button', { name: 'Save welfare' }).click();
  await expect(page.getByRole('row', { name: /New Contributor/ })).toContainText('20.00');
});
