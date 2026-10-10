import { expect, test } from '@playwright/test';
import writeXlsxFile from 'write-excel-file/node';

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

test('imports approved workbook rows while excluding invalid rows', async ({ page }) => {
  const workbook = writeXlsxFile(
    [
      ['Full name', 'Person type', 'Phone number', 'Neighbourhood', 'Date of birth'],
      ['Nana Badu', 'Person', '024 555 0142', 'Osu', new Date('1990-01-01')],
      ['Ama Owusu', 'Visitor', '', 'Adabraka', new Date('1990-01-01')],
      ['Kweku Lamptey', 'Person', '024 555 0142', 'Madina', new Date('2015-01-01')]
    ],
    { dateFormat: 'dd/mm/yyyy' }
  );
  const buffer = await workbook.toBuffer();

  await page.goto('/people/import');
  await page.getByLabel('2. Upload completed workbook').setInputFiles({
    name: 'people-v1.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer
  });

  await expect(page.getByRole('heading', { name: 'Review workbook rows' })).toBeVisible();
  await expect(page.getByText('Age requirements were not met.')).toBeVisible();
  await expect(page.locator('.import-review')).not.toContainText('2015-01-01');
  await page.getByLabel('Create separately').check();
  await page.getByRole('button', { name: 'Confirm import' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm import' })).toBeVisible();
  await page.getByRole('button', { name: 'Create people' }).click();

  await expect(page.getByText('Import complete')).toBeVisible();
  await expect(
    page.getByText(
      'Created 2 people. Excluded 1 row was not added. Deferred 0 rows need later review.'
    )
  ).toBeVisible();
});

test('lets a possible duplicate be deferred without creating or merging it', async ({ page }) => {
  const workbook = writeXlsxFile(
    [
      ['Full name', 'Person type', 'Phone number', 'Neighbourhood', 'Date of birth'],
      ['Ama Owusu', 'Visitor', '', 'Adabraka', new Date('1990-01-01')]
    ],
    { dateFormat: 'dd/mm/yyyy' }
  );
  const buffer = await workbook.toBuffer();

  await page.goto('/people/import');
  await page.getByLabel('2. Upload completed workbook').setInputFiles({
    name: 'possible-duplicate.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer
  });

  await expect(page.getByText('Compare with Ama Owusu')).toBeVisible();
  await page.getByLabel('Defer for later review').check();
  await page.getByRole('button', { name: 'Confirm import' }).click();
  await page.getByRole('button', { name: 'Create people' }).click();

  await expect(
    page.getByText(
      'Created 0 people. Excluded 0 rows were not added. Deferred 1 row needs later review.'
    )
  ).toBeVisible();
});

test('shows the people directory without the removed shared-prototype banner', async ({ page }) => {
  await page.goto('/people');

  await expect(page.getByRole('heading', { name: 'People directory' })).toBeVisible();
  const pilotContext = page.getByLabel('Shared prototype limitations');

  await expect(pilotContext).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Open Ama Owusu' })).toBeVisible();
  await expect(page.locator('.people-directory th')).toHaveCount(4);
  await expect(page.locator('.people-directory th[scope="col"]')).toHaveCount(4);
});

test('uses directory totals as working type filters', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/people');

  const summary = page.getByRole('region', { name: 'Directory filters' });
  const next = page.getByRole('button', { name: 'Next' });

  await expect(summary).toBeVisible();
  await expect(summary.locator('[data-summary="directory"]')).toContainText('Total people');
  await expect(
    summary.locator('[data-summary="directory"]').getByText('25', { exact: true })
  ).toBeVisible();
  await expect(summary.locator('[data-summary="visitors"]')).toContainText('Visitors');
  await expect(summary.locator('[data-summary="first-timers"]')).toContainText('First-timers');
  const heatmap = summary.locator('[data-summary="neighbourhood-heatmap"]');

  await expect(heatmap).toBeDisabled();
  await expect(heatmap).toContainText('Neighbourhood heatmap');
  await expect(heatmap).toContainText('Coming soon');

  await next.click();
  await expect(page.getByText('Showing 11–20 of 25 records')).toBeVisible();
  await expect(page.getByText('Page 2 of 3')).toBeVisible();

  const membership = page.getByRole('combobox', { name: 'Membership' });

  await membership.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');

  await expect(page.locator('.people-directory tbody tr')).toHaveCount(10);
  await expect(page.getByText('Showing 1–10 of 16 records')).toBeVisible();
  await expect(page.getByText('Page 1 of 2')).toBeVisible();
  await expect(membership).toHaveText('Not members');
  await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(summary.locator('[data-summary="directory"]')).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(page.getByRole('combobox', { name: 'Membership' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Clear filters' })).toHaveCount(0);

  const pageLayout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth
  }));

  expect(pageLayout.documentWidth).toBe(pageLayout.viewportWidth);
});

test('uses a decorative profile placeholder beside each visible person name', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/people');

  const avatars = page.locator('.people-directory .person-avatar');

  await expect(avatars).toHaveCount(10);
  await expect(avatars.first()).toHaveAttribute('aria-hidden', 'true');
  expect(await avatars.first().textContent()).toBe('');
  await expect(page.getByRole('link', { name: 'Open Ama Owusu' })).toBeVisible();
});

test('opens a person record from the whole directory row', async ({ page }) => {
  await page.goto('/people');

  const amaRow = page.getByRole('link', { name: 'Open Ama Owusu' });

  await amaRow.click();
  await expect(page).toHaveURL(/\/people\/ama-owusu$/);
  await expect(page.getByRole('heading', { name: 'Ama Owusu' })).toBeVisible();
});

