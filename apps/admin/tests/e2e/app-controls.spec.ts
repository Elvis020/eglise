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

for (const width of [390, 960, 1440]) {
  test(`uses in-app controls and ordered mobile navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/welfare');
    await expect(page.locator('.sidebar').getByText('Ama Owusu', { exact: true })).toHaveCount(1);
    const navigation = page.getByRole('navigation', { name: 'Mobile quick navigation' });

    if (width <= 960) {
      await expect(navigation.locator('button, a')).toHaveText(['Back', 'Home', 'Settings']);
      const home = await navigation.getByRole('link', { name: 'Home', exact: true }).boundingBox();
      const back = await navigation
        .getByRole('button', { name: 'Back', exact: true })
        .boundingBox();
      const settings = await navigation
        .getByRole('link', { name: 'Settings', exact: true })
        .boundingBox();

      expect(home!.x + home!.width / 2).toBeCloseTo(width / 2, 0);
      expect(back!.x).toBeLessThan(home!.x);
      expect(settings!.x).toBeGreaterThan(home!.x);
      // Exercise the layout with the role-conditional Settings slot absent.
      await navigation.getByRole('link', { name: 'Settings', exact: true }).evaluate((link) => {
        link.style.display = 'none';
      });
      const centeredHome = await navigation
        .getByRole('link', { name: 'Home', exact: true })
        .boundingBox();

      expect(centeredHome!.x + centeredHome!.width / 2).toBeCloseTo(width / 2, 0);
      await navigation.locator('.mobile-quick-settings').evaluate((link) => {
        (link as HTMLElement).style.removeProperty('display');
      });
    } else {
      await expect(navigation).not.toBeVisible();
    }

    await expect(page.locator('select, input[type="date"]')).toHaveCount(0);
    const status = page.getByRole('combobox', { name: 'Payment status' });

    await status.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await status.press('End');
    await status.press('Escape');
    await expect(status).toBeFocused();
    await expect(status).toHaveText('All payments');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await status.click();
    await page.getByRole('option', { name: 'Paid', exact: true }).click();
    await expect(status).toHaveText('Paid');
    await status.click();
    if (width <= 960) {
      const menu = await page.getByRole('listbox').boundingBox();
      const nav = await navigation.boundingBox();

      expect(menu!.y + menu!.height).toBeLessThanOrEqual(nav!.y);
    }
    await page.screenshot({ path: `test-results/app-controls-${width}.png`, fullPage: true });
    await status.press('Escape');
    await page.getByRole('button', { name: 'Open calendar', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Calendar', exact: true })).toBeVisible();
  });
}

test('calendar period selection updates the report URL through the in-app menu', async ({
  page
}) => {
  await page.goto('/reports?period=month&date=2026-10-11');
  await expect(page.locator('.sidebar').getByText('Ama Owusu', { exact: true })).toHaveCount(1);
  await expect(page.locator('select, input[type="date"]')).toHaveCount(0);
  const period = page.getByRole('combobox', { name: 'Reporting period' });

  await period.click();
  await page.getByRole('option', { name: 'Calendar week' }).click();
  await expect(page).toHaveURL(/period=week&date=2026-10-11/);
  await expect(period).toHaveText('Calendar week');
});

test('custom welfare dropdown-only edits trigger the unsaved guard', async ({ page }) => {
  await page.goto('/welfare/new');
  await expect(page.locator('.sidebar').getByText('Ama Owusu', { exact: true })).toHaveCount(1);
  await expect(page.locator('select, input[type="date"]')).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Repeat', exact: true }).click();
  await page.getByRole('option', { name: 'Weekly', exact: true }).click();
  await page.getByRole('link', { name: 'Cancel', exact: true }).click();
  const confirmation = page.getByRole('dialog', { name: 'Leave without saving?' });

  await expect(confirmation).toBeVisible();
  await confirmation.getByRole('button', { name: 'Keep editing' }).click();
  await expect(page.getByRole('combobox', { name: 'Repeat', exact: true })).toHaveText('Weekly');
  await page.getByRole('combobox', { name: 'Support type' }).click();
  await page.getByRole('option', { name: 'Emergency assistance', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Repeat', exact: true })).toHaveCount(0);
});
