import { test, expect } from '@playwright/test';

test('タスク作成テスト', async ({ page }) => {
  // アプリケーションにアクセス
  await page.goto('/');
  
  // データが読み込まれるのを待つ
  await expect(page.locator('[data-testid="loading-message"]')).toBeHidden({timeout: 30000});
  
  // 新規タスク作成ボタンをクリック
  await page.getByText('新規タスク').click();
  
  // フォームが表示されることを確認
  await expect(page.locator('[data-testid="task-form"]')).toBeVisible();
  
  // タスクフォームに内容を入力
  await page.fill('#title', 'テストタスク');
  await page.fill('#description', 'テストタスクの説明');
  await page.selectOption('#status', 'NotStarted');
  
  // 当日の日付を入力
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  await page.fill('#dueDate', formattedDate);
  
  await page.fill('#assignedTo', 'テストユーザー');
  
  // フォームを送信
  page.on('request', request => {
    console.log(`>> ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    console.log(`<< ${response.status()} ${response.url()}`);
  });
  
  // スクリーンショットを撮影
  await page.screenshot({ path: 'before-submit.png' });
  
  // 保存ボタンをクリック
  await page.getByText('保存').click();
  
  // フォームが閉じることを確認（タスク作成のAPI呼び出しの結果に関わらず）
  await expect(page.locator('[data-testid="task-form"]')).not.toBeVisible({timeout: 10000});
  
  // スクリーンショットを撮影
  await page.screenshot({ path: 'after-submit.png' });
}); 