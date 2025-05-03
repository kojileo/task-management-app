import { test, expect } from '@playwright/test';

test('アプリケーション基本表示テスト', async ({ page }) => {
  // アプリケーションにアクセス
  await page.goto('/');
  
  // データが読み込まれるのを待つ
  await expect(page.locator('[data-testid="loading-message"]')).toBeHidden({timeout: 30000});
  
  // タスク一覧が表示されていることを確認
  await expect(page.locator('h1')).toHaveText('タスク管理');
  
  // 新規タスク作成ボタンの存在を確認
  await expect(page.getByText('新規タスク')).toBeVisible();
});

test('フォーム表示テスト', async ({ page }) => {
  // アプリケーションにアクセス
  await page.goto('/');
  
  // 読み込みを待つ
  await expect(page.locator('[data-testid="loading-message"]')).toBeHidden({timeout: 30000});
  
  // 新規タスク作成ボタンをクリック
  await page.getByText('新規タスク').click();
  
  // フォームが表示されることを確認
  await expect(page.locator('[data-testid="task-form"]')).toBeVisible();
  
  // フォームのラベルを確認
  await expect(page.locator('label[for="title"]')).toBeVisible();
  await expect(page.locator('label[for="description"]')).toBeVisible();
  await expect(page.locator('label[for="status"]')).toBeVisible();
  await expect(page.locator('label[for="dueDate"]')).toBeVisible();
  await expect(page.locator('label[for="assignedTo"]')).toBeVisible();
}); 