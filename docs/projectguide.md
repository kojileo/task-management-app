# テスト戦略サンプルプロジェクト構成

## プロジェクト全体構成

```
task-management-app/
├── frontend/          # Reactフロントエンド
│   ├── src/
│   │   ├── components/    # UIコンポーネント
│   │   ├── services/      # APIサービス
│   │   ├── store/         # 状態管理
│   │   ├── utils/         # ユーティリティ関数
│   │   └── tests/         # テスト関連ファイル
│   ├── .eslintrc.js       # ESLint設定
│   ├── jest.config.js     # Jestテスト設定
│   └── package.json       # 依存関係
│
├── backend/           # C# ASP.NET バックエンド
│   ├── TaskManagement.API/
│   │   ├── Controllers/   # APIコントローラー
│   │   ├── Models/        # データモデル
│   │   ├── Services/      # ビジネスロジック
│   │   ├── Repositories/  # データアクセス
│   │   ├── Program.cs     # アプリケーションのエントリーポイント
│   │   ├── Startup.cs     # アプリケーション設定
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

## テスト戦略対応表

| テストタイプ | 実装場所 | ツール | 主な対象 |
|------------|---------|-------|---------|
| **静的解析** | frontend/.eslintrc.js<br>backend/TaskManagement.API.ruleset | ESLint, StyleCop Analyzers | コード品質、セキュリティ |
| **フロントエンドのユニットテスト** | frontend/src/tests/unit/ | Jest, React Testing Library | コンポーネント、ユーティリティ |
| **フロントエンドのインテグレーションテスト** | frontend/src/tests/integration/ | Jest, React Testing Library, MSW | 複数コンポーネント連携 |
| **バックエンドのユニットテスト** | backend/TaskManagement.Tests/UnitTests/ | xUnit, Moq | サービス、ユーティリティ |
| **バックエンドのAPIテスト** | backend/TaskManagement.Tests/APITests/ | Postman | APIエンドポイント |
| **E2Eテスト** | e2e/tests/ | Playwright | 一連のユーザーフロー |