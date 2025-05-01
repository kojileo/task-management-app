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

## テスト実装例

### フロントエンドのユニットテスト例

```typescript
// frontend/src/tests/unit/TaskList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import TaskList from '@/components/TaskList';
import { TaskStatus } from '@/types/task';

describe('TaskList', () => {
    const mockTasks = [
        {
            id: 1,
            title: 'テストタスク1',
            description: 'テスト説明1',
            status: TaskStatus.NotStarted,
            dueDate: '2024-01-01',
            assignedTo: 'テストユーザー1'
        }
    ];

    it('タスクが正しく表示されること', () => {
        render(
            <TaskList
                tasks={mockTasks}
                loading={false}
                onEdit={jest.fn()}
                onDelete={jest.fn()}
                onStatusChange={jest.fn()}
            />
        );

        expect(screen.getByText('テストタスク1')).toBeInTheDocument();
        expect(screen.getByText('テスト説明1')).toBeInTheDocument();
    });
});
```

### バックエンドのユニットテスト例

```csharp
// backend/TaskManagement.Tests/UnitTests/TaskServiceTests.cs
public class TaskServiceTests
{
    private readonly TaskService _taskService;
    private readonly ApplicationDbContext _context;

    public TaskServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase")
            .Options;
        _context = new ApplicationDbContext(options);
        _taskService = new TaskService(_context);
    }

    [Fact]
    public async Task CreateTask_ValidTask_ReturnsCreatedTask()
    {
        // Arrange
        var task = new TaskItem
        {
            Title = "テストタスク",
            Description = "テスト説明",
            Status = TaskStatus.NotStarted,
            DueDate = DateTime.Now.AddDays(7),
            AssignedTo = "テストユーザー"
        };

        // Act
        var result = await _taskService.CreateTaskAsync(task);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(task.Title, result.Title);
    }
}
```

### E2Eテスト例

```typescript
// e2e/tests/task-management.spec.ts
import { test, expect } from '@playwright/test';

test('タスクの作成と削除', async ({ page }) => {
    // タスク一覧ページに移動
    await page.goto('/');

    // 新規タスク作成
    await page.click('text=新規タスク');
    await page.fill('input[name="title"]', 'E2Eテストタスク');
    await page.fill('textarea[name="description"]', 'E2Eテスト説明');
    await page.click('button[type="submit"]');

    // タスクが作成されたことを確認
    await expect(page.locator('text=E2Eテストタスク')).toBeVisible();

    // タスクを削除
    await page.click('button[aria-label="削除"]');
    await expect(page.locator('text=E2Eテストタスク')).not.toBeVisible();
});
```

### フロントエンドのインテグレーションテスト例

```typescript
// frontend/src/tests/integration/TaskManagement.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { TaskStatus } from '@/types/task';
import App from '@/app/page';

// MSWサーバーの設定
const server = setupServer(
    rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.json([
            {
                id: 1,
                title: 'テストタスク1',
                description: 'テスト説明1',
                status: TaskStatus.NotStarted,
                dueDate: '2024-01-01',
                assignedTo: 'テストユーザー1'
            }
        ]));
    }),
    rest.post('/api/tasks', (req, res, ctx) => {
        return res(ctx.status(201), ctx.json({
            id: 2,
            title: '新規タスク',
            description: '新規説明',
            status: TaskStatus.NotStarted,
            dueDate: '2024-01-02',
            assignedTo: 'テストユーザー2'
        }));
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('タスク管理機能の統合テスト', () => {
    it('タスク一覧の取得と表示', async () => {
        render(<App />);
        
        // ローディング状態の確認
        expect(screen.getByText('読み込み中...')).toBeInTheDocument();
        
        // タスク一覧の表示を待機
        await waitFor(() => {
            expect(screen.getByText('テストタスク1')).toBeInTheDocument();
        });
    });

    it('新規タスクの作成', async () => {
        render(<App />);
        
        // 新規タスク作成ボタンをクリック
        await screen.findByText('新規タスク作成');
        fireEvent.click(screen.getByText('新規タスク作成'));
        
        // フォームに入力
        fireEvent.change(screen.getByLabelText('タイトル'), {
            target: { value: '新規タスク' }
        });
        fireEvent.change(screen.getByLabelText('説明'), {
            target: { value: '新規説明' }
        });
        
        // 送信ボタンをクリック
        fireEvent.click(screen.getByText('作成'));
        
        // 新規タスクが表示されることを確認
        await waitFor(() => {
            expect(screen.getByText('新規タスク')).toBeInTheDocument();
        });
    });
});
```

### バックエンドのAPIテスト例（Postman）