test('uses a profile placeholder and a quiet bottom membership note on person records', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/people/kojo-boateng');

  const detailPage = page.locator('.person-detail-page');
  const avatar = detailPage.locator('.person-heading .person-avatar');
  const note = detailPage.locator('.membership-note');

  await expect(avatar).toHaveAttribute('aria-hidden', 'true');
  await expect(avatar).toHaveCSS('width', '72px');
  await expect(page.getByText('Not a member', { exact: true })).toBeVisible();
  await expect(page.locator('.person-summary .status')).toHaveCount(0);
  await expect(note).toContainText('Membership is recorded only after church recognition.');
  await expect(note).toHaveCSS('border-left-width', '0px');

  const layout = await page.evaluate(() => {
    const pageSection = document.querySelector<HTMLElement>('.person-detail-page');
    const note = document.querySelector<HTMLElement>('.membership-note');

    return {
      noteBottom: note?.getBoundingClientRect().bottom ?? 0,
      pageBottom: pageSection?.getBoundingClientRect().bottom ?? 0
    };
  });

  expect(layout.noteBottom).toBeCloseTo(layout.pageBottom, 1);
});

test('collapses desktop navigation while preserving active module semantics', async ({ page }) => {
  await page.setViewportSize({ width: 961, height: 800 });
  await page.goto('/people');

  const toggle = page.getByRole('button', { name: 'Collapse application navigation' });

  await toggle.click();

  await expect(page.getByRole('button', { name: 'Expand application navigation' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'People and Membership', exact: true })
  ).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('link', { name: 'Attendance' })).toHaveAttribute(
    'href',
    '/attendance'
  );

  const reports = page.getByRole('link', { name: 'Reports' });

  await expect(reports).toHaveAttribute('href', '/reports');
  await expect(reports).not.toHaveAttribute('aria-current');
  await expect(page.locator('#application-sidebar a[href^="/planned/"]')).toHaveCount(0);
  await expect(page.getByText(/Coming later|Planned next/)).toHaveCount(0);

  const sidebar = page.locator('#application-sidebar');
  const content = page.locator('#main-content');

  await expect.poll(async () => (await sidebar.boundingBox())?.width ?? 0).toBeCloseTo(72, 0);
  await expect.poll(async () => (await content.boundingBox())?.x ?? 0).toBeCloseTo(72, 0);

  const layout = await page.evaluate(() => {
    const content = document.querySelector<HTMLElement>('#main-content');

    return {
      clipPath: content ? getComputedStyle(content).clipPath : '',
      documentWidth: document.documentElement.scrollWidth,
      transform: content ? getComputedStyle(content).transform : '',
      viewportWidth: document.documentElement.clientWidth
    };
  });

  expect(layout.documentWidth).toBe(layout.viewportWidth);
  expect(layout.transform).toBe('none');
  expect(layout.clipPath).toBe('none');

  const welfare = page.getByRole('link', { name: 'Welfare' });

  await expect(welfare).toHaveAttribute('href', '/welfare');
  await expect(welfare).not.toHaveAttribute('aria-current');

  await welfare.hover();
  const welfareTooltip = welfare.locator('.nav-tooltip');

  await expect(welfareTooltip).toBeVisible();
  await expect(welfareTooltip).toHaveAttribute('aria-hidden', 'true');
  await expect(welfareTooltip).toHaveCSS('opacity', '1');

  const collapsedGeometry = await page.evaluate(() => {
    const activeLink = document.querySelector<HTMLElement>('.nav-link.active');
    const activeIcon = activeLink?.querySelector<HTMLElement>('svg');
    const sidebar = document.querySelector<HTMLElement>('#application-sidebar');
    const tooltip = Array.from(
      document.querySelectorAll<HTMLElement>('.nav-link .nav-tooltip')
    ).find((element) => element.textContent?.includes('Welfare'));

    return {
      activeDotColor: activeLink ? getComputedStyle(activeLink, '::before').backgroundColor : '',
      activeDotLeft: activeLink ? getComputedStyle(activeLink, '::before').left : '',
      activeDotWidth: activeLink ? getComputedStyle(activeLink, '::before').width : '',
      activeIconLeft: activeIcon?.getBoundingClientRect().left ?? 0,
      activeLinkLeft: activeLink?.getBoundingClientRect().left ?? 0,
      sidebarRight: sidebar?.getBoundingClientRect().right ?? 0,
      tooltipLeft: tooltip?.getBoundingClientRect().left ?? 0
    };
  });

  expect(collapsedGeometry.activeDotColor).toBe('rgb(184, 99, 69)');
  expect(
    Number.parseFloat(collapsedGeometry.activeDotLeft) +
      Number.parseFloat(collapsedGeometry.activeDotWidth)
  ).toBeLessThan(collapsedGeometry.activeIconLeft - collapsedGeometry.activeLinkLeft);
  expect(collapsedGeometry.tooltipLeft).toBeGreaterThan(collapsedGeometry.sidebarRight);

  await expect(welfare).toHaveCSS('opacity', '1');

  await expect(sidebar.getByText('Refresh resets every sample record.')).toHaveCount(0);
  await expect(page.locator('.pilot-context')).toHaveCount(0);

  await page.setViewportSize({ width: 960, height: 844 });
  await expect(sidebar).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Primary mobile navigation' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'People', exact: true })).toHaveAttribute(
    'aria-current',
    'page'
  );
});

test('keeps sidebar groups compact and reserves its footer for the administrator', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/people');

  const sidebar = page.locator('#application-sidebar');
  const groups = sidebar.locator('.navigation-group');
  const account = sidebar.locator('.administrator-account');

  expect(await groups.count()).toBe(4);
  await expect(account.locator('.administrator-avatar')).toHaveCSS('width', '40px');
  await expect(account.getByRole('button', { name: 'Open administrator menu' })).toHaveCSS(
    'min-height',
    '56px'
  );
  await account.getByRole('button', { name: 'Open administrator menu' }).click();
  await expect(account.getByRole('menuitem', { name: 'Log out' })).toBeVisible();

  const groupGaps = await page.evaluate(() => {
    const groups = Array.from(document.querySelectorAll<HTMLElement>('.navigation-group'));

    return groups.slice(1).map((group, index) => {
      const previous = groups[index].getBoundingClientRect();
      const current = group.getBoundingClientRect();

      return current.top - previous.bottom;
    });
  });

  expect(Math.max(...groupGaps)).toBeLessThanOrEqual(24);
  const accountBox = await account.boundingBox();

  expect((accountBox?.y ?? 0) + (accountBox?.height ?? 0)).toBeLessThanOrEqual(900);
});

