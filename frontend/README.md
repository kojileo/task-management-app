# タスク管理アプリ（フロントエンド）

Next.jsを使用したタスク管理アプリケーションのフロントエンド部分です。

## 機能

- タスクの一覧表示
- タスクの作成、編集、削除
- タスクのステータス管理
- レスポンシブデザイン

## 技術スタック

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios
- React Hot Toast

## 開発環境のセットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. 開発サーバーの起動:
```bash
npm run dev
```

3. ブラウザで http://localhost:3000 を開く

## ビルド

```bash
npm run build
```

## 本番環境での実行

```bash
npm run start
```

## テスト

### 基本的なテスト実行
```bash
npm run test
```

### ウォッチモードでテスト実行
```bash
npm run test:watch
```

### カバレッジレポート付きでテスト実行
```bash
npm run test:coverage
```

### ユニットテスト実行（ライン50%、分岐40%の目標）
```powershell
powershell -File "ci/run-frontend-unittest.ps1"
```

### インテグレーションテスト実行（ライン80%、分岐70%の目標）
```powershell
powershell -File "ci/run-frontend-integrationtest.ps1"
```

### すべてのテストを一度に実行
```powershell
powershell -File "ci/run-frontend-test.ps1"
```

## 静的解析

プロジェクトの品質を保つため、以下の静的解析ツールを導入しています。

### TypeScript型チェック

```bash
npm run type-check
```

### ESLintによるコード品質チェック

```bash
npm run lint
```

コードの問題を自動的に修正する場合:

```bash
npm run lint:fix
```

### Prettierによるコードフォーマット

```bash
npm run format
```

### セキュリティスキャン

```bash
npm run security-scan
```

### 全ての静的解析を一度に実行

```powershell
powershell -File "ci/run-frontend-static.ps1"
```