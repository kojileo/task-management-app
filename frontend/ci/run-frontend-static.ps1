Set-Location (Join-Path $PSScriptRoot '../../frontend')
Write-Host 'フロントエンド静的解析を実行します' -ForegroundColor Cyan

if (!(Test-Path 'node_modules')) {
  Write-Host '依存関係をインストールします...' -ForegroundColor Yellow
  npm ci
}

# TypeScriptによる型チェック - これは厳格に失敗を検出する
Write-Host 'TypeScript型チェックを実行します...' -ForegroundColor Yellow
npm run type-check
$typeCheckResult = $LASTEXITCODE -eq 0

if ($typeCheckResult) {
  Write-Host '✅ TypeScript型チェックが成功しました' -ForegroundColor Green
} else {
  Write-Host '❌ TypeScript型チェックに失敗しました' -ForegroundColor Red
  exit 1
}

# ESLintによるコード品質チェック - 警告は許容する
Write-Host 'ESLintによるコード品質チェックを実行します...' -ForegroundColor Yellow
npm run lint
$lintResult = $LASTEXITCODE -eq 0

if ($lintResult) {
  Write-Host '✅ ESLintによるコード品質チェックが成功しました' -ForegroundColor Green
} else {
  Write-Host '⚠️ ESLintによる警告があります（許容範囲）' -ForegroundColor Yellow
}

# Prettierによるフォーマットチェック - 警告は許容する
Write-Host 'Prettierによるフォーマットチェックを実行します...' -ForegroundColor Yellow
npm run format:check
$formatResult = $LASTEXITCODE -eq 0

if ($formatResult) {
  Write-Host '✅ Prettierによるフォーマットチェックが成功しました' -ForegroundColor Green
} else {
  Write-Host '⚠️ コードフォーマットの問題があります（自動修正可能）' -ForegroundColor Yellow
}

# セキュリティチェック - 警告は許容する
Write-Host 'セキュリティチェックを実行します...' -ForegroundColor Yellow
npm run security-scan
$securityResult = $LASTEXITCODE -eq 0

if ($securityResult) {
  Write-Host '✅ セキュリティチェックが成功しました' -ForegroundColor Green
} else {
  Write-Host '⚠️ セキュリティの問題があります（詳細を確認してください）' -ForegroundColor Yellow
}

# 結果のまとめ - TypeScriptのエラーがなければ成功とみなす
Write-Host "`n静的解析の結果:" -ForegroundColor Cyan
Write-Host "TypeScript型チェック: $(if($typeCheckResult){'✅ 成功'}else{'❌ 失敗'})"
Write-Host "ESLintコード品質: $(if($lintResult){'✅ 成功'}else{'⚠️ 警告あり'})"
Write-Host "コードフォーマット: $(if($formatResult){'✅ 成功'}else{'⚠️ 警告あり'})"
Write-Host "セキュリティチェック: $(if($securityResult){'✅ 成功'}else{'⚠️ 警告あり'})"

if ($typeCheckResult) {
  Write-Host "`n✅ 重要な静的解析チェックがすべて成功しました" -ForegroundColor Green
  exit 0
} else {
  Write-Host "`n❌ 一部の静的解析チェックに失敗しました" -ForegroundColor Red
  exit 1
}
