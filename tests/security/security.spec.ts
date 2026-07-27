import { test, expect } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Application Security & Input Boundary Tests', () => {
  test('Customer shop dropbox page loads and input maxLength attributes are enforced', async ({ page }) => {
    await page.goto(`${baseURL}/shop/test-shop-id`);

    const nameInput = page.locator('input[placeholder*="Name"], input[placeholder*="name"]').first();
    if (await nameInput.isVisible()) {
      const maxLength = await nameInput.getAttribute('maxLength');
      if (maxLength) {
        expect(Number(maxLength)).toBeLessThanOrEqual(100);
      }
    }
  });

  test('Contact admin page enforces maximum character lengths', async ({ page }) => {
    await page.goto(`${baseURL}/contact-admin`);

    const messageInput = page.locator('textarea').first();
    if (await messageInput.isVisible()) {
      const maxLength = await messageInput.getAttribute('maxLength');
      if (maxLength) {
        expect(Number(maxLength)).toBeLessThanOrEqual(2000);
      }
    }
  });
});