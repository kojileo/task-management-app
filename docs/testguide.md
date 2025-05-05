# クラウドアプリケーションテスト実現ガイドライン

## 1. テスト戦略の概要

### 1.1 テストピラミッドとテスティングトロフィー

バックエンドのテストは以下定義で実施：

1. **単体テスト（Unit Tests）**
   - 最も数が多く、実行時間が短いテスト
   - コンポーネントやメソッドを独立して検証
   - モックやスタブを活用して依存関係を分離

2. **統合テスト（Integration Tests）**
   - 複数のコンポーネントの相互作用を検証

3. **API/契約テスト**
   - バックエンドAPIの動作と契約を検証
   - バックエンドの連携を保証

フロントエンドのテストは以下定義で実施：

1. **静的テスト（Static Tests）**
   - TypeScriptの型チェック
   - ESLintによるコード品質チェック
   - スタイルガイドの遵守確認

2. **単体テスト（Unit Tests）**
   - 個々のコンポーネントや関数を分離してテスト
   - 外部依存をモック化
   - `.spec.tsx` ファイルで実装
   - 子コンポーネントはモック化し、対象コンポーネントの責務のみをテスト

3. **統合テスト（Integration Tests）**
   - 複数のコンポーネントが連携する部分をテスト
   - 実際のレンダリングやユーザー操作をシミュレーション
   - `.test.tsx` ファイルで実装
   - 実際のコンポーネント階層を使用し、状態管理や複数コンポーネント間の連携をテスト

フロントエンドとバックエンド一気通貫のテストは以下定義で実施：

1. **E2Eテスト（End-to-End Tests）**
   - 実際のブラウザでユーザーフローを検証
   - バックエンドと連携した完全な機能テスト

### 1.2 テストカバレッジ目標


| コンポーネント | テストタイプ | ラインカバレッジ目標 | 分岐カバレッジ目標 |
|------------|----------|--------------|--------------|
| **フロントエンド** | 静的解析 | 100% | N/A |
| **フロントエンド** | ユニットテスト | 50% | 40% |
| **フロントエンド** | インテグレーションテスト | 80% | 70% |
| **バックエンド** | ユニットテスト | 85% | 75% |
| **バックエンド** | インテグレーションテスト | 60% | 50% |
| **バックエンド** | APIテスト | 40% | 30% |
| **フロントエンド+バックエンド** | E2Eテスト | 20% | 15% |

### 重要機能のテストカバレッジ目標（100%必須）

| 機能カテゴリ | テストタイプ | ラインカバレッジ目標 | 分岐カバレッジ目標 | 対象ファイル |
|------------|----------|--------------|--------------|------------|
| **API通信処理** | 全テストタイプ | 100% | 100% ||


### 1.3 テスト自動化の原則

- テストは自己完結し、他のテストに依存しないこと
- テストは再現性が高く、環境に依存しないこと
- テストは読みやすく、メンテナンスが容易であること
- 失敗時に明確なエラーメッセージを提供すること

## 2. フロントエンドテスト

### 2.1 単体テスト (Jest + React Testing Library)

フロントエンドの単体テストは、個々のコンポーネントを分離してテストします。外部依存はすべてモック化し、コンポーネントの内部ロジックと表示のみを検証します。ファイル名は `.spec.tsx` とします。

単体テストの例（`TaskCard.spec.tsx`）：

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskCard from '@/components/TaskCard';
import { TaskItem, TaskStatus } from '@/types/task';

// コンポーネントに必要な最小限のpropsのみを渡す単体テスト
describe('TaskCard', () => {
  // モックハンドラー
  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onStatusChange: jest.fn(),
  };

  // テスト用のタスク
  const mockTask: TaskItem = {
    id: 1,
    title: 'テストタスク',
    description: 'タスクの説明文',
    status: TaskStatus.NotStarted,
    dueDate: '2023-12-31',
    assignedTo: 'テストユーザー',
  };

  it('タスクの基本情報が正しく表示される', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    // タイトルが表示されることを確認
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
    
    // 説明が表示されることを確認
    expect(screen.getByText('タスクの説明文')).toBeInTheDocument();
  });

  it('編集ボタンをクリックすると、onEdit関数が呼ばれる', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    // ボタンをクリック
    const editButton = screen.getByTestId(`edit-button-${mockTask.id}`);
    fireEvent.click(editButton);
    
    // onEdit関数が正しく呼び出されたか確認
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTask);
  });
});
```

複合コンポーネントの単体テスト例（`TaskList.spec.tsx`）：

```typescript
// TaskCardコンポーネントをモック化
jest.mock('@/components/TaskCard', () => {
  const actual = jest.requireActual('@/types/task');
  
  return {
    __esModule: true,
    default: jest.fn(({ task }) => (
      <div data-testid={`mocked-task-card-${task.id}`}>{task.title}</div>
    )),
    statusColors: {
      [actual.TaskStatus.NotStarted]: 'mocked-blue',
      [actual.TaskStatus.InProgress]: 'mocked-yellow',
      [actual.TaskStatus.Completed]: 'mocked-green',
    },
    statusLabels: {
      [actual.TaskStatus.NotStarted]: '未着手',
      [actual.TaskStatus.InProgress]: '進行中',
      [actual.TaskStatus.Completed]: '完了',
    },
  };
});