test('redirects a direct unavailable module URL to the active workspace', async ({ page }) => {
  await page.goto('/planned/attendance');

  await expect(page).toHaveURL(/\/people$/);
});

test('animates active sidebar navigation while respecting reduced motion', async ({ page }) => {
  await page.goto('/people');

  const activeLink = page.locator('#application-sidebar .nav-link.active');
  const activeCopy = activeLink.locator('.nav-copy');

  await expect(activeCopy).toHaveCSS('animation-name', 'sidebar-active-content');

  const indicatorAnimation = await activeLink.evaluate(
    (element) => getComputedStyle(element, '::before').animationName
  );

  expect(indicatorAnimation).toBe('sidebar-active-indicator');

  await page.getByRole('link', { name: 'Church settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.locator('#application-sidebar .nav-link.active .nav-copy')).toHaveCSS(
    'animation-name',
    'sidebar-active-content'
  );

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/people');

  await expect(page.locator('#application-sidebar .nav-link.active .nav-copy')).toHaveCSS(
    'animation-name',
    'none'
  );
});

test('settles desktop navigation immediately when reduced motion is requested', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/people');

  await expect(page.locator('#main-content')).toHaveCSS('transition-duration', '1e-05s');
  await page.getByRole('button', { name: 'Collapse application navigation' }).click();
  await expect(page.locator('.app-shell')).toHaveClass(/sidebar-collapsed/);
});

test('uses visible mobile destinations and a full-screen workspace index', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/people');

  await expect(page.locator('.mobile-topbar .mobile-workspace-name')).toHaveText(
    'People & Membership'
  );

  const sidebar = page.locator('#application-sidebar');
  const navigation = page.getByRole('navigation', { name: 'Primary mobile navigation' });

  await expect(sidebar).toBeHidden();
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'People', exact: true })).toHaveAttribute(
    'aria-current',
    'page'
  );

  await navigation.getByRole('link', { name: 'Workspace' }).click();

  await expect(page).toHaveURL(/\/workspace$/);
  await expect(page.getByRole('heading', { name: 'Find what you need.' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Workspace' })).toHaveAttribute(
    'aria-current',
    'page'
  );
  await expect(page.getByRole('link', { name: /Reports/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();

  const mobileLayout = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const interactiveItems = Array.from(
      document.querySelectorAll<HTMLElement>('.mobile-bottom-navigation a, .workspace-list a')
    );

    return {
      documentWidth: document.documentElement.scrollWidth,
      itemBounds: interactiveItems.map((element) => {
        const bounds = element.getBoundingClientRect();

        return { left: bounds.left, right: bounds.right };
      }),
      viewportWidth
    };
  });

  expect(mobileLayout.documentWidth).toBe(mobileLayout.viewportWidth);
  expect(mobileLayout.itemBounds).not.toHaveLength(0);

  for (const item of mobileLayout.itemBounds) {
    expect(item.left).toBeGreaterThanOrEqual(0);
    expect(item.right).toBeLessThanOrEqual(mobileLayout.viewportWidth);
  }

  await page.getByRole('link', { name: /Reports/ }).click();
  await expect(page).toHaveURL(/\/reports$/);
  await expect(navigation.getByRole('link', { name: 'Workspace' })).toHaveAttribute(
    'aria-current',
    'page'
  );
});

test('identifies the active workspace in the mobile top bar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/reports');

  const workspaceName = page.locator('.mobile-topbar .mobile-workspace-name');

  await expect(workspaceName).toHaveText('Reports');

  const alignment = await page.evaluate(() => {
    const brand = document.querySelector<HTMLElement>('.mobile-topbar .mobile-brand');
    const workspace = document.querySelector<HTMLElement>('.mobile-topbar .mobile-workspace-name');
    const brandBounds = brand?.getBoundingClientRect();
    const workspaceBounds = workspace?.getBoundingClientRect();

    return {
      brandHeight: brandBounds?.height ?? 0,
      workspaceHeight: workspaceBounds?.height ?? 0,
      workspaceCenter: workspaceBounds ? workspaceBounds.top + workspaceBounds.height / 2 : 0,
      brandCenter: brandBounds ? brandBounds.top + brandBounds.height / 2 : 0
    };
  });

  expect(alignment.workspaceHeight).toBeCloseTo(alignment.brandHeight, 0);
  expect(alignment.workspaceCenter).toBeCloseTo(alignment.brandCenter, 0);
});

test('logs out from Workspace on the first mobile tap', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/workspace');

  await page.getByRole('button', { name: 'Log out' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});

test('offers the mobile install action only when the browser provides an install prompt', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/workspace');

  await expect(page.getByRole('button', { name: 'Install Eglise' })).toHaveCount(0);

  await page.evaluate(() => {
    const installPrompt = new Event('beforeinstallprompt');

    Object.defineProperties(installPrompt, {
      prompt: {
        value: () => Promise.resolve()
      },
      userChoice: {
        value: Promise.resolve({ outcome: 'accepted' })
      }
    });
    window.dispatchEvent(installPrompt);
  });

  const installButton = page.getByRole('button', { name: 'Install Eglise' });

  await expect(installButton).toBeVisible();
  await installButton.click();
  await expect(installButton).toHaveCount(0);
});

test('centres the mobile attendance actions within the page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/attendance');

  const layout = await page.evaluate(() => {
    const content = document.querySelector<HTMLElement>('#main-content');
    const actions = document.querySelector<HTMLElement>('.attendance-page-actions');
    const contentBounds = content?.getBoundingClientRect();
    const actionBounds = actions?.getBoundingClientRect();

    return {
      actionCenter: actionBounds ? actionBounds.left + actionBounds.width / 2 : 0,
      actionWidth: actionBounds?.width ?? 0,
      contentCenter: contentBounds ? contentBounds.left + contentBounds.width / 2 : 0
    };
  });

  expect(layout.actionWidth).toBeLessThanOrEqual(320);
  expect(layout.actionCenter).toBeCloseTo(layout.contentCenter, 0);
  await expect(page.getByRole('link', { name: 'Create event' })).toBeVisible();
});

