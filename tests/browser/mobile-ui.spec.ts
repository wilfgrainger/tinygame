import { expect, test, type Page } from '@playwright/test';

const bootstrap = {
  profile: {
    userId: 'u1',
    schemaVersion: 1,
    playerName: 'Tiny Tester',
    lastSpawnId: 'village-square',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  discoveries: [],
  home: { lampOn: false }
};

async function openAuthenticatedGame(page: Page) {
  await page.route('**/api/me', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { userId: 'u1', displayName: 'Tiny Tester', email: null } })
  }));
  await page.route('**/api/world/bootstrap', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: bootstrap })
  }));
  await page.goto('/');
  await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 15_000 });
}

async function joystickOffset(page: Page) {
  return page.locator('.move-pad .stick-knob').evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    if (transform === 'none') return { x: 0, y: 0 };
    const matrix = new DOMMatrixReadOnly(transform);
    return { x: matrix.m41, y: matrix.m42 };
  });
}

test('Android landscape keeps touch controls inside the viewport', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('android'), 'mobile project only');
  await openAuthenticatedGame(page);

  for (const selector of ['.move-pad', '.action-button.jump']) {
    const box = await page.locator(selector).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(915);
    expect(box!.y + box!.height).toBeLessThanOrEqual(412);
  }
});

test('focus loss clears an active movement stick so movement cannot become phantom input', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('android'), 'mobile project only');
  await openAuthenticatedGame(page);

  const pad = page.locator('.move-pad');
  const box = await pad.boundingBox();
  expect(box).not.toBeNull();

  const centreX = box!.x + box!.width / 2;
  const centreY = box!.y + box!.height / 2;
  await page.mouse.move(centreX, centreY);
  await page.mouse.down();
  await page.mouse.move(centreX + 30, centreY - 12);

  const moved = await joystickOffset(page);
  expect(Math.hypot(moved.x, moved.y)).toBeGreaterThan(10);

  await page.evaluate(() => window.dispatchEvent(new Event('blur')));

  await expect.poll(async () => {
    const offset = await joystickOffset(page);
    return Math.hypot(offset.x, offset.y);
  }).toBeLessThan(0.1);

  await page.mouse.up();
});
