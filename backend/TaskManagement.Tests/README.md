# テスト実行とカバレッジ確認手順

## 必要条件
- .NET 8.0 SDK
- PowerShell 7.0以上（Windows/Linux/macOS）
- reportgeneratorツール（`dotnet tool install -g dotnet-reportgenerator-globaltool`）

## テスト実行とカバレッジレポート生成

### 基本的なテスト実行
```powershell
# TaskManagement.Testsディレクトリで実行
dotnet test
```

### カバレッジレポート付きでテスト実行
```powershell
# TaskManagement.Testsディレクトリで実行
dotnet test --collect:"XPlat Code Coverage"
```

### 詳細なカバレッジオプション指定
以下のコマンドは、より詳細なカバレッジオプションを指定してテストを実行します：

```powershell
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura /p:Include="[TaskManagement.API]*" /p:ExcludeByAttribute="Obsolete%2cGeneratedCodeAttribute%2cCompilerGeneratedAttribute"
```

各パラメータの意味：
- `/p:CollectCoverage=true` - カバレッジ収集を有効にする
- `/p:CoverletOutputFormat=cobertura` - Coberturaフォーマットでレポート出力
- `/p:Include="[TaskManagement.API]*"` - カバレッジ測定対象をTaskManagement.APIプロジェクトに限定
- `/p:ExcludeByAttribute="..."` - 特定の属性を持つコードを除外（Obsolete、GeneratedCode、CompilerGenerated）

### テスト種類別スクリプトを使用した実行（推奨）
プロジェクトルートの`ci/test-scripts`ディレクトリにある以下のスクリプトを使用して、各種テストとカバレッジ測定を行えます：

```powershell
# バックエンドのユニットテスト実行（ライン85%、分岐75%の目標）
& "C:\Users\kojil\Documents\Dev\github\task-management-app\ci\test-scripts\run-backend-unittest.ps1"

# バックエンドの統合テスト実行（ライン60%、分岐50%の目標）
& "C:\Users\kojil\Documents\Dev\github\task-management-app\ci\test-scripts\run-backend-integrationtest.ps1"

# バックエンドのAPIテスト実行（ライン40%、分岐30%の目標）
& "C:\Users\kojil\Documents\Dev\github\task-management-app\ci\test-scripts\run-backend-apitest.ps1"

# 重要機能（API通信処理）のテスト実行（ライン100%、分岐100%の目標）
& "C:\Users\kojil\Documents\Dev\github\task-management-app\ci\test-scripts\run-criticaltest.ps1"
```

各スクリプトは以下の機能を提供します：
- テスト実行とカバレッジ測定
- 目標値との比較と結果表示
- HTMLレポート生成（reportgeneratorツールが必要）
- 低カバレッジクラスの特定と表示
