import { test, expect } from '@playwright/test';

test('タスクの作成から完了までのフロー', async ({ page }) => {
  await page.goto('/');

  // タスク作成
  await page.click('button[data-testid="create-task"]');
  await page.fill('input[name="title"]', 'テストタスク');
  await page.fill('textarea[name="description"]', 'テストの説明');
  await page.click('button[type="submit"]');

  // タスクの確認
  await expect(page.locator('text=テストタスク')).toBeVisible();

  // タスクの完了
  await page.click('button[data-testid="complete-task"]');
  await expect(page.locator('text=完了')).toBeVisible();
}); 