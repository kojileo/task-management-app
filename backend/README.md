# タスク管理アプリ（バックエンド）

C# ASP.NET Core を使用したタスク管理アプリケーションのバックエンド部分です。

## 機能

- タスクの一覧取得、検索API
- タスクの作成、編集、削除API
- タスクのステータス管理
- インメモリデータベースを使用したデータ永続化

## 技術スタック

- ASP.NET Core 7.0
- Entity Framework Core
- C# 11
- xUnit（テストフレームワーク）
- StyleCop（コード解析）

## 開発環境のセットアップ

1. 必要条件:
   - .NET 8.0 SDK
   - PowerShell 7.0以上（Windows/Linux/macOS）

2. 依存関係の復元:
```bash
dotnet restore
```

3. プロジェクトのビルド:
```bash
dotnet build
```

4. 開発サーバーの起動:
```bash
cd TaskManagement.API
dotnet run
```

5. ブラウザで https://localhost:7000/swagger を開く（ポートは環境により異なる場合があります）

## テスト

### 基本的なテスト実行
```bash
dotnet test
```

### カバレッジレポート付きでテスト実行
```bash
dotnet test --collect:"XPlat Code Coverage"
```

### ユニットテスト実行（ライン85%、分岐75%の目標）
```powershell
cd backend
powershell -File "ci/run-backend-unittest.ps1"
```

### 統合テスト実行（ライン60%、分岐50%の目標）
```powershell
cd backend
powershell -File "ci/run-backend-integrationtest.ps1"
```

### APIテスト実行（ライン40%、分岐30%の目標）
```powershell
cd backend
powershell -File "ci/run-backend-apitest.ps1"
```

### すべてのテストを一度に実行
```powershell
cd backend
powershell -File "ci/run-backend-test.ps1"
```

## 静的解析

プロジェクトの品質を保つため、以下の静的解析ツールを導入しています。

### StyleCopによるコード解析

```bash
dotnet build /p:TreatWarningsAsErrors=true
```

### エラーを警告として扱って構文チェック

```bash
dotnet build /p:TreatWarningsAsErrors=false
```

### セキュリティスキャン

```bash
dotnet list package --vulnerable
```

### すべての静的解析を一度に実行

```powershell
cd backend
powershell -File "ci/run-backend-static.ps1"
```

