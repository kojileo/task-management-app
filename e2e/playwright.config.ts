import { defineConfig, devices } from '@playwright/test';

/**
 * テスト戦略に従った設定:
 * - 複数ブラウザでのテスト（Chrome, Firefox, Safari, Edge）
 * - 基本的なモバイル対応チェック
 * - 効率的なテスト実行と詳細なレポート
 */
export default defineConfig({
  testDir: './tests',
  // 並列実行をオフにして、テストの重複を防止
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  /* テスト失敗時の再試行回数 */
  retries: process.env.CI ? 2 : 1,
  /* 並列実行の設定 - 複数のテスト実行によるタスク重複を防ぐため1に設定 */
  workers: 1,
  /* テスト結果レポート設定 */
  reporter: [
    ['html', { open: 'never' }],
    ['line'],
    ['json', { outputFile: 'test-results/test-results.json' }],
  ],
  /* 共通設定 */
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    /* 各テストの前にCookieと保存データをクリア */
    storageState: { cookies: [], origins: [] },
  },
  /* テスト対象ブラウザの設定（テスト戦略に基づく） */
  projects: [
    // デフォルトではChromiumのみを有効にし、他はコメントアウト
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /* 必要に応じて有効化
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'edge',
      use: { 
        channel: 'msedge',
        ...devices['Desktop Edge'],
      },
    },
    // モバイル対応チェック
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
    // アクセシビリティテスト用プロジェクト
    {
      name: 'accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        // アクセシビリティテスト用の追加設定
        extraHTTPHeaders: {
          // Googleボットとしてのヘッダーを追加
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
        },
      },
    },
    */
  ],
  /* 開発サーバーの起動設定 */
  webServer: {
    command: 'cd ../frontend && npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 60000,
  },
  /* 出力ディレクトリ設定 */
  outputDir: 'test-results/screenshots',
  snapshotDir: 'test-results/snapshots',
  /* タイムアウト設定（ミリ秒） */
  timeout: 60000, // 全テストのグローバルタイムアウト
  expect: {
    timeout: 10000, // 要素の表示を待つタイムアウト
  },
}); 