```json
// backend/TaskManagement.Tests/APITests/postman_collection.json
{
    "info": {
        "name": "タスク管理APIテスト",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "タスク一覧取得",
            "request": {
                "method": "GET",
                "header": [
                    {
                        "key": "Content-Type",
                        "value": "application/json"
                    }
                ],
                "url": {
                    "raw": "{{baseUrl}}/api/tasks",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "tasks"]
                }
            },
            "response": [
                {
                    "name": "成功レスポンス",
                    "originalRequest": {
                        "method": "GET",
                        "header": [],
                        "url": {
                            "raw": "{{baseUrl}}/api/tasks"
                        }
                    },
                    "status": "OK",
                    "code": 200,
                    "_postman_previewlanguage": "json",
                    "header": [
                        {
                            "key": "Content-Type",
                            "value": "application/json"
                        }
                    ],
                    "body": [
                        {
                            "id": 1,
                            "title": "テストタスク1",
                            "description": "テスト説明1",
                            "status": "NotStarted",
                            "dueDate": "2024-01-01",
                            "assignedTo": "テストユーザー1"
                        }
                    ]
                }
            ]
        },
        {
            "name": "タスク作成",
            "request": {
                "method": "POST",
                "header": [
                    {
                        "key": "Content-Type",
                        "value": "application/json"
                    }
                ],
                "body": {
                    "mode": "raw",
                    "raw": "{\n    \"title\": \"新規タスク\",\n    \"description\": \"新規説明\",\n    \"status\": \"NotStarted\",\n    \"dueDate\": \"2024-01-02\",\n    \"assignedTo\": \"テストユーザー2\"\n}"
                },
                "url": {
                    "raw": "{{baseUrl}}/api/tasks",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "tasks"]
                }
            },
            "response": [
                {
                    "name": "成功レスポンス",
                    "originalRequest": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"title\": \"新規タスク\",\n    \"description\": \"新規説明\",\n    \"status\": \"NotStarted\",\n    \"dueDate\": \"2024-01-02\",\n    \"assignedTo\": \"テストユーザー2\"\n}"
                        },
                        "url": {
                            "raw": "{{baseUrl}}/api/tasks"
                        }
                    },
                    "status": "Created",
                    "code": 201,
                    "_postman_previewlanguage": "json",
                    "header": [
                        {
                            "key": "Content-Type",
                            "value": "application/json"
                        }
                    ],
                    "body": {
                        "id": 2,
                        "title": "新規タスク",
                        "description": "新規説明",
                        "status": "NotStarted",
                        "dueDate": "2024-01-02",
                        "assignedTo": "テストユーザー2"
                    }
                }
            ]
        },
        {
            "name": "タスクステータス更新",
            "request": {
                "method": "PUT",
                "header": [
                    {
                        "key": "Content-Type",
                        "value": "application/json"
                    }
                ],
                "body": {
                    "mode": "raw",
                    "raw": "{\n    \"status\": \"InProgress\"\n}"
                },
                "url": {
                    "raw": "{{baseUrl}}/api/tasks/1/status",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "tasks", "1", "status"]
                }
            },
            "response": [
                {
                    "name": "成功レスポンス",
                    "originalRequest": {
                        "method": "PUT",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"status\": \"InProgress\"\n}"
                        },
                        "url": {
                            "raw": "{{baseUrl}}/api/tasks/1/status"
                        }
                    },
                    "status": "OK",
                    "code": 200,
                    "_postman_previewlanguage": "json",
                    "header": [
                        {
                            "key": "Content-Type",
                            "value": "application/json"
                        }
                    ],
                    "body": {
                        "id": 1,
                        "title": "テストタスク1",
                        "description": "テスト説明1",
                        "status": "InProgress",
                        "dueDate": "2024-01-01",
                        "assignedTo": "テストユーザー1"
                    }
                }
            ]
        }
    ],
    "event": [
        {
            "listen": "prerequest",
            "script": {
                "type": "text/javascript",
                "exec": [
                    "// テスト前の前処理",
                    "console.log('テスト開始');"
                ]
            }
        },
        {
            "listen": "test",
            "script": {
                "type": "text/javascript",
                "exec": [
                    "// レスポンスの検証",
                    "pm.test('ステータスコードが200であること', function () {",
                    "    pm.response.to.have.status(200);",
                    "});",
                    "",
                    "pm.test('レスポンスがJSON形式であること', function () {",
                    "    pm.response.to.have.header('Content-Type', 'application/json');",
                    "});",
                    "",
                    "pm.test('レスポンスボディが期待通りの構造であること', function () {",
                    "    var jsonData = pm.response.json();",
                    "    pm.expect(jsonData).to.have.property('id');",
                    "    pm.expect(jsonData).to.have.property('title');",
                    "    pm.expect(jsonData).to.have.property('description');",
                    "    pm.expect(jsonData).to.have.property('status');",
                    "    pm.expect(jsonData).to.have.property('dueDate');",
                    "    pm.expect(jsonData).to.have.property('assignedTo');",
                    "});"
                ]
            }
        }
    ],
    "variable": [
        {
            "key": "baseUrl",
            "value": "http://localhost:5000"
        }
    ]
}
```

## テスト環境設定

### フロントエンドのテスト環境
```javascript
// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
};
```

### バックエンドのテスト環境
```xml
<!-- TaskManagement.Tests/TaskManagement.Tests.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <TargetFramework>net7.0</TargetFramework>
        <IsPackable>false</IsPackable>
    </PropertyGroup>
    <ItemGroup>
        <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.0.0" />
        <PackageReference Include="xunit" Version="2.4.1" />
        <PackageReference Include="xunit.runner.visualstudio" Version="2.4.3" />
        <PackageReference Include="Moq" Version="4.18.4" />
    </ItemGroup>
</Project>
```

## CI/CDパイプライン設定

```yaml
# ci/pipeline.yml
name: Test Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: '7.0.x'
      
      - name: Install dependencies
        run: |
          cd frontend && npm install
          cd ../backend && dotnet restore
      
      - name: Run tests
        run: |
          cd frontend && npm test
          cd ../backend && dotnet test
          cd ../e2e && npm test
```

## テストカバレッジ目標

| コンポーネント | テストタイプ | ラインカバレッジ目標 | 分岐カバレッジ目標 |
|------------|----------|--------------|--------------|
| **フロントエンド** | ユニットテスト | 80% | 70% |
| **フロントエンド** | インテグレーションテスト | 90% | 80% |
| **バックエンド** | ユニットテスト | 90% | 80% |
| **バックエンド** | APIテスト | 95% | 85% |
| **E2Eテスト** | ユーザーフロー | 主要フロー100% | - |