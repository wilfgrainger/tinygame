import { expect, test } from '@playwright/test';

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

test('manifest is installable Android-first metadata', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest.name).toBe('TinyWorld');
  expect(manifest.display).toBe('standalone');
  expect(manifest.orientation).toBe('landscape');
  expect(manifest.start_url).toBe('/');
  expect(manifest.icons).toHaveLength(2);
});

test('manifest icons are actual PNG files', async ({ request }) => {
  for (const path of ['/icons/icon-192.png', '/icons/icon-512.png']) {
    const response = await request.get(path);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/png');
    const bytes = new Uint8Array(await response.body());
    expect([...bytes.slice(0, 8)]).toEqual(PNG_SIGNATURE);
  }
});

test('service worker never caches API traffic', async ({ request }) => {
  const response = await request.get('/sw.js');
  expect(response.ok()).toBe(true);
  const text = await response.text();
  expect(text).toContain("url.pathname.startsWith('/api/')");
  expect(text).not.toContain("cache.put('/api/");
});

test('release metadata exists', async ({ request }) => {
  const response = await request.get('/release.json');
  expect(response.ok()).toBe(true);
  const release = await response.json();
  expect(release.version).toBe('0.1.0');
});
