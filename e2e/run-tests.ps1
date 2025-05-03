# PowerShellスクリプトのエンコーディングをUTF-8に設定
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "タスク管理アプリケーションのE2Eテストを実行します..."
Write-Host "---------------------------------------------"

# 現在のディレクトリに移動
Set-Location -Path $PSScriptRoot

# バックエンドとフロントエンドが起動していることを確認するためのメッセージ
Write-Host "※ 注意: このスクリプトを実行する前に、バックエンドとフロントエンドのサーバーが"
Write-Host "    起動していることを確認してください。"
Write-Host ""
Write-Host "  フロントエンド: http://localhost:3000 (Next.js)"
Write-Host "  バックエンド: http://localhost:8080 (Express)"
Write-Host ""

$confirmation = Read-Host "サーバーが起動していますか？ (y/n)"
if ($confirmation -ne "y") {
    Write-Host "テストを中止します。サーバーを起動してから再度実行してください。"
    exit
}

# テスト実行の開始
Write-Host ""
Write-Host "E2Eテストを実行中..."
Write-Host "---------------------------------------------"

# テスト実行コマンド
npx playwright test

# テスト結果の表示
Write-Host ""
Write-Host "テスト実行が完了しました。"
Write-Host "詳細なレポートを確認するには次のコマンドを実行してください："
Write-Host "npx playwright show-report" 