describe('TaskList Unit Tests', () => {
  // ...

  it('各ステータスごとにタスクが表示される', () => {
    render(<TaskList tasks={mockTasks} loading={false} ... />);

    // 各ステータスのセクションが表示されていることを確認
    expect(screen.getByRole('heading', { name: '未着手' })).toBeInTheDocument();
    
    // モックされたTaskCardがレンダリングされているか確認
    expect(screen.getByTestId('mocked-task-card-1')).toBeInTheDocument();
  });
});
```

#### 単体テストのポイント

- **対象**: 単一コンポーネントのみ
- **外部依存**: すべてモック化（子コンポーネント含む）
- **検証対象**: props、イベントハンドラー、表示されるテキスト
- **ファイル名**: `.spec.tsx`
- **テストの粒度**: 細かい機能を一つずつテスト
- **セレクタ**: data-testidやrole属性を使用して要素を特定

### 2.2 統合テスト

フロントエンドの統合テストは、複数のコンポーネントが連携する様子や、実際のユーザーの操作フローをテストします。複雑な相互作用、状態管理、イベント処理などを検証します。ファイル名は `.test.tsx` とします。

統合テストの例（`TaskBoardIntegration.test.tsx`）：

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';

// 統合テスト用のTaskBoardコンポーネントを作成
function TaskBoard() {
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 1,
      title: '初期タスク',
      description: '初期タスクの説明',
      status: TaskStatus.NotStarted,
      dueDate: '2024-12-31',
      assignedTo: 'テストユーザー',
    },
  ]);
  
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  // イベントハンドラー関数...

  return (
    <div>
      <button onClick={handleNewTask} data-testid="new-task-button">
        新規タスク作成
      </button>
      
      {showForm && (
        <TaskForm 
          task={editingTask || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
      
      <TaskList
        tasks={tasks}
        loading={false}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

describe('TaskBoard Integration Tests', () => {
  it('完全なタスク追加フローが動作する', async () => {
    render(<TaskBoard />);
    
    // 初期状態を確認
    expect(screen.getByText('初期タスク')).toBeInTheDocument();
    
    // 新規タスク作成ボタンをクリック
    fireEvent.click(screen.getByTestId('new-task-button'));
    
    // フォームに値を入力
    fireEvent.change(screen.getByLabelText('タイトル'), { 
      target: { value: '新しいタスク' } 
    });
    
    // フォームを送信
    fireEvent.click(screen.getByText('保存'));
    
    // 新しいタスクが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('新しいタスク')).toBeInTheDocument();
    });
  });
  
  it('タスクのステータス変更が動作する', async () => {
    render(<TaskBoard />);
    
    // 初期タスクのステータスを変更
    const statusSelect = screen.getByTestId('status-select-1');
    fireEvent.change(statusSelect, { target: { value: TaskStatus.InProgress } });
    
    // 未着手のカラムにタスクがなくなることを確認
    const notStartedHeading = screen.getByRole('heading', { name: '未着手' });
    const notStartedColumn = notStartedHeading.closest('div')?.parentElement;
    expect(notStartedColumn).not.toContainElement(screen.getByText('初期タスク'));
    
    // 進行中のカラムにタスクが移動することを確認
    const inProgressHeading = screen.getByRole('heading', { name: '進行中' });
    const inProgressColumn = inProgressHeading.closest('div')?.parentElement;
    expect(inProgressColumn).toContainElement(screen.getByText('初期タスク'));
  });
});
```

#### 統合テストのポイント

- **対象**: 複数のコンポーネントとその連携
- **外部依存**: 実際のコンポーネントを使用（モックしない）
- **検証対象**: ユーザーフロー、コンポーネント間の連携、状態管理
- **ファイル名**: `.test.tsx`
- **テストの粒度**: ひとつのユーザーストーリーを完結させる
- **非同期処理**: waitForやactを使用して状態変更を適切に待機

### 2.3 コンポーネント構造の設計とテスト戦略

適切なテスト戦略を実現するためには、コンポーネント設計が重要です。以下の原則に従ってコンポーネントを設計することで、テスト効率が向上します：

1. **単一責任の原則**: 各コンポーネントは1つの責任のみを持つ
2. **コンポーネントの階層化**: 
   - 小さな純粋コンポーネント（Presentational）
   - 中間の複合コンポーネント
   - 大きなコンテナコンポーネント（Container）

