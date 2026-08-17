import { expect, test } from '@playwright/test';

test('manifest is installable Android-first metadata', async ({ request }) => { const response=await request.get('/manifest.webmanifest'); expect(response.ok()).toBe(true); const m=await response.json(); expect(m.name).toBe('TinyWorld'); expect(m.display).toBe('standalone'); expect(m.orientation).toBe('landscape'); expect(m.icons).toHaveLength(2); });
test('service worker never caches API traffic', async ({ request }) => { const response=await request.get('/sw.js'); expect(response.ok()).toBe(true); const text=await response.text(); expect(text).toContain("url.pathname.startsWith('/api/')"); });
test('release metadata exists', async ({ request }) => { const response=await request.get('/release.json'); expect(response.ok()).toBe(true); const release=await response.json(); expect(release.version).toBe('0.1.0'); });
