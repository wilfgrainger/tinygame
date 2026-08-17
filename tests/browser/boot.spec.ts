import { expect, test } from '@playwright/test';

const bootstrap = { profile:{userId:'u1',schemaVersion:1,playerName:'Tiny Tester',lastSpawnId:'village-square',createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z'}, discoveries:[], home:{lampOn:false} };

test('signed-out shell shows Google sign-in and build stamp', async ({ page }) => {
  await page.route('**/api/me', (route) => route.fulfill({ status:401, contentType:'application/json', body:JSON.stringify({ok:false,error:{code:'AUTH_REQUIRED',message:'Sign in'}}) }));
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Continue with Google'})).toBeVisible();
  await expect(page.locator('.shell-stamp')).toContainText('v0.1.0');
});

test('authenticated bootstrap enters the world shell', async ({ page }) => {
  await page.route('**/api/me', (route) => route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ok:true,data:{userId:'u1',displayName:'Tiny Tester',email:null}}) }));
  await page.route('**/api/world/bootstrap', (route) => route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ok:true,data:bootstrap}) }));
  await page.goto('/');
  await expect(page.locator('.build-stamp')).toBeVisible({ timeout:15000 });
  await expect(page.locator('#game-canvas')).toBeVisible();
});