例えば、タスク管理アプリでは以下のように分割しました：

- **TaskCard**: 単一のタスクカードの表示と操作（純粋コンポーネント）
- **TaskList**: 複数のタスクカードを管理・表示（複合コンポーネント）
- **TaskBoard**: タスクリストとフォームを組み合わせ、状態管理（コンテナ）

この設計により、以下のテスト戦略が可能になります：

1. **単体テスト**:
   - TaskCard: プロップスの受け取りと表示、イベント発火
   - TaskList: TaskCardのレンダリング（TaskCardをモック）

2. **統合テスト**:
   - TaskBoard: 実際のコンポーネントを使用し、ユーザーフロー全体

## 3. バックエンドテスト

### 3.1 単体テスト (xUnit)

バックエンドの単体テストは、コントローラー、サービス、リポジトリなどのクラスを個別にテストします。外部依存はすべてモック化し、対象クラスの動作のみを検証します。

現在の実装例（`UnitTests/TaskControllerTests.cs`）：

```csharp
using Xunit;
using Moq;
using TaskManagement.API.Controllers;
using TaskManagement.API.Models;
using TaskManagement.API.Services;
using Microsoft.AspNetCore.Mvc;
// ...

public class TaskControllerTests
{
    private readonly Mock<ITaskService> _mockTaskService;
    private readonly TaskController _controller;

    public TaskControllerTests()
    {
        _mockTaskService = new Mock<ITaskService>();
        _controller = new TaskController(_mockTaskService.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOkResult()
    {
        // Arrange
        var tasks = new List<TaskItem> { /* テスト用データ */ };
        _mockTaskService.Setup(s => s.GetAllTasksAsync())
            .ReturnsAsync(tasks);

        // Act
        var result = await _controller.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnValue = Assert.IsType<List<TaskItem>>(okResult.Value);
        Assert.Equal(2, returnValue.Count);
    }

    [Fact]
    public async Task GetById_NonExistentTask_ReturnsNotFound()
    {
        // Arrange
        _mockTaskService.Setup(s => s.GetTaskByIdAsync(999))
            .ReturnsAsync((TaskItem?)null);

        // Act
        var result = await _controller.GetById(999);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    // 例外処理のテスト
    [Fact]
    public async Task Update_ServiceThrowsArgumentException_ReturnsBadRequest()
    {
        // Arrange
        _mockTaskService.Setup(s => s.UpdateTaskAsync(It.IsAny<TaskItem>()))
            .ThrowsAsync(new ArgumentException("無効なデータ"));

        // Act & Assert
        // ...
    }
}
```

#### バックエンド単体テストのポイント

- **依存サービスのモック化**: DBアクセスなどの外部依存をモック
- **エラーケースの検証**: 例外処理や境界条件のテスト
- **HTTP応答の検証**: ステータスコードと返却値の検証
- **テストデータの適切な設定**: テストごとに適切なデータを準備
- **入力検証のテスト**: バリデーションエラーの適切な処理

### 3.2 統合テスト

バックエンドの統合テストでは、実際のアプリケーション構成を使用して、複数のコンポーネント（コントローラー、サービス、DBアクセス）が連携する様子をテストします。実際のHTTPリクエスト/レスポンスを使用します。

現在の実装例（`IntegrationTests/TaskControllerTests.cs`）：

```csharp
public class TaskControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public TaskControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        // ...
    }

    [Fact]
    public async Task GetById_WithValidId_ReturnsTask()
    {
        // Arrange - まず新しいタスクを作成
        var task = new TaskItem { /* ... */ };
        var createResponse = await _client.PostAsync(
            "/api/task", 
            CreateJsonContent(task));
        
        // レスポンスからIDを取得
        var jsonString = await createResponse.Content.ReadAsStringAsync();
        var responseDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonString);
        var createdTaskId = responseDict["id"].GetInt32();

        // Act
        var response = await _client.GetAsync($"/api/task/{createdTaskId}");

        // Assert
        response.EnsureSuccessStatusCode();
        // ...レスポンスの検証...
    }
}
```

#### バックエンド統合テストのポイント

- **実際のアプリケーション構成を使用**: より実環境に近いテスト
- **インメモリデータベースの活用**: テスト用の隔離されたDB環境
- **エンドツーエンドのリクエスト**: 実際のHTTPリクエスト/レスポンスを使用
- **テストデータの独立性**: テスト間の影響を排除

### 3.3 API/契約テスト (Postman)

Postmanを使ったAPIテスト例：

