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

### インテグレーションテスト実行（ライン60%、分岐50%の目標）
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

## Postmanでのテスト

プロジェクトにはPostmanコレクションが含まれており、APIエンドポイントを簡単にテストできます。

### Postmanのセットアップ

1. [Postman](https://www.postman.com/downloads/)をダウンロードしてインストールします
2. Postmanを起動し、「Import」ボタンをクリックします
3. `backend/postman_collection.json`ファイルをインポートします

### 環境変数の設定

1. Postmanで「Environments」を開き、新しい環境を作成します
2. 以下の変数を設定します:
   - `baseUrl`: APIのベースURL（例: `http://localhost:5045`）
   - `taskId`: テストに使用するタスクID（例: `1`）

### テストの実行

1. インポートしたコレクションを開きます
2. 環境を選択します
3. 各エンドポイントをテストします:
   - 「Get All Tasks」: タスクの一覧を取得します
   - 「Get Task by ID」: 特定のタスクを取得します
   - 「Create New Task」: 新しいタスクを作成します
   - 「Update Task」: 既存のタスクを更新します
   - 「Delete Task」: タスクを削除します

### 自動テストの実行

コレクションランナーを使って自動テストを実行できます:

1. コレクション名の横にある「...」ボタンをクリックし、「Run collection」を選択します
2. 実行するリクエストを選択します
3. 「Run」ボタンをクリックしてテストを実行します

### CI/CDでのPostmanテスト

Newman（Postmanのコマンドラインツール）を使ってCI/CDパイプラインでテストを自動化できます:

```bash
# Newmanのインストール
npm install -g newman

# テストの実行
newman run backend/postman_collection.json --environment=environment.json
```

プロジェクトにはNewmanを使用した自動テスト実行スクリプトが含まれています:

```powershell
cd backend
powershell -File "ci/run-backend-postman-tests.ps1"
```

このスクリプトは以下の機能を提供します:
- Newmanが未インストールの場合、自動インストールを試みます
- APIサーバーが起動しているか確認します
- テスト結果をHTML形式で出力します
- テストの成功/失敗に基づいて終了コードを返します

### 注意事項

1. **Newmanエラー「Invalid IP address: undefined」**: これはNewmanの既知の問題です。以下の対処法を試してください：
   - **推奨**: Postmanデスクトップアプリでコレクションを直接実行してください。デスクトップアプリではこの問題は発生しません。
   - **APIテストの手順**:
     1. PostmanでAPIテスト用の環境をセットアップ
     2. コレクションをインポート
     3. 「Runner」ボタンをクリックしてテストを実行
     4. レポートを確認

   - 他の回避策（成功しないケースもあります）:
     - Newman 5.xバージョンを使用: `npm install -g newman@5`
     - 環境変数の代わりにコマンドラインで直接URLを指定: 
       ```
       newman run collection.json --env-var "baseUrl=localhost:5045"
       ```
     - 簡易版のNewmanスクリプトを使用:
       ```powershell
       cd backend
       powershell -File "ci/run-newman-direct.ps1"
       ```

2. **実際のCI環境での対応**: CI/CD環境で自動テストを行う場合は、以下のいずれかの方法を採用してください：
   - APIエンドポイントに対する直接HTTPリクエストを行うテストを作成（Newmanではなく）
   - Headless Chromeを使用したPuppeteerスクリプトでPostmanをブラウザから実行
   - 基本的なHTTPクライアントライブラリを使用したテストスクリプトの作成

3. **HTML/JSONレポーターのインストール**: レポート形式の問題が発生する場合は、以下のコマンドでレポーターを明示的にインストールしてください:
   ```
   npm install -g newman-reporter-html newman-reporter-json
   ```

4. **Windows PowerShellでの実行**: テストスクリプトを実行する際には、UTF-8エンコーディングを指定するとエラーを回避できます:
   ```
   powershell -Encoding UTF8 -File "ci/run-backend-postman-tests.ps1"
   ```

