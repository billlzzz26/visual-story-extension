import { test, expect } from '@playwright/test';

test.describe('Visual Story Planner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the main page with sidebar', async ({ page }) => {
    await expect(page.getByText('Visual Story Planner', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Editor' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Graph' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Timeline' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Insights' })).toBeVisible();
  });

  test('should show Editor view with characters by default', async ({ page }) => {
    await expect(page.locator('text=Characters')).toBeVisible();
    await expect(page.locator('text=Conflicts')).toBeVisible();
    await expect(page.locator('text=Luke Skywalker')).toBeVisible();
    await expect(page.locator('text=Darth Vader')).toBeVisible();
    await expect(page.locator('text=Obi-Wan Kenobi')).toBeVisible();
  });

  test('should switch to Graph view', async ({ page }) => {
    await page.click('text=Graph');
    await expect(page.locator('text=A New Hope - Hero\'s Journey')).toBeVisible();
    await expect(page.locator('text=Story Flow Diagram')).toBeVisible();
  });

  test('should switch to Timeline view', async ({ page }) => {
    await page.click('text=Timeline');
    await expect(page.locator('text=Story Timeline')).toBeVisible();
    await expect(page.locator('text=The Call to Adventure')).toBeVisible();
  });

  test('should switch to Insights view with dashboard', async ({ page }) => {
    await page.click('text=Insights');
    await expect(page.locator('text=Events')).toBeVisible();
    await expect(page.getByText('Characters', { exact: true })).toBeVisible();
    await expect(page.getByText('Conflicts', { exact: true })).toBeVisible();
    await expect(page.getByText('Pacing', { exact: true })).toBeVisible();
    await expect(page.locator('text=3-Act Structure Distribution')).toBeVisible();
    await expect(page.locator('text=Structure Health')).toBeVisible();
    await expect(page.locator('text=Validation')).toBeVisible();
  });

  test('should display character roles correctly', async ({ page }) => {
    await expect(page.locator('text=protagonist').first()).toBeVisible();
    await expect(page.locator('text=antagonist')).toBeVisible();
    await expect(page.locator('text=mentor')).toBeVisible();
  });

  test('should display stats in Insights view', async ({ page }) => {
    await page.click('text=Insights');
    await expect(page.locator('text=5').first()).toBeVisible();
    await expect(page.locator('text=3').first()).toBeVisible();
    await expect(page.locator('text=2').first()).toBeVisible();
    await expect(page.locator('text=fast').first()).toBeVisible();
  });

  test('should display act distribution bar', async ({ page }) => {
    await page.click('text=Insights');
    await expect(page.locator('text=Act 1: 3')).toBeVisible();
    await expect(page.locator('text=Act 2: 1')).toBeVisible();
    await expect(page.locator('text=Act 3: 1')).toBeVisible();
  });

  test('should display health check with midpoint and climax', async ({ page }) => {
    await page.click('text=Insights');
    await expect(page.locator('text=Midpoint').first()).toBeVisible();
    await expect(page.locator('text=Climax').first()).toBeVisible();
    await expect(page.locator('text=✓').first()).toBeVisible();
    await expect(page.locator('text=Structure Score')).toBeVisible();
  });

  test('should display validation panel', async ({ page }) => {
    await page.click('text=Insights');
    await expect(page.locator('text=No structural issues found')).toBeVisible();
    await expect(page.locator('text=Recommendations')).toBeVisible();
  });

  test('should display conflicts in Editor view', async ({ page }) => {
    await expect(page.locator('text=external').first()).toBeVisible();
    await expect(page.locator('text=internal')).toBeVisible();
  });

  test('should have working navigation tabs', async ({ page }) => {
    const navItems = ['Editor', 'Graph', 'Timeline', 'Insights'];
    for (const item of navItems) {
      await expect(page.locator(`button:has-text("${item}")`)).toBeVisible();
    }
  });
});