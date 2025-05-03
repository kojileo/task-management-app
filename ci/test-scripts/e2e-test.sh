#!/bin/bash
set -e

echo "E2Eテスト実行とカバレッジ検証"
echo "------------------------------"

# ルートディレクトリに移動
cd "$(dirname "$0")/../.."

# 環境変数設定
export CI=true

# バックエンド起動
echo "バックエンドを起動中..."
cd backend/TaskManagement.API
dotnet build
dotnet run --urls=http://localhost:5045 &
BACKEND_PID=$!

# バックエンドの起動を待機
echo "バックエンドの起動を待機中..."
sleep 10

# フロントエンド起動
echo "フロントエンドを起動中..."
cd ../../frontend
npm ci
npm run build
npm run start &
FRONTEND_PID=$!

# フロントエンドの起動を待機
echo "フロントエンドの起動を待機中..."
sleep 15

# E2Eテスト実行
echo "E2Eテストを実行中..."
cd ../e2e
npm ci
npx playwright install --with-deps chromium
npm test

# テスト結果の確認
TEST_RESULT=$?

echo "E2Eテスト完了 (終了コード: $TEST_RESULT)"

# プロセスの終了
echo "テスト用プロセスを終了しています..."
kill $FRONTEND_PID || true
kill $BACKEND_PID || true

# 結果の出力
if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ E2Eテストは成功しました"
    exit 0
else
    echo "❌ E2Eテストは失敗しました"
    exit 1
fi 