test('keeps the people directory within the mobile viewport without the removed prototype banner', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/people');

  await expect(page.getByLabel('Shared prototype limitations')).toHaveCount(0);

  const mobileLayout = await page.evaluate(() => {
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth
    };
  });

  expect(mobileLayout.documentWidth).toBe(mobileLayout.viewportWidth);
});

test('ships a standalone offline document without app bundles', async ({ request }) => {
  const response = await request.get('/offline.html');
  const document = await response.text();

  expect(response.ok()).toBe(true);
  expect(document).toContain('This pilot needs a connection');
  expect(document).not.toContain('<script');
  expect(document).not.toContain('/_app/');
});

test('adds an eligible person without showing their date of birth', async ({ page }) => {
  await page.goto('/people/add');

  await page.getByLabel('Full name').fill('Esi Addo');
  await page.getByLabel('Phone number').fill('+233 24 555 0167');
  await page.getByLabel('Neighbourhood').fill('Osu');
  await page.getByLabel('Date of birth').fill('01/01/2000');
  await page.getByLabel('Date of birth').blur();
  await page.getByRole('button', { name: 'Save person' }).click();

  const notification = page.locator('[data-sonner-toast]').filter({
    hasText: 'Person saved. Their date of birth was discarded'
  });

  await expect(notification).toBeVisible();
  await expect(notification).toHaveAttribute('aria-live', 'polite');

  const closeButton = notification.getByRole('button', {
    name: 'Dismiss notification'
  });
  const [toastBox, closeButtonBox] = await Promise.all([
    notification.boundingBox(),
    closeButton.boundingBox()
  ]);

  expect(toastBox).not.toBeNull();
  expect(closeButtonBox).not.toBeNull();

  if (toastBox && closeButtonBox) {
    expect(closeButtonBox.x).toBeGreaterThanOrEqual(toastBox.x);
    expect(closeButtonBox.y).toBeGreaterThanOrEqual(toastBox.y);
    expect(closeButtonBox.x + closeButtonBox.width).toBeLessThanOrEqual(
      toastBox.x + toastBox.width
    );
    expect(closeButtonBox.y + closeButtonBox.height).toBeLessThanOrEqual(
      toastBox.y + toastBox.height
    );
  }

  await closeButton.click();
  await expect(notification).not.toBeVisible();
  await page.getByLabel('Search people').fill('Esi Addo');
  await expect(page.getByRole('link', { name: 'Esi Addo' })).toBeVisible();
  await expect(page.getByText('2000-01-01')).not.toBeVisible();
});

test('adds a visitor without inferring their neighbourhood or membership', async ({ page }) => {
  await page.goto('/people/add');

  await page.getByRole('combobox', { name: 'Person type' }).click();
  await page.getByRole('option', { name: 'Visitor', exact: true }).click();
  await page.getByLabel('Full name').fill('Mira Daniels');
  await page.getByLabel('Date of birth').fill('03/10/1990');
  await page.getByRole('button', { name: 'Save person' }).click();

  await expect(page).toHaveURL(/\/people$/);
  await page.getByLabel('Search people').fill('Mira Daniels');
  await expect(page.getByText('Visitor', { exact: true })).toBeVisible();
  await expect(page.getByText('Not provided', { exact: true })).toHaveCount(2);
  await expect(page.getByText('Not a member', { exact: true })).toBeVisible();
});

test('automatically dismisses shared success notifications after a short delay', async ({
  page
}) => {
  await page.goto('/people/add');

  await page.getByLabel('Full name').fill('Akosua Mensah');
  await page.getByLabel('Phone number').fill('+233 24 555 0168');
  await page.getByLabel('Neighbourhood').fill('Labone');
  await page.getByLabel('Date of birth').fill('01/01/2000');
  await page.getByLabel('Date of birth').blur();
  await page.getByRole('button', { name: 'Save person' }).click();

  const notification = page.locator('[data-sonner-toast]').filter({
    hasText: 'Person saved. Their date of birth was discarded'
  });

  await expect(notification).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(notification).not.toBeVisible({ timeout: 5500 });
});

