# テスト戦略サンプルプロジェクト構成

## プロジェクト全体構成

```
task-management-app/
├── frontend/          # Next.jsフロントエンド
│   ├── src/
│   │   ├── app/          # アプリケーションルーティング
│   │   ├── components/   # UIコンポーネント
│   │   ├── lib/          # ユーティリティ関数
│   │   ├── types/        # 型定義
│   │   └── tests/        # テスト関連ファイル
│   ├── public/           # 静的ファイル
│   ├── .eslintrc.js      # ESLint設定
│   ├── jest.config.js    # Jestテスト設定
│   ├── next.config.js    # Next.js設定
│   └── package.json      # 依存関係
│
├── backend/           # C# ASP.NET バックエンド
│   ├── TaskManagement.API/
│   │   ├── Controllers/   # APIコントローラー
│   │   ├── Models/        # データモデル
│   │   ├── Services/      # ビジネスロジック
│   │   ├── Data/          # データベースコンテキスト
│   │   │   └── tasks.db   # SQLiteデータベースファイル
│   │   ├── Program.cs     # アプリケーションのエントリーポイント
│   │   └── appsettings.json # 設定ファイル
│   ├── TaskManagement.Tests/
│   │   ├── UnitTests/     # ユニットテスト
│   │   └── APITests/      # APIテスト
│   ├── TaskManagement.sln # ソリューションファイル
│   └── global.json        # .NET SDKバージョン設定
│
├── e2e/               # E2Eテスト
│   ├── tests/             # Playwrightテスト
│   ├── playwright.config.js # Playwright設定
│   └── package.json       # 依存関係
│
├── docs/              # ドキュメント
│
└── ci/                # CI/CD設定
    ├── pipeline.yml       # CIパイプライン定義
    └── test-scripts/      # テスト実行スクリプト
```

## データベース構成

### SQLiteデータベース
- ファイルベースのデータベースを使用
- 開発環境での簡単なセットアップ
- データの永続化と移植性
- 自動バックアップ機能付き

### データベースの特徴
- 自動タイムスタンプ管理
- インデックスによるパフォーマンス最適化
- バリデーションルールの実装
- 開発環境での詳細なログ出力

## テスト戦略対応表

| テストタイプ | 実装場所 | ツール | 主な対象 |
|------------|---------|-------|---------|
| **静的解析** | frontend/.eslintrc.js<br>backend/TaskManagement.API.ruleset | ESLint, StyleCop Analyzers | コード品質、セキュリティ |
| **フロントエンドのユニットテスト** | frontend/src/tests/unit/ | Jest, React Testing Library | コンポーネント、ユーティリティ |
| **フロントエンドのインテグレーションテスト** | frontend/src/tests/integration/ | Jest, React Testing Library, MSW | 複数コンポーネント連携 |
| **バックエンドのユニットテスト** | backend/TaskManagement.Tests/UnitTests/ | xUnit, Moq | サービス、ユーティリティ |
| **バックエンドのAPIテスト** | backend/TaskManagement.Tests/APITests/ | Postman | APIエンドポイント |
| **システム全体のE2Eテスト** | e2e/tests/ | Playwright | 一連のユーザーフロー |