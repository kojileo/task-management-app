import { test, expect } from '@playwright/test';
import { TaskStatus } from '../../frontend/src/types/task';

/**
 * タスク管理アプリケーションのE2Eテスト
 * テスト戦略に基づいて以下の重要な機能をカバー:
 * - タスク作成から完了までの一連の流れ
 * - ステータス変更機能
 * - バリデーションとエラー処理
 */

// すべてのテストで共有するタスク名とタイムスタンプ
const timestamp = Date.now();
const SHARED_TASK_TITLE = `E2Eテスト用タスク ${timestamp}`;

test.describe('タスク管理アプリケーションのE2Eテスト', () => {
  // 単一のテストでタスク管理の全フローをテスト
  test('タスク管理の基本操作フロー（作成→編集→ステータス変更→削除）', async ({ page }) => {
    // アプリケーションにアクセス
    await page.goto('/');
    
    // データが読み込まれるのを待つ
    await expect(page.locator('[data-testid="loading-message"]')).toBeHidden({timeout: 30000});
    
    // ステップ1: タスクの作成
    console.log('ステップ1: タスクの作成');
    
    // 新規タスク作成ボタンをクリック
    await page.getByText('新規タスク').click();
    
    // フォームが表示されることを確認
    await expect(page.locator('[data-testid="task-form"]')).toBeVisible();
    
    // タスクフォームに内容を入力
    await page.fill('#title', SHARED_TASK_TITLE);
    await page.fill('#description', 'これはE2Eテスト用のタスク説明文です');
    await page.selectOption('#status', TaskStatus.NotStarted);
    
    // 翌日の日付を設定
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    await page.fill('#dueDate', formattedDate);
    
    await page.fill('#assignedTo', 'テストユーザー');
    
    // フォームの送信前にスクリーンショットを撮影
    await page.screenshot({ path: 'test-results/1-before-submit.png' });
    
    // 保存ボタンをクリック
    await page.getByText('保存').click();
    
    // フォームが閉じることを確認
    await expect(page.locator('[data-testid="task-form"]')).not.toBeVisible({timeout: 15000});
    
    // 作成したタスクが表示されることを確認（待機時間を長めに設定）
    try {
      await expect(page.getByText(SHARED_TASK_TITLE)).toBeVisible({timeout: 10000});
      
      // タスクのステータスが「未着手」カラムに表示されていることを確認
      const statusColumn = page.locator('h2:has-text("未着手")').locator('..').locator('..');
      await expect(statusColumn.getByText(SHARED_TASK_TITLE)).toBeVisible();
      
      // タスク作成後にスクリーンショットを撮影
      await page.screenshot({ path: 'test-results/1-after-submit.png' });
      console.log('✅ タスク作成成功');
    } catch (error) {
      console.error('❌ タスク作成の検証に失敗:', error);
      // エラー時のページ状態を保存
      await page.screenshot({ path: 'test-results/error-task-creation.png' });
      throw error;
    }
    
    // ステップ2: タスクの編集
    console.log('ステップ2: タスクの編集');
    
    // 作成したタスクのカードを特定
    const notStartedColumn = page.locator('h2:has-text("未着手")').locator('..').locator('..');
    const taskCard = notStartedColumn.getByText(SHARED_TASK_TITLE).locator('xpath=ancestor::div[contains(@class, "bg-white")]');
    await taskCard.waitFor({state: 'visible', timeout: 5000});
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'test-results/2-before-edit.png' });
    
    // タスクIDを取得
    const statusSelectId = await taskCard.locator('select').getAttribute('data-testid');
    let taskId = '1'; // デフォルト値
    if (statusSelectId) {
      const match = statusSelectId.match(/status-select-(\d+)/);
      if (match && match[1]) {
        taskId = match[1];
      }
    }
    
    console.log(`タスクID: ${taskId}を使用して編集ボタンを検索します`);
    
    // トーストを全てクリアするために少し待つ
    await page.waitForTimeout(2000);
    
    // 編集ボタンのクリック - 正確なdata-testidを使用
    try {
      // スクリーンショットを撮影
      await page.screenshot({ path: 'test-results/2-before-edit-button.png' });
      
      // 正確なdata-testidを使用
      await page.locator(`[data-testid="edit-button-${taskId}"]`).click({timeout: 5000});
    } catch (error) {
      console.log('正確なIDでの編集ボタン検索に失敗しました。代替方法を使用します');
      
      // 方法1: roleとnameの組み合わせ
      try {
        await taskCard.getByRole('button', { name: /編集/ }).click({timeout: 5000});
      } catch (error) {
        // 方法2: アイコンを含むボタンを検索
        try {
          await taskCard.locator('button:has(svg)').first().click({timeout: 5000});
        } catch (error) {
          // 方法3: 最後の手段としてボタンを順番で取得
          console.log('最終手段のセレクタを使用します');
          await page.screenshot({ path: 'test-results/debug-edit-button.png' });
          await taskCard.locator('button').nth(0).click({timeout: 5000});
        }
      }
    }
    
    // フォームが表示され、既存のデータが入力されていることを確認
    await expect(page.locator('[data-testid="task-form"]')).toBeVisible();
    await expect(page.locator('#title')).toHaveValue(SHARED_TASK_TITLE);
    
    // タスクの説明を更新
    const updatedDescription = '更新されたタスク説明文';
    await page.fill('#description', updatedDescription);
    
    // ステータスを「進行中」に変更
    await page.selectOption('#status', TaskStatus.InProgress);
    
    // 保存ボタンをクリック
    await page.getByText('保存').click();
    
    // フォームが閉じることを確認
    await expect(page.locator('[data-testid="task-form"]')).not.toBeVisible({timeout: 10000});
    
    // 更新が保存されるのを待つ（特定のトーストメッセージを確認）
    await expect(page.getByText('タスクを更新しました').first()).toBeVisible({timeout: 10000});
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'test-results/2-after-edit.png' });
    
    // 更新されたタスクが「進行中」カラムに表示されていることを確認
    const inProgressColumn = page.locator('h2:has-text("進行中")').locator('..').locator('..');
    await expect(inProgressColumn.getByText(SHARED_TASK_TITLE)).toBeVisible();
    console.log('✅ タスク編集成功');
    
    // ステップ3: タスクのステータス変更
    console.log('ステップ3: タスクのステータス変更');
    
    // タスクを見つけて、ステータス選択をクリック
    const updatedTaskCard = inProgressColumn.getByText(SHARED_TASK_TITLE).locator('xpath=ancestor::div[contains(@class, "bg-white")]');
    await updatedTaskCard.waitFor({state: 'visible', timeout: 5000});
    
    // 現在のステータスを確認（進行中であるはず）
    const statusSelect = updatedTaskCard.locator('select');
    await expect(statusSelect).toHaveValue(TaskStatus.InProgress);
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'test-results/3-before-status-change.png' });
    
    // トーストを全てクリアするために少し待つ
    await page.waitForTimeout(2000);
    
    // ステータスを「完了」に変更
    await statusSelect.selectOption(TaskStatus.Completed);
    
    // 変更が保存されるのを待つ（特定のトーストメッセージを確認）
    await expect(page.getByText('タスクのステータスを更新しました').first()).toBeVisible({timeout: 10000});
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'test-results/3-after-status-change.png' });
    
    // タスクが「完了」カラムに移動していることを確認
    const completedColumn = page.locator('h2:has-text("完了")').locator('..').locator('..');
    await expect(completedColumn.getByText(SHARED_TASK_TITLE)).toBeVisible();
    console.log('✅ ステータス変更成功');
    
    // ステップ4: タスクの削除
    console.log('ステップ4: タスクの削除');
    
    // タスクを見つけて、削除ボタンをクリック
    const completedTaskCard = completedColumn.getByText(SHARED_TASK_TITLE).locator('xpath=ancestor::div[contains(@class, "bg-white")]');
    await completedTaskCard.waitFor({state: 'visible', timeout: 5000});
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'test-results/4-before-delete.png' });
    
    // 最新のタスクIDを取得
    const completedStatusSelectId = await completedTaskCard.locator('select').getAttribute('data-testid');
    let currentTaskId = taskId;
    if (completedStatusSelectId) {
      const match = completedStatusSelectId.match(/status-select-(\d+)/);
      if (match && match[1]) {
        currentTaskId = match[1];
      }
    }
    
    // トーストを全てクリアするために少し待つ
    await page.waitForTimeout(2000);
    
    // 削除ボタンクリック - 正確なdata-testidを使用
    try {
      // スクリーンショットを撮影
      await page.screenshot({ path: 'test-results/4-before-delete-button.png' });
      
      await page.locator(`[data-testid="delete-button-${currentTaskId}"]`).click({timeout: 5000});
    } catch (error) {
      console.log('正確なIDでの削除ボタン検索に失敗しました。代替方法を使用します');
      
      // 方法1: roleとnameの組み合わせ
      try {
        await completedTaskCard.getByRole('button', { name: /削除/ }).click({timeout: 5000});
      } catch (error) {
        // 方法2: アイコンを含むボタンを検索
        try {
          await completedTaskCard.locator('button:has(svg)').nth(1).click({timeout: 5000});
        } catch (error) {
          // 方法3: 最後の手段としてボタンを順番で取得
          console.log('最終手段のセレクタを使用します');
          await page.screenshot({ path: 'test-results/debug-delete-button.png' });
          await completedTaskCard.locator('button').nth(1).click({timeout: 5000});
        }
      }
    }
    
    // 削除が完了するのを待つ（特定のトーストメッセージを確認）
    await expect(page.getByText('タスクを削除しました').first()).toBeVisible({timeout: 10000});
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'test-results/4-after-delete.png' });
    
    // タスクが削除されたことを確認
    await expect(page.getByText(SHARED_TASK_TITLE)).not.toBeVisible({timeout: 10000});
    console.log('✅ タスク削除成功');
  });
});