test('uses the app-native date picker with local date validation and keyboard selection', async ({
  page
}) => {
  await page.goto('/people/add');

  const dateOfBirth = page.getByLabel('Date of birth');

  await dateOfBirth.fill('31/02/2000');
  await dateOfBirth.blur();
  await expect(dateOfBirth).toHaveValue('31/02/2000');
  await expect(dateOfBirth).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('alert')).toContainText('Enter a real date');

  await page.getByRole('button', { name: 'Open calendar' }).click();
  await expect(page.getByRole('dialog', { name: 'Calendar' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Calendar' }).locator('select')).toHaveCount(0);
  await expect(
    page.getByRole('dialog', { name: 'Calendar' }).locator('input[type="date"]')
  ).toHaveCount(0);

  const currentYear = String(new Date().getFullYear());
  const selectedMonth = await page.getByRole('button', { name: 'Choose month' }).textContent();
  const selectedMonthLabel = selectedMonth?.slice(0, 3) ?? '';

  await page.getByRole('button', { name: 'Choose year' }).click();
  await expect(page.getByRole('button', { name: currentYear })).toBeFocused();
  await page.getByRole('button', { name: '2025', exact: true }).click();
  await expect(page.getByRole('button', { name: selectedMonthLabel, exact: true })).toBeFocused();
  await page.getByRole('button', { name: selectedMonthLabel, exact: true }).click();

  await page.getByRole('button', { name: 'Choose month' }).click();
  await expect(page.getByRole('button', { name: selectedMonthLabel, exact: true })).toBeFocused();
  await page.getByLabel('Full name').click();
  await expect(page.getByRole('dialog', { name: 'Calendar' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Open calendar' }).click();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');

  await expect(dateOfBirth).toHaveValue(/\d{2}\/\d{2}\/\d{4}/);
  await expect(page.getByRole('dialog', { name: 'Calendar' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Open calendar' })).toBeFocused();

  await dateOfBirth.fill('01/01/3000');
  await dateOfBirth.blur();
  await expect(dateOfBirth).toHaveValue('01/01/3000');
});

test('uses ancestor-only breadcrumbs and preserves the unsaved-entry guard', async ({ page }) => {
  await page.goto('/people/add');

  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText(
    'People & Membership'
  );
  await expect(
    page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', {
      name: 'People & Membership'
    })
  ).toHaveCSS('cursor', 'pointer');
  await expect(
    page.getByRole('navigation', { name: 'Breadcrumb' }).getByText('Add a person', { exact: true })
  ).toHaveCount(0);

  await page.getByLabel('Full name').fill('Unsaved Person');
  await page.getByRole('link', { name: 'People & Membership' }).click();
  await expect(page.getByRole('heading', { name: 'Leave unsaved entry?' })).toBeVisible();

  await page.getByRole('button', { name: 'Keep editing' }).click();
  await expect(page.getByLabel('Full name')).toHaveValue('Unsaved Person');
});

test('anchors the unsaved-entry confirmation as a mobile bottom sheet', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/people/add');
  await page.getByLabel('Full name').fill('Unsaved Person');
  await page.getByRole('link', { name: 'Cancel' }).click();

  const position = await page.getByRole('dialog').evaluate((sheet) => {
    const bounds = sheet.getBoundingClientRect();

    return {
      bottomOffset: window.innerHeight - bounds.bottom
    };
  });

  expect(position.bottomOffset).toBeLessThanOrEqual(1);
});

test('uses the app-native membership combobox and truthful first-page directory controls', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/people');

  const membership = page.getByRole('combobox', { name: 'Membership' });

  await membership.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(membership).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');

  await expect(page.getByText('Showing 1–10 of 16 records')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Kojo Boateng' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Ama Owusu' })).toHaveCount(0);
  await expect(page.getByText('Rows per page')).toHaveCount(0);
  await expect(page.getByText('Page 1 of 2')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
});

test('pages through the complete 25-person directory with truthful ranges and bounds', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/people');

  const previous = page.getByRole('button', { name: 'Previous' });
  const next = page.getByRole('button', { name: 'Next' });

  await expect(page.getByText('Showing 1–10 of 25 records')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Ama Owusu' })).toBeVisible();
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();

  await next.click();
  await expect(page.getByText('Showing 11–20 of 25 records')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Abena Osei' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Ama Owusu' })).toHaveCount(0);
  await expect(previous).toBeEnabled();
  await expect(next).toBeEnabled();

  await next.click();
  await expect(page.getByText('Showing 21–25 of 25 records')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Peter Boateng' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Abena Osei' })).toHaveCount(0);
  await expect(previous).toBeEnabled();
  await expect(next).toBeDisabled();
});

test('anchors the sample import prompt to the bottom of the directory workspace', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto('/people');

  const summary = page.getByRole('region', { name: 'Directory filters' });
  const importPrompt = page.locator('.directory-page .import-prompt');

  await summary.locator('[data-summary="first-timers"]').click();
  await expect(page.locator('.people-directory tbody tr')).toHaveCount(1);
  await expect(page.getByText('Showing 1–1 of 1 record')).toBeVisible();
  await expect(importPrompt).toHaveCSS('position', 'static');

  const footerPosition = await page.evaluate(() => {
    const content = document.querySelector<HTMLElement>('#main-content');
    const prompt = document.querySelector<HTMLElement>('.directory-page .import-prompt');

    return {
      contentBottom: content?.getBoundingClientRect().bottom ?? 0,
      promptBottom: prompt?.getBoundingClientRect().bottom ?? 0
    };
  });

  expect(footerPosition.promptBottom).toBeCloseTo(footerPosition.contentBottom, 0);
});

test('keeps fixed ten-row pagination on a tall desktop while keeping the directory footer visible', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto('/people');

  const importPrompt = page.locator('.directory-page .import-prompt');
  const importAction = importPrompt.getByRole('link', { name: 'Review sample import' });
  const motif = page.locator('.content-motif');

  await expect
    .poll(async () => (await page.locator('.people-directory tbody tr').count()) > 0)
    .toBe(true);
  await expect(page.locator('.people-directory tbody tr')).toHaveCount(10);
  await expect(page.getByText('Showing 1–10 of 25 records')).toBeVisible();
  await expect(importPrompt).toBeVisible();
  await expect(importAction).toBeVisible();
  await expect(motif).toHaveCSS('overflow', 'clip');

  const fittedLayout = await page.evaluate(() => {
    const content = document.querySelector<HTMLElement>('#main-content');
    const footer = document.querySelector<HTMLElement>('.directory-page .import-prompt');
    const action = footer?.querySelector<HTMLElement>('.button');

    return {
      actionRight: action?.getBoundingClientRect().right ?? 0,
      contentRight: content?.getBoundingClientRect().right ?? 0,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth
    };
  });

  expect(fittedLayout.documentWidth).toBe(fittedLayout.viewportWidth);
  expect(fittedLayout.actionRight).toBeGreaterThan(fittedLayout.contentRight - 72);
});

test('keeps fixed desktop pagination through resizing and falls back to document scroll', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/people');

  const tableRows = page.locator('.people-directory tbody tr');

  await expect(tableRows).toHaveCount(10);

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Showing 11–20 of 25 records')).toBeVisible();
  await expect(page.getByText('Page 2 of 3')).toBeVisible();
  const firstVisibleBeforeResize = await tableRows.first().locator('.person-name').textContent();

  await page.setViewportSize({ width: 1280, height: 620 });
  await expect(tableRows).toHaveCount(10);
  await expect(page.getByText('Showing 11–20 of 25 records')).toBeVisible();
  await expect(page.getByText('Page 2 of 3')).toBeVisible();
  await expect(tableRows.first().locator('.person-name')).toHaveText(
    firstVisibleBeforeResize ?? ''
  );

  await page.setViewportSize({ width: 1280, height: 360 });
  await expect
    .poll(async () => {
      return page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight);
    })
    .toBe(true);
  await expect(page.locator('.directory-page .table-wrap')).toHaveCSS('overflow', 'visible');
});

