import { test, expect } from '@playwright/test';

test.describe('Home Spoken Centre - User Journey', () => {
  test('Landing Page -> Open Course -> Navigation -> Auth Modal', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Verify Landing Screen Title/Poster
    await expect(page.locator('#open-course')).toBeVisible();

    // Click OPEN COURSE
    await page.click('#open-course');

    // Verify Course Index visible
    await expect(page.locator('h1')).toHaveText('INDEX');

    // Click Relative Circle
    await page.click('button[data-open-circle="relative"], .category:has-text("Relative Circle")');

    // Unauthenticated user should see Login Modal
    await expect(page.locator('.modal-title')).toHaveText('Student Login');
  });
});
