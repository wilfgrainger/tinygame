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