test('uses a single thin forest focus cue for directory inputs and comboboxes', async ({
  page
}) => {
  await page.goto('/people');

  const search = page.getByLabel('Search people');
  const membership = page.getByRole('combobox', { name: 'Membership' });

  const searchHeightBeforeFocus = await search.evaluate(
    (element) => element.getBoundingClientRect().height
  );
  const membershipHeightBeforeFocus = await membership.evaluate(
    (element) => element.getBoundingClientRect().height
  );

  await search.focus();
  await expect(search).toHaveCSS('outline-style', 'none');
  await expect(search).toHaveCSS('box-shadow', 'rgba(49, 84, 59, 0.12) 0px 0px 0px 2px');
  await expect(search).toHaveCSS('border-top-width', '2px');
  await expect(search).toHaveCSS('border-top-color', 'rgb(111, 139, 117)');
  await expect(search).toHaveJSProperty('offsetHeight', Math.round(searchHeightBeforeFocus));

  await membership.focus();
  await expect(membership).toHaveCSS('outline-style', 'none');
  await expect(membership).toHaveCSS('box-shadow', 'rgba(49, 84, 59, 0.12) 0px 0px 0px 2px');
  await expect(membership).toHaveCSS('border-top-width', '2px');
  await expect(membership).toHaveCSS('border-top-color', 'rgb(111, 139, 117)');
  await expect(membership).toHaveJSProperty(
    'offsetHeight',
    Math.round(membershipHeightBeforeFocus)
  );
});

test('keeps the desktop rail sized to the viewport while the directory manages its own height', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/people');

  const appShell = page.locator('.app-shell');
  const sidebar = page.locator('#application-sidebar');
  const tableWrap = page.locator('.directory-page .table-wrap');
  const header = page.locator('.people-directory th').first();

  await expect(appShell).toHaveCSS('overflow-x', 'clip');
  await expect(sidebar).toHaveCSS('position', 'sticky');
  await expect(sidebar).toHaveCSS('overflow-y', 'auto');
  await expect(tableWrap).toHaveCSS('overflow', 'visible');
  await expect(header).toHaveCSS('position', 'sticky');
  await sidebar.getByRole('link', { name: 'Church settings' }).scrollIntoViewIfNeeded();
  await expect(sidebar.getByRole('link', { name: 'Church settings' })).toBeVisible();
  await sidebar.getByRole('button', { name: 'Open administrator menu' }).scrollIntoViewIfNeeded();
  await expect(sidebar.getByRole('button', { name: 'Open administrator menu' })).toBeVisible();

  expect((await sidebar.boundingBox())?.height).toBeCloseTo(720, 0);
});

test('scrolls a constrained desktop sidebar to its lower communication areas', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 360 });
  await page.goto('/people');

  const sidebar = page.locator('#application-sidebar');
  const announcements = sidebar.getByRole('link', { name: 'Announcements' });

  await expect(sidebar).toHaveCSS('overflow-y', 'auto');

  const sidebarMetrics = await sidebar.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight
  }));

  expect(sidebarMetrics.scrollHeight).toBeGreaterThan(sidebarMetrics.clientHeight);

  await sidebar.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(announcements).toBeVisible();

  const announcementPosition = await announcements.evaluate((element) => {
    const sidebar = element.closest<HTMLElement>('#application-sidebar');

    return {
      announcementBottom: element.getBoundingClientRect().bottom,
      sidebarBottom: sidebar?.getBoundingClientRect().bottom ?? 0
    };
  });

  expect(announcementPosition.announcementBottom).toBeLessThanOrEqual(
    announcementPosition.sidebarBottom
  );
  await expect(announcements).toHaveAttribute('href', '/announcements');
});

test('uses dense directory controls on desktop and keeps mobile control sizing unchanged', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/people');

  await expect(page.getByLabel('Search people')).toHaveCSS('font-size', '14px');
  await expect(page.getByLabel('Search people')).toHaveCSS('min-height', '40px');
  await expect(page.locator('.people-directory tbody td').first()).toHaveCSS('padding-top', '8px');

  const desktopControlWidths = await page.evaluate(() => {
    const search = document.querySelector<HTMLElement>('#directory-search');
    const membership = document.querySelector<HTMLElement>('#membership-filter');

    return {
      membershipWidth: membership?.getBoundingClientRect().width ?? 0,
      searchWidth: search?.getBoundingClientRect().width ?? 0
    };
  });

  expect(desktopControlWidths.membershipWidth).toBeGreaterThanOrEqual(160);
  expect(desktopControlWidths.membershipWidth).toBeLessThan(desktopControlWidths.searchWidth);

  await page.setViewportSize({ width: 960, height: 844 });

  await expect(page.getByLabel('Search people')).toHaveCSS('font-size', '16px');
  await expect(page.getByLabel('Search people')).toHaveCSS('min-height', '44px');
  const mobileControlWidths = await page.evaluate(() => {
    const search = document.querySelector<HTMLElement>('#directory-search');
    const membership = document.querySelector<HTMLElement>('#membership-filter');

    return {
      membershipWidth: membership?.getBoundingClientRect().width ?? 0,
      searchWidth: search?.getBoundingClientRect().width ?? 0
    };
  });

  expect(mobileControlWidths.membershipWidth).toBeCloseTo(mobileControlWidths.searchWidth, 0);
  await expect(page.locator('.people-directory thead')).toBeHidden();
});

test('does not repeat the People and Membership context after child-page breadcrumbs', async ({
  page
}) => {
  for (const route of ['/people/add', '/people/import', '/people/kojo-boateng']) {
    await page.goto(route);
    await expect(page.locator('.page-head .eyebrow')).toHaveCount(0);
    await expect(page.locator('.breadcrumb')).toContainText('People & Membership');
  }
});

