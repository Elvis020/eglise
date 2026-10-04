import { expect, test } from '@playwright/test';

test('shows the fictional people directory and quiet shared prototype context', async ({
  page
}) => {
  await page.goto('/people');

  await expect(page.getByRole('heading', { name: 'People directory' })).toBeVisible();
  const pilotContext = page.getByLabel('Shared prototype limitations');

  await expect(pilotContext).toBeVisible();
  await expect(pilotContext).toContainText('Shared prototype');
  await expect(pilotContext).toContainText(
    'Changes in this prototype cannot be attributed to a named individual.'
  );
  await expect(pilotContext).toContainText(/Refresh resets every\s+sample record/);
  await expect(pilotContext).toContainText('nothing is stored on this device.');
  await expect(pilotContext).not.toHaveAttribute('role', 'status');
  await expect(page.getByText('Ama Owusu')).toBeVisible();
  await expect(page.locator('.people-directory th')).toHaveCount(4);
  await expect(page.locator('.people-directory th[scope="col"]')).toHaveCount(4);
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

test('collapses desktop navigation while preserving semantics and unavailable module boundaries', async ({
  page
}) => {
  await page.setViewportSize({ width: 961, height: 800 });
  await page.goto('/people');

  const toggle = page.getByRole('button', { name: 'Collapse application navigation' });

  await toggle.click();

  await expect(page.getByRole('button', { name: 'Expand application navigation' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'People and Membership', exact: true })
  ).toHaveAttribute('aria-current', 'page');

  const attendance = page
    .locator('#application-sidebar .nav-future')
    .filter({ hasText: 'Attendance' });

  await expect(attendance).toHaveJSProperty('tagName', 'DIV');
  await expect(attendance).not.toHaveAttribute('role');
  await expect(attendance).not.toHaveAttribute('tabindex');
  await expect(attendance).not.toHaveAttribute('href');
  await expect(page.getByRole('link', { name: 'Attendance' })).toHaveCount(0);
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

  await attendance.hover();
  const attendanceTooltip = attendance.locator('.nav-tooltip');

  await expect(attendanceTooltip).toBeVisible();
  await expect(attendanceTooltip).toHaveAttribute('aria-hidden', 'true');
  await expect(attendanceTooltip).toHaveCSS('opacity', '1');

  const collapsedGeometry = await page.evaluate(() => {
    const activeLink = document.querySelector<HTMLElement>('.nav-link.active');
    const activeIcon = activeLink?.querySelector<HTMLElement>('svg');
    const sidebar = document.querySelector<HTMLElement>('#application-sidebar');
    const tooltip = Array.from(
      document.querySelectorAll<HTMLElement>('.nav-future .nav-tooltip')
    ).find((element) => element.textContent?.includes('Attendance'));

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

  await expect(attendance).toHaveCSS('opacity', '0.66');

  await expect(sidebar.getByText('Refresh resets every sample record.')).toHaveCount(0);
  const pilotContext = page.locator('.pilot-context');

  await expect(pilotContext).toContainText(/Refresh resets every\s+sample record/);

  const desktopAlignment = await page.evaluate(() => {
    const context = document.querySelector<HTMLElement>('.pilot-context');
    const page = document.querySelector<HTMLElement>('.page');

    return {
      contextLeft: context?.getBoundingClientRect().left ?? 0,
      pageLeft: page?.getBoundingClientRect().left ?? 0
    };
  });

  expect(desktopAlignment.contextLeft).toBeCloseTo(desktopAlignment.pageLeft, 1);

  await page.setViewportSize({ width: 960, height: 844 });
  await expect(page.locator('.app-shell')).not.toHaveClass(/sidebar-collapsed/);

  await page.getByRole('button', { name: 'Open application menu' }).click();
  await expect(page.locator('#application-sidebar a.nav-link[href="/people"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Expand application navigation' })).toBeHidden();
});

test('redirects a direct unavailable module URL to the active workspace', async ({ page }) => {
  await page.goto('/planned/attendance');

  await expect(page).toHaveURL(/\/people$/);
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

test('opens and closes the mobile application drawer with a focus return', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/people');

  const menu = page.locator('.mobile-menu-button');
  const sidebar = page.locator('#application-sidebar');
  const peopleLink = sidebar.locator('a.nav-link[href="/people"]');

  await expect(sidebar).toHaveAttribute('inert', '');
  await expect(page.getByRole('link', { name: 'People and Membership', exact: true })).toHaveCount(
    0
  );

  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(peopleLink).not.toBeFocused();

  await menu.click();
  await expect(
    sidebar.locator('.nav-future .nav-copy').filter({ hasText: 'Announcements' })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'People and Membership', exact: true })
  ).toBeVisible();
  await expect(sidebar).not.toHaveAttribute('inert', '');
  await expect(sidebar.getByRole('button', { name: 'Close application menu' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Close application menu' })).toHaveCount(1);
  await expect(menu).toHaveAttribute('aria-hidden', 'true');
  await expect(menu).toHaveAttribute('inert', '');
  await expect(menu).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('.sidebar-backdrop')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.sidebar-backdrop')).toHaveAttribute('tabindex', '-1');

  await expect(sidebar.getByRole('link', { name: 'Announcements' })).toHaveCount(0);
  await expect(
    sidebar.locator('.nav-future').filter({ hasText: 'Announcements' })
  ).not.toHaveAttribute('tabindex');

  await sidebar.getByRole('button', { name: 'Close application menu' }).click();
  await expect(menu).toBeFocused();

  await menu.click();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
});

test('wraps shared prototype context naturally on mobile without horizontal overflow', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/people');

  const pilotContext = page.getByLabel('Shared prototype limitations');
  const pilotLabel = pilotContext.locator('strong');
  const pilotCopy = pilotContext.locator('p');

  await expect(pilotContext).toBeVisible();

  const mobileLayout = await page.evaluate(() => {
    const context = document.querySelector<HTMLElement>('.pilot-context');
    const label = context?.querySelector<HTMLElement>('strong');
    const copy = context?.querySelector<HTMLElement>('p');

    return {
      contextRight: context?.getBoundingClientRect().right ?? 0,
      copyTop: copy?.getBoundingClientRect().top ?? 0,
      documentWidth: document.documentElement.scrollWidth,
      labelBottom: label?.getBoundingClientRect().bottom ?? 0,
      viewportWidth: document.documentElement.clientWidth
    };
  });

  expect(mobileLayout.copyTop).toBeGreaterThan(mobileLayout.labelBottom);
  expect(mobileLayout.contextRight).toBeLessThanOrEqual(mobileLayout.viewportWidth);
  expect(mobileLayout.documentWidth).toBe(mobileLayout.viewportWidth);
  await expect(pilotLabel).toBeVisible();
  await expect(pilotCopy).toBeVisible();
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
  await page.getByLabel('Date of birth').fill('01/01/2000');
  await page.getByLabel('Date of birth').blur();
  await page.getByRole('button', { name: 'Save person' }).click();

  await expect(page.getByText('Person saved. Their date of birth was discarded')).toBeVisible();
  await page.getByLabel('Search people').fill('Esi Addo');
  await expect(page.getByRole('link', { name: 'Esi Addo' })).toBeVisible();
  await expect(page.getByText('2000-01-01')).not.toBeVisible();
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

test('uses the People and Membership breadcrumb and preserves the unsaved-entry guard', async ({
  page
}) => {
  await page.goto('/people/add');

  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText(
    'People & Membership'
  );
  await expect(
    page.getByRole('navigation', { name: 'Breadcrumb' }).getByText('Add a person', { exact: true })
  ).toHaveAttribute('aria-current', 'page');

  await page.getByLabel('Full name').fill('Unsaved Person');
  await page.getByRole('link', { name: 'People & Membership' }).click();
  await expect(page.getByRole('heading', { name: 'Leave unsaved entry?' })).toBeVisible();

  await page.getByRole('button', { name: 'Keep editing' }).click();
  await expect(page.getByLabel('Full name')).toHaveValue('Unsaved Person');
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

test('keeps the sample import prompt as a flowing low-priority directory footer', async ({
  page
}) => {
  await page.goto('/people');

  const directory = page.locator('.directory-page');
  const importPrompt = page.locator('.directory-page .import-prompt');

  await expect(importPrompt).toHaveCSS('position', 'static');
  await expect(directory).toHaveCSS('display', 'flex');
  await expect(directory).toHaveCSS('flex-direction', 'column');

  const footerFlow = await page.evaluate(() => {
    const pagination = document.querySelector<HTMLElement>('.directory-pagination');
    const prompt = document.querySelector<HTMLElement>('.directory-page .import-prompt');

    return {
      paginationBottom: pagination?.getBoundingClientRect().bottom ?? 0,
      promptTop: prompt?.getBoundingClientRect().top ?? 0
    };
  });

  expect(footerFlow.promptTop).toBeGreaterThan(footerFlow.paginationBottom);
});

test('uses more than ten rows on a tall desktop while keeping the directory footer visible', async ({
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
  expect(await page.locator('.people-directory tbody tr').count()).toBeGreaterThan(10);
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
      documentHeight: document.documentElement.scrollHeight,
      documentWidth: document.documentElement.scrollWidth,
      footerBottom: footer?.getBoundingClientRect().bottom ?? 0,
      footerTop: footer?.getBoundingClientRect().top ?? 0,
      pageHeight: document.documentElement.clientHeight,
      viewportWidth: document.documentElement.clientWidth
    };
  });

  expect(fittedLayout.footerBottom).toBeLessThanOrEqual(fittedLayout.pageHeight);
  expect(fittedLayout.documentHeight).toBeLessThanOrEqual(fittedLayout.pageHeight);
  expect(fittedLayout.documentWidth).toBe(fittedLayout.viewportWidth);
  expect(fittedLayout.actionRight).toBeGreaterThan(fittedLayout.contentRight - 72);
  expect(fittedLayout.footerTop).toBeLessThan(fittedLayout.pageHeight);
});

test('adapts desktop pagination to the available table capacity and falls back to document scroll', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/people');

  const tableRows = page.locator('.people-directory tbody tr');
  const fullCapacity = await tableRows.count();

  await page.getByRole('button', { name: 'Next' }).click();
  const firstVisibleBeforeResize = await tableRows.first().getByRole('link').textContent();

  await page.setViewportSize({ width: 1280, height: 620 });
  await expect.poll(async () => (await tableRows.count()) < fullCapacity).toBe(true);
  await expect(tableRows.first().getByRole('link')).toHaveText(firstVisibleBeforeResize ?? '');

  const compactCapacity = await tableRows.count();

  expect(compactCapacity).toBeGreaterThanOrEqual(1);
  expect(compactCapacity).toBeLessThanOrEqual(10);

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
  await expect(search).toHaveCSS('box-shadow', 'none');
  await expect(search).toHaveCSS('border-top-width', '2px');
  await expect(search).toHaveCSS('border-top-color', 'rgb(49, 84, 59)');
  await expect(search).toHaveJSProperty('offsetHeight', Math.round(searchHeightBeforeFocus));

  await membership.focus();
  await expect(membership).toHaveCSS('outline-style', 'none');
  await expect(membership).toHaveCSS('box-shadow', 'none');
  await expect(membership).toHaveCSS('border-top-width', '2px');
  await expect(membership).toHaveCSS('border-top-color', 'rgb(49, 84, 59)');
  await expect(membership).toHaveJSProperty(
    'offsetHeight',
    Math.round(membershipHeightBeforeFocus)
  );
});

test('keeps the desktop rail sticky while the directory uses document scrolling', async ({
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
  await expect(tableWrap).toHaveCSS('overflow', 'visible');
  await expect(header).toHaveCSS('position', 'sticky');

  await page.evaluate(async () => {
    window.scrollTo(0, 240);
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });

  expect((await sidebar.boundingBox())?.y).toBeCloseTo(0, 1);
});

test('scrolls a constrained desktop sidebar to its lower unavailable areas', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 360 });
  await page.goto('/people');

  const sidebar = page.locator('#application-sidebar');
  const announcements = sidebar.locator('.nav-future').filter({ hasText: 'Announcements' });

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
  await expect(announcements).not.toHaveAttribute('tabindex');
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
  await page.getByRole('combobox', { name: 'Membership record' }).click();
  await page.getByRole('option', { name: 'Recognised member' }).click();
  await page.getByLabel('Recognition evidence or reference').fill('Recognition register, 2026');
  await page.getByLabel('Recognition date').fill('30/09/2026');
  await page.getByRole('button', { name: 'Save membership record' }).click();
  await expect(page.getByText('Membership record saved.')).toBeVisible();

  await page.getByRole('button', { name: 'Correct membership' }).click();
  await page.getByRole('combobox', { name: 'Membership record' }).click();
  await page.getByRole('option', { name: 'Not recorded' }).click();
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
