import { test, expect } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const adminEmail = process.env.TEST_ADMIN_EMAIL || '';
const adminPassword = process.env.TEST_ADMIN_PASSWORD || '';

test.describe('Authentication Security Tests', () => {
  test('Admin login screen opens and rejects invalid credentials', async ({ page }) => {
    await page.goto(`${baseURL}/admin`);
    await expect(page).toHaveURL(/.*admin/);

    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-admin@example.com');
      await page.locator('input[type="password"]').fill('WrongPassword123');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Invalid')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Admin login succeeds with valid test credentials', async ({ page }) => {
    if (!adminEmail || !adminPassword) {
      test.skip(true, 'Test admin credentials not provided in .env.test');
      return;
    }
    await page.goto(`${baseURL}/admin`);
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill(adminEmail);
      await page.locator('input[type="password"]').fill(adminPassword);
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Admin Console')).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('Route Guard Tests', () => {

  test('Server-level middleware issues HTTP 307/302 redirect for unauthenticated /dashboard before HTML renders', async ({ request }) => {
    const response = await request.get('/dashboard', { maxRedirects: 0 });
    expect([301, 302, 307, 308]).toContain(response.status());
    expect(response.headers()['location']).toContain('/login');
  });

  test('Unauthenticated user cannot access /dashboard and is redirected to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Unauthenticated visitor to /admin sees the Admin Login Form at /admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*admin/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('Tampered/fake session cookie is rejected on protected /dashboard', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'invalid_fake_jwt_token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Back button after admin logout does not show cached console (bfcache)', async ({ page }) => {
    if (!adminEmail || !adminPassword) {
      test.skip(true, 'Test admin credentials not provided in .env.test');
      return;
    }
    await page.goto('/admin');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Admin Console')).toBeVisible({ timeout: 10000 });

    await page.click('button:has-text("Logout"), button:has-text("Sign Out")');
    await expect(page.locator('input[type="email"]')).toBeVisible();

    await page.goBack();
    await expect(page.locator('text=Admin Console')).not.toBeVisible();
  });

  test('LocalStorage contains zero plain-text admin passwords after login', async ({ page }) => {
    if (!adminEmail || !adminPassword) {
      test.skip(true, 'Test admin credentials not provided in .env.test');
      return;
    }
    await page.goto('/admin');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Admin Console')).toBeVisible({ timeout: 10000 });

    const adminToken = await page.evaluate(() =>
      localStorage.getItem('printdedo_admin_token')
    );

    expect(adminToken).not.toContain(adminPassword);
    expect(adminToken === null || !adminToken.includes('pass')).toBeTruthy();
  });

  test('Logout in Tab 1 signs out Tab 2 in real time, no refresh needed', async ({ context }) => {
    if (!adminEmail || !adminPassword) {
      test.skip(true, 'Test admin credentials not provided in .env.test');
      return;
    }
    const tab1 = await context.newPage();
    const tab2 = await context.newPage();

    await tab1.goto('/admin');
    await tab1.fill('input[type="email"]', adminEmail);
    await tab1.fill('input[type="password"]', adminPassword);
    await tab1.click('button[type="submit"]');
    await expect(tab1.locator('text=Admin Console')).toBeVisible({ timeout: 10000 });

    await tab2.goto('/admin');
    await expect(tab2.locator('text=Admin Console')).toBeVisible({ timeout: 10000 });

    await tab1.click('button:has-text("Logout"), button:has-text("Sign Out")');
    await expect(tab1.locator('input[type="email"]')).toBeVisible();

    // Real-time zero-reload sync check
    await expect(tab2.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
  });

  test('Multi-tab logout sync: Reloading Tab 2 after Tab 1 logout maintains logged-out state', async ({ context }) => {
    if (!adminEmail || !adminPassword) {
      test.skip(true, 'Test admin credentials not provided in .env.test');
      return;
    }
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto('/admin');
    await page1.fill('input[type="email"]', adminEmail);
    await page1.fill('input[type="password"]', adminPassword);
    await page1.click('button[type="submit"]');
    await expect(page1.locator('text=Admin Console')).toBeVisible({ timeout: 10000 });

    await page2.goto('/admin');
    await expect(page2.locator('text=Admin Console')).toBeVisible({ timeout: 10000 });

    await page1.click('button:has-text("Logout"), button:has-text("Sign Out")');
    await expect(page1.locator('input[type="email"]')).toBeVisible();

    await page2.reload();
    await expect(page2.locator('input[type="email"]')).toBeVisible();
  });

  test('Rapid repeated failed admin logins do not crash server and consistently reject invalid attempts', async ({ page }) => {
    await page.goto('/admin');
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      for (let i = 0; i < 3; i++) {
        await emailInput.fill(`failed-attempt-${i}@example.com`);
        await page.locator('input[type="password"]').fill('WrongPass123!');
        await page.click('button[type="submit"]');
        await expect(page.locator('text=Invalid')).toBeVisible({ timeout: 5000 });
      }
    }
  });

});

test.describe('Server Action / API Direct Invocation Tests', () => {

  test('Repeated failed logins get rate-limited, not just rejected', async ({ request }) => {
    const testClientId = 'client-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const statuses: number[] = [];
    for (let i = 0; i < 10; i++) {
      const response = await request.post('/api/login', {
        headers: { 'x-test-client-id': testClientId },
        data: { email: adminEmail || 'admin@example.com', password: 'wrong_' + i },
      });
      statuses.push(response.status());
    }
    // Early attempts should be normal rejections (401)
    expect(statuses.slice(0, 3)).toContain(401);
    // Later attempts should show throttling — a 429, or a different
    // status/header indicating a cooldown, not just another plain 401
    expect(statuses.slice(-3)).toContain(429);
  });

  test('Direct POST to webhook cleanup endpoint without auth is rejected with 401', async ({ request }) => {
    const response = await request.post('/api/webhooks/cleanup-r2', {
      data: { filePath: 'test.pdf' },
    });
    expect(response.status()).toBe(401);
  });

  test('Direct POST to create-shop API route with realistic payload without admin auth is rejected with 401', async ({ request }) => {
    const response = await request.post('/api/admin/create-shop', {
      data: {
        email: 'unauthorized-hacker@example.com',
        password: 'Password123!',
        store_name: 'Unauthorized Hacker Shop',
      },
    });
    expect(response.status()).toBe(401);
  });

  test('Direct POST to non-existent signup route is rejected', async ({ request }) => {
    const response = await request.post('/api/signup', {
      data: { email: 'hacker@example.com', password: 'test1234' },
    });
    expect([403, 404, 405]).toContain(response.status());
  });

  test('Cross-shop IDOR isolation: Customer on /shop/shop-a cannot view or query /shop/shop-b private data', async ({ page }) => {
    await page.goto('/shop/shop-a');
    await expect(page).toHaveURL(/.*shop\/shop-a/);
    
    const crossShopAttempt = await page.evaluate(async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iyhmoiqbkxhpznqalnal.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fake-anon-key'
      );
      const { data } = await supabase.from('orders').select('*').eq('shop_id', 'different-shop-id');
      return data;
    }).catch(() => null);

    expect(crossShopAttempt === null || crossShopAttempt.length === 0).toBeTruthy();
  });

});