test('cancels an active membership option with Escape without changing the directory', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/people');

  const membership = page.getByRole('combobox', { name: 'Membership' });

  await membership.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(membership).toHaveText('All people');
  await expect(membership).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText('Showing 1–10 of 25 records')).toBeVisible();
  await expect(membership).toBeFocused();
});

test('commits a membership option with Tab and moves to the next natural focus target', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/people');

  const membership = page.getByRole('combobox', { name: 'Membership' });

  await membership.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');

  await expect(membership).toHaveText('Members');
  await expect(membership).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText('Showing 1–9 of 9 records')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Ama Owusu' })).toBeFocused();
});

test('closes the membership listbox when a pointer lands outside it without committing', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/people');

  const membership = page.getByRole('combobox', { name: 'Membership' });

  await membership.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.getByRole('heading', { name: 'People directory' }).click();

  await expect(membership).toHaveText('All people');
  await expect(membership).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText('Showing 1–10 of 25 records')).toBeVisible();
});

test('keeps the people directory readable without mobile horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/people');

  await expect(page.locator('.people-directory thead')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Add person' }).locator('svg')).toBeVisible();

  const layout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth
  }));

  expect(layout.documentWidth).toBe(layout.viewportWidth);
});

test('does not render stray delimiters after People action groups', async ({ page }) => {
  for (const route of ['/people/add', '/people/import', '/people/kojo-boateng']) {
    await page.goto(route);

    const hasStrayDelimiter = await page
      .locator('.form-actions, .dialog-actions, .person-summary')
      .evaluateAll((elements) =>
        elements.some((element) =>
          Array.from(element.childNodes).some(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === '>'
          )
        )
      );

    expect(hasStrayDelimiter).toBe(false);
  }
});

test('requires an explicit possible-duplicate import decision', async ({ page }) => {
  const workbook = writeXlsxFile(
    [
      ['Full name', 'Person type', 'Phone number', 'Neighbourhood', 'Date of birth'],
      [' '],
      ['Ama Owusu', 'Visitor', '', 'Adabraka', new Date('1990-01-01')],
      ['Ama Owusu', 'Visitor', '', 'Adabraka', new Date('1990-01-01')]
    ],
    { dateFormat: 'dd/mm/yyyy' }
  );
  const buffer = await workbook.toBuffer();

  await page.goto('/people/import');
  await page.getByLabel('2. Upload completed workbook').setInputFiles({
    name: 'duplicate-people.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer
  });

  const confirm = page.getByRole('button', { name: 'Confirm import' });

  await expect(confirm).toBeDisabled();
  await expect(page.locator('.import-table td[data-label="Row"]')).toHaveText(['3', '4']);

  await page.getByLabel('Exclude row').first().check();
  await page.getByLabel('Create separately').last().check();
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page.getByRole('heading', { name: 'Confirm import' })).toBeVisible();
  await page.getByRole('button', { name: 'Create people' }).click();

  await expect(page.getByText('Created 1 person. Excluded 1 row was not added.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirm import' })).toHaveCount(0);
});

test('records then corrects a membership record with a removal note', async ({ page }) => {
  await page.goto('/people/kojo-boateng');

  await page.getByRole('link', { name: 'Record membership' }).click();
  await expect(page).toHaveURL('/people/kojo-boateng/membership');
  await expect(page.getByRole('link', { name: 'Kojo Boateng', exact: true })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Membership recording progress' })).toBeVisible();
  await expect(page.getByText('1 Assimilation')).toHaveAttribute('aria-current', 'step');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByLabel('Assimilation completion date')).toBeFocused();
  await page.getByLabel('Assimilation completion date').fill('01/09/2026');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('2 Recognition')).toHaveAttribute('aria-current', 'step');
  await page.getByLabel('Membership recognition date').fill('30/09/2026');
  await page.getByLabel('Certificate or register reference').fill('Recognition register, 2026');
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByLabel('Assimilation completion date')).toHaveValue('01/09/2026');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Save membership record' }).click();
  await expect(page.getByText('Membership record saved.')).toBeVisible();
  await expect(page.getByText('1 Sept 2026')).toBeVisible();
  await expect(page.getByText('30 Sept 2026', { exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Correct membership' }).click();
  await expect(page).toHaveURL('/people/kojo-boateng/membership');
  await page.getByRole('button', { name: 'Mark as not recorded' }).click();
  await page.getByLabel('Correction note').fill('Recorded against the wrong person.');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm membership correction' })).toBeVisible();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByLabel('Correction note')).toBeFocused();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Mark as not recorded' }).click();

  await expect(page.getByText('Membership correction saved.')).toBeVisible();
  await expect(
    page.getByText('Recorded against the wrong person.', { exact: true }).first()
  ).toBeVisible();
});

test('edits a person without changing their membership record', async ({ page }) => {
  await page.goto('/people/ama-owusu');

  await page.getByRole('link', { name: 'Edit person' }).click();
  await page.getByLabel('Full name').fill('Ama Serwaa');
  await page.getByLabel('Neighbourhood').fill('Korle Bu');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByText('Person details saved.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ama Serwaa' })).toBeVisible();
  await expect(page.getByText('Korle Bu')).toBeVisible();
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Member Current 14 Aug 2025' })
  ).toBeVisible();
  await expect(page.getByText('Recognition register, 2025', { exact: true }).last()).toBeVisible();
});

test('keeps invalid person edits available for correction', async ({ page }) => {
  await page.goto('/people/kojo-boateng/edit');

  await page.getByLabel('Full name').fill('Kojo Boateng');
  await page.getByLabel('Phone number').fill('024 700');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByText('Please correct the highlighted fields.')).toBeVisible();
  await expect(page.getByLabel('Phone number')).toHaveValue('024 700');
  await expect(page.getByLabel('Phone number')).toBeFocused();
});