```json
{
  "name": "新しいタスクを作成",
  "event": [
    {
      "listen": "test",
      "script": {
        "exec": [
          "pm.test(\"ステータスコードは201である\", function () {",
          "    pm.response.to.have.status(201);",
          "});",
          "",
          "pm.test(\"レスポンスに新しいタスクIDが含まれている\", function () {",
          "    var jsonData = pm.response.json();",
          "    pm.expect(jsonData.id).to.be.a('number');",
          "    pm.variables.set(\"createdTaskId\", jsonData.id);",
          "});"
        ]
      }
    }
  ],
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
      "raw": "{\n  \"title\": \"新しいタスク\",\n  \"description\": \"...\",\n  \"status\": 0,\n  \"dueDate\": \"2023-12-31T00:00:00\",\n  \"assignedTo\": \"ユーザー名\"\n}"
    },
    "url": {
      "raw": "{{baseUrl}}/api/task"
    }
  }
}
```

#### APIテストのポイント

- **環境変数の活用**: 環境ごとの設定値を変数化
- **テストチェーンの構築**: テスト間でデータを連携（作成→取得→更新→削除）
- **レスポンスの詳細検証**: ステータスコード、データ構造、値の検証

## 4. E2Eテスト (Playwright)

E2Eテスト例（`task-management.spec.ts`）：

```typescript
import { test, expect } from '@playwright/test';

// すべてのテストで共有するタスク名とタイムスタンプ
const timestamp = Date.now();
const SHARED_TASK_TITLE = `E2Eテスト用タスク ${timestamp}`;

test.describe('タスク管理アプリケーションのE2Eテスト', () => {
  test('タスク管理の基本操作フロー（作成→編集→ステータス変更→削除）', async ({ page }) => {
    // アプリケーションにアクセス
    await page.goto('/');
    
    // ステップ1: タスクの作成
    await page.getByText('新規タスク').click();
    await page.fill('#title', SHARED_TASK_TITLE);
    // ...他のフィールドの入力...
    await page.getByText('保存').click();
    
    // タスクが表示されることを確認
    await expect(page.getByText(SHARED_TASK_TITLE)).toBeVisible({timeout: 10000});
    
    // ステップ2: タスクの編集
    const taskCard = page.getByText(SHARED_TASK_TITLE).locator('xpath=ancestor::div[contains(@class, "bg-white")]');
    await taskCard.getByRole('button', { name: /編集/ }).click();
    
    // 内容を更新
    const updatedDescription = '更新されたタスク説明文';
    await page.fill('#description', updatedDescription);
    await page.getByText('保存').click();
    
    // ステップ3: ステータス変更
    // ...
    
    // ステップ4: タスクの削除
    // ...
  });
});
```

### E2Eテストのポイント

- **ユーザーフローの網羅**: 重要なユースケースを完全に再現
- **ロバストなセレクタの使用**: data-testid、ロール、テキストなど複数の手段を用意
- **タイムアウトの適切な設定**: 環境による処理時間の違いに対応
- **スクリーンショットの活用**: 問題発生時の状態を保存
- **テストデータの一意性**: 重複を避けるためにタイムスタンプなどを活用
- **フォールバック機構**: セレクタ失敗時の代替手段を用意
- **エラーハンドリング**: 問題発生時に適切な情報を提供

## 5. テスト環境と自動化

### 5.1 環境構築

- **開発環境**: 自動化テストをローカルで実行可能な構成
- **CI環境**: パイプラインでの自動テスト実行
- **ステージング環境**: 本番に近い環境でのE2Eテスト

### 5.2 CI/CDパイプラインへの統合

1. プルリクエスト時に単体テストと統合テストを実行
2. デプロイ前の全テスト実行とリリース判断

### 5.3 テスト自動化のベストプラクティス

- **並列実行**: テスト実行時間の短縮
- **テストデータの隔離**: テスト間の干渉を防止
- **テスト結果のレポート**: 視覚的なフィードバック
- **テストカバレッジの測定**: テスト網羅度の評価

## 6. まとめと今後の改善計画

### 6.1 テスト戦略の主要ポイント

1. **テストの階層化**: 単体→統合→E2Eのピラミッド構造
2. **適切なモック化**: 単体テストではモック、統合テストでは実際のコンポーネント
3. **ファイル命名規則**: `.spec.tsx`は単体テスト、`.test.tsx`は統合テスト
4. **テスト対象の明確化**: 単体テストは個々のコンポーネント、統合テストはユーザーフロー

### 6.2 今後の改善計画

1. **テストカバレッジの向上**: 特に重要なビジネスロジックのカバレッジを100%に
2. **ビジュアルリグレッションテストの導入**: Storybookとの連携
3. **パフォーマンステストの追加**: ロード時間やレンダリング効率の測定
4. **アクセシビリティテストの強化**: WAI-ARIAガイドラインへの準拠チェック
5. **モバイル対応テストの拡充**: レスポンシブデザインの検証強化