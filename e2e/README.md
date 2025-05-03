# タスク管理アプリケーションのE2Eテスト

このディレクトリにはタスク管理アプリケーションのE2Eテストが含まれています。[Playwright](https://playwright.dev/)を使用して実装されています。

## 前提条件

- Node.js 14以上
- npm 6以上
- テスト対象のアプリケーションが起動していること

## セットアップ

```bash
# 依存関係をインストール
npm install

# Playwrightブラウザをインストール
npx playwright install
```

## テスト実行方法

### Windowsの場合

```bash
# 全テストをGUIモードで実行
run-tests.bat

# ヘッドレスモードで実行（CI環境向け）
run-tests.bat headless

# デバッグモードで実行
run-tests.bat headed debug

# 特定のブラウザでのみ実行（chrome, firefox, webkit, edge）
run-tests.bat headed normal chrome

# 特定のテストのみ実行（テスト名の一部を指定）
run-tests.bat headed normal all "タスク作成"

# テスト実行後にレポートを開く
run-tests.bat headed normal all "" report
```

### Linux/Macの場合

```bash
# 実行権限を付与
chmod +x run-tests.sh

# 全テストをGUIモードで実行
./run-tests.sh

# ヘッドレスモードで実行（CI環境向け）
./run-tests.sh headless

# デバッグモードで実行
./run-tests.sh headed debug

# 特定のブラウザでのみ実行（chrome, firefox, webkit, edge）
./run-tests.sh headed normal chrome

# 特定のテストのみ実行（テスト名の一部を指定）
./run-tests.sh headed normal all "タスク作成"

# テスト実行後にレポートを開く
./run-tests.sh headed normal all "" report
```

## テストファイル構成

- `task-flow.spec.ts` - タスク作成から完了までの基本フロー
- `task-management.spec.ts` - 総合的なタスク管理テスト

## レポート

テスト実行後、`playwright-report`ディレクトリにHTMLレポートが生成されます。以下のコマンドで表示できます：

```bash
npx playwright show-report
```

## スクリーンショット

テスト実行中のスクリーンショットは`test-results`ディレクトリに保存されます。

## テスト環境設定

`playwright.config.ts`ファイルでテスト環境の設定を行っています：

- 複数ブラウザでのテスト（Chrome, Firefox, Safari, Edge）
- モバイルブラウザでのテスト
- CI環境での設定
- タイムアウト値などのパラメータ設定

## トラブルシューティング

### テストが失敗する場合

1. アプリケーションが正常に起動しているか確認
2. Playwrightブラウザが正しくインストールされているか確認
3. テスト中のスクリーンショットで何が起きているか確認
4. デバッグモードで実行して詳細な情報を確認

```bash
# デバッグモードで実行
run-tests.bat headed debug
```

### ブラウザが表示されない場合

```bash
# 依存関係を再インストール
npm install
npx playwright install
``` 