test('keeps profile actions inline on desktop and stacked on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/people/kojo-boateng');

  const desktopActions = await page.locator('.person-actions').evaluate((element) => {
    const [edit, record] = Array.from(element.children).map((child) =>
      child.getBoundingClientRect()
    );

    return { editTop: edit.top, recordTop: record.top };
  });

  expect(desktopActions.editTop).toBeCloseTo(desktopActions.recordTop, 0);

  await page.setViewportSize({ width: 390, height: 844 });

  const mobileActions = await page.locator('.person-actions').evaluate((element) => {
    const [edit, record] = Array.from(element.children).map((child) =>
      child.getBoundingClientRect()
    );

    return { editBottom: edit.bottom, recordTop: record.top };
  });

  expect(mobileActions.recordTop).toBeGreaterThan(mobileActions.editBottom);
});

test('floats the membership calendar without changing the form layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/people/kojo-boateng');
  await page.getByRole('link', { name: 'Record membership' }).click();
  await page.getByLabel('Assimilation completion date').fill('01/09/2026');
  await page.getByRole('button', { name: 'Continue' }).click();

  const before = await page.locator('.membership-workflow-form').evaluate((form) => {
    const reference = document.getElementById('evidence')?.getBoundingClientRect();

    return { height: form.getBoundingClientRect().height, referenceTop: reference?.top };
  });

  await page.getByRole('button', { name: 'Open calendar' }).click();

  await expect(page.locator('dialog[open]')).toHaveCount(0);

  const calendar = page.getByRole('dialog', { name: 'Calendar' });

  await expect(calendar).toBeVisible();

  const after = await page.locator('.membership-workflow-form').evaluate((form) => {
    const reference = document.getElementById('evidence')?.getBoundingClientRect();
    const popup = form.querySelector<HTMLElement>('.eglise-date-picker-popup');

    return {
      height: form.getBoundingClientRect().height,
      popupZIndex: popup ? Number.parseInt(getComputedStyle(popup).zIndex, 10) : 0,
      referenceTop: reference?.top
    };
  });

  expect(after.height).toBeCloseTo(before.height, 0);
  expect(after.referenceTop).toBeCloseTo(before.referenceTop ?? 0, 0);
  expect(after.popupZIndex).toBeGreaterThan(4);
});

test('shows adjacent-month calendar dates as disabled context', async ({ page }) => {
  await page.goto('/people/add');
  await page.getByRole('button', { name: 'Open calendar' }).click();

  const calendar = page.getByRole('dialog', { name: 'Calendar' });
  const adjacentMonthDate = calendar
    .locator('.eglise-date-picker-grid button.outside-month')
    .first();

  await expect(adjacentMonthDate).toBeDisabled();
  await expect(adjacentMonthDate).toHaveAttribute('tabindex', '-1');
  await expect(adjacentMonthDate).toHaveCSS('cursor', 'not-allowed');

  await adjacentMonthDate.evaluate((button) => (button as HTMLButtonElement).click());

  await expect(calendar).toBeVisible();
  await expect(page.getByLabel('Date of birth')).toHaveValue('');
});

test('moves between months without making adjacent dates selectable', async ({ page }) => {
  await page.goto('/people/add');
  await page.getByRole('button', { name: 'Open calendar' }).click();

  const calendar = page.getByRole('dialog', { name: 'Calendar' });
  const previousMonth = new Date();

  previousMonth.setMonth(previousMonth.getMonth() - 1);

  await calendar.getByRole('button', { name: 'Previous period' }).click();
  await expect(calendar.locator('.eglise-date-picker-grid')).toHaveAttribute(
    'aria-label',
    previousMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  );
  await expect(
    calendar.locator('.eglise-date-picker-grid button.outside-month').first()
  ).toBeDisabled();
});

test('guards calendar selections before leaving membership recording', async ({ page }) => {
  await page.goto('/people/kojo-boateng/membership');
  await page.getByRole('button', { name: 'Open calendar' }).click();
  await page.locator('.eglise-date-picker-grid button[aria-current="date"]').click();
  await page.getByRole('link', { name: 'Cancel' }).click();

  await expect(page.getByRole('heading', { name: 'Leave membership recording?' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep recording' }).click();
  await expect(page.getByLabel('Assimilation completion date')).not.toHaveValue('');
});

test('requires Assimilation before recording membership', async ({ page }) => {
  await page.goto('/people/kojo-boateng');

  await page.getByRole('link', { name: 'Record membership' }).click();
  await page.getByLabel('Assimilation completion date').fill('30/09/2026');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Membership recognition date').fill('01/09/2026');
  await page.getByLabel('Certificate or register reference').fill('Recognition register, 2026');
  await page.getByRole('button', { name: 'Save membership record' }).click();

  await expect(
    page.getByText('Membership recognition cannot be before Assimilation is completed.')
  ).toBeVisible();
  await expect(page.getByLabel('Membership recognition date')).toHaveAttribute(
    'aria-invalid',
    'true'
  );
});

test('asks before leaving a dirty entry', async ({ page }) => {
  await page.goto('/people/add');

  await page.getByLabel('Full name').fill('Unsaved Person');
  await page.getByRole('link', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Leave unsaved entry?' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep editing' }).click();

  await expect(page.getByLabel('Full name')).toHaveValue('Unsaved Person');
});

test('keeps the session when a dirty-entry logout is cancelled, then signs out after confirmation', async ({
  page
}) => {
  await page.goto('/people/add');
  await page.getByLabel('Full name').fill('Unsaved Person');

  await page.getByRole('button', { name: 'Open administrator menu' }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await expect(page.getByRole('heading', { name: 'Leave unsaved entry?' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep editing' }).click();

  await expect(page).toHaveURL(/\/people\/add$/);
  await expect(page.locator('#application-sidebar')).toContainText('Ama Owusu');
  await expect(page.getByLabel('Full name')).toHaveValue('Unsaved Person');

  await page.getByRole('button', { name: 'Open administrator menu' }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await page.getByRole('button', { name: 'Discard entry' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
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
