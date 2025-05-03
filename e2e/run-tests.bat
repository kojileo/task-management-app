@echo off
chcp 65001 > nul
setlocal

echo タスク管理アプリケーションのE2Eテストを実行します...
echo ---------------------------------------------

rem バックエンドとフロントエンドが起動していることを確認するためのメッセージ
echo ※ 注意: このスクリプトを実行する前に、バックエンドとフロントエンドのサーバーが
echo     起動していることを確認してください。
echo.
echo   フロントエンド: http://localhost:3000 (Next.js)
echo   バックエンド: http://localhost:8080 (Express)
echo.

set /p confirm=サーバーが起動していますか？ (y/n): 
if /i not "%confirm%"=="y" (
    echo テストを中止します。サーバーを起動してから再度実行してください。
    exit /b 1
)

rem テスト実行の開始
echo.
echo E2Eテストを実行中...
echo ---------------------------------------------

rem テスト実行コマンド
npx playwright test

rem テスト結果の表示
echo.
echo テスト実行が完了しました。
echo 詳細なレポートを確認するには次のコマンドを実行してください：
echo npx playwright show-report

endlocal 