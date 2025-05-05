# APIテスト（Postman）

このディレクトリにはタスク管理アプリケーションのAPIテスト関連ファイルが格納されています。APIテストにはPostmanを使用しています。

## ディレクトリ構成

```
ApiTest/
 ├── Postman/                # Postmanコレクションとテスト環境定義
 │   ├── Task Management API.postman_collection.json  # APIテストコレクション 
 │   └── Task Management API - Local.postman_environment.json # ローカル環境変数
 └── TestResult/             # テスト実行結果
     └── Task Management API.postman_test_run.json    # テスト実行結果の出力例
```

## Postmanコレクションについて

Task Management APIコレクションには以下のAPIエンドポイントに対するテストが含まれています：

- `GET /api/task` - すべてのタスクを取得
- `GET /api/task/{id}` - 指定されたIDのタスクを取得
- `POST /api/task` - 新しいタスクを作成
- `PUT /api/task/{id}` - 既存のタスクを更新
- `DELETE /api/task/{id}` - タスクを削除

各リクエストにはテストスクリプトが含まれており、レスポンスの検証や環境変数の設定などを行います。

## テスト実行方法

### 前提条件

- [Postman](https://www.postman.com/downloads/)がインストールされていること
- バックエンドAPIサーバーが起動していること

### ローカル環境でPostmanを使って手動実行

1. Postmanを開き、`Task Management API.postman_collection.json`をインポート
2. `Task Management API - Local.postman_environment.json`環境ファイルをインポート
3. 右上の環境セレクタから「Task Management API - Local」を選択
4. コレクションを選択し、「Run」ボタンをクリックしてテストを実行

