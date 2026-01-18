# 通知機能ガイド

このドキュメントでは、Claude Codeやその他のエージェントがタスク完了時やユーザー確認時に音で通知する方法を説明します。

---

## 📢 概要

`scripts/notify-completion.js` は、以下のタイミングで音を鳴らして通知するためのスクリプトです:

- ✅ タスクが完了した時
- 🔔 ユーザーに確認を求める時
- ❌ エラーが発生した時
- ℹ️ 重要な情報を伝える時

---

## 🔧 使い方

### 基本的な使い方

```bash
# デフォルト（成功通知・2回ビープ）
npm run notify

# カスタムメッセージ
npm run notify "タスクが完了しました"

# 音の種類を指定
node scripts/notify-completion.js "確認が必要です" question
```

### 音の種類

| 種類 | ビープ回数 | 用途 | コマンド例 |
|------|----------|------|----------|
| `success` | 2回 | タスク完了 | `node scripts/notify-completion.js "完了" success` |
| `question` | 1回 | 確認要求 | `node scripts/notify-completion.js "確認してください" question` |
| `error` | 3回 | エラー発生 | `node scripts/notify-completion.js "エラー" error` |
| `info` | 1回 | 情報通知 | `node scripts/notify-completion.js "情報" info` |

---

## 🤖 Claude Codeでの使い方

Claude Codeは直接音を鳴らすことはできませんが、Bashツールを使って通知スクリプトを実行できます。

### タスク完了時の通知例

```bash
# タスク完了後に通知
node scripts/notify-completion.js "タスク一覧ページの実装が完了しました" success
```

### ユーザー確認要求時の通知例

```bash
# ユーザーに確認を求める前に通知
node scripts/notify-completion.js "確認が必要です：次のフェーズに進みますか？" question
```

### エラー発生時の通知例

```bash
# エラー発生時に通知
node scripts/notify-completion.js "エラーが発生しました：ISSUE.mdを確認してください" error
```

---

## 📝 開発ルールへの組み込み

### DEVELOPMENT-RULES.mdへの追加

以下のタイミングで通知を実行することを推奨します:

#### 1. Phase完了時

```bash
# Phase 4完了
node scripts/notify-completion.js "Phase 4: タスク一覧ページが完了しました" success
```

#### 2. ユーザー確認が必要な時

```bash
# 設計変更の確認前
node scripts/notify-completion.js "設計変更の確認が必要です" question
```

#### 3. エラー発生時

```bash
# ISSUE.mdに記録後
node scripts/notify-completion.js "新しいIssueが記録されました (ISSUE-002)" error
```

#### 4. 長時間タスク完了時

```bash
# データベースマイグレーション完了
node scripts/notify-completion.js "マイグレーションが完了しました" info
```

---

## 🔄 自動化の方法

### npm スクリプトとの連携

package.jsonに通知付きコマンドを追加:

```json
{
  "scripts": {
    "test:notify": "npm test && node scripts/notify-completion.js 'テスト完了' success",
    "build:notify": "npm run build && node scripts/notify-completion.js 'ビルド完了' success"
  }
}
```

### Git Hooksとの連携

`.git/hooks/post-commit` に追加:

```bash
#!/bin/sh
node scripts/notify-completion.js "コミットが完了しました" info
```

---

## 🎵 音のカスタマイズ

### Windows

PowerShellのビープ音の周波数と長さを変更:

```javascript
// scripts/notify-completion.js の該当部分を編集
execSync('powershell -c "[console]::beep(周波数, 長さms)"', { stdio: 'ignore' });

// 例:
// 高い音: execSync('powershell -c "[console]::beep(1000,200)"')
// 低い音: execSync('powershell -c "[console]::beep(500,200)"')
```

### macOS

システムサウンドファイルを変更:

```javascript
// /System/Library/Sounds/ 内の他のサウンドファイルを使用
execSync('afplay /System/Library/Sounds/Ping.aiff', { stdio: 'ignore' });
```

利用可能なサウンド:
- Glass.aiff
- Ping.aiff
- Purr.aiff
- Submarine.aiff
- Tink.aiff

---

## 🛠️ トラブルシューティング

### 音が鳴らない場合

#### Windows

1. **PowerShellの実行ポリシーを確認**:
   ```powershell
   Get-ExecutionPolicy
   # RemoteSigned または Unrestricted に設定
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **システム音量を確認**:
   - Windowsの音量ミキサーで音量が0になっていないか確認

3. **別の方法を試す**:
   ```javascript
   // msg.exeを使用（ポップアップ表示）
   execSync('msg %username% /TIME:3 "タスクが完了しました"');
   ```

#### macOS

1. **システム音量を確認**:
   ```bash
   osascript -e "set volume output volume 50"
   ```

2. **afplayが動作するか確認**:
   ```bash
   afplay /System/Library/Sounds/Glass.aiff
   ```

#### Linux

1. **beepコマンドをインストール**:
   ```bash
   sudo apt-get install beep
   ```

2. **ASCIIベル文字が有効か確認**:
   ```bash
   echo -e "\a"
   ```

### デスクトップ通知が表示されない場合

Windows 10/11で通知が表示されない場合:

1. **通知設定を確認**:
   - 設定 > システム > 通知とアクション
   - PowerShellの通知が許可されているか確認

2. **別の方法を試す**:
   ```bash
   # Windows Toast通知（より確実）
   npm install -g node-notifier
   ```

---

## 📋 実装例

### Claude Codeでの実装例

```markdown
**タスク完了の報告**:

タスク一覧ページの実装が完了しました。

以下の機能が実装されています:
- ✅ データ取得とテーブル表示
- ✅ ステータス色分け
- ✅ 進捗バー
- ✅ 統計情報カード

[通知音を再生]
```

対応するBashコマンド:
```bash
node scripts/notify-completion.js "タスク一覧ページの実装が完了しました。確認をお願いします。" success
```

### Cursorでの実装例

Cursorのタスク完了時に自動実行:

```typescript
// .cursorrules または設定ファイル
{
  "onTaskComplete": "node scripts/notify-completion.js 'Cursorタスク完了' success"
}
```

---

## 🎯 推奨される使用タイミング

### 必ず通知すべき場合

1. ✅ **Phase完了時**
   ```bash
   node scripts/notify-completion.js "Phase X が完了しました" success
   ```

2. 🔔 **ユーザー入力待ち**
   ```bash
   node scripts/notify-completion.js "確認が必要です" question
   ```

3. ❌ **クリティカルなエラー**
   ```bash
   node scripts/notify-completion.js "エラー: ISSUE-XXX を確認してください" error
   ```

### 任意で通知する場合

1. ℹ️ **長時間タスク完了**（5分以上）
2. ℹ️ **重要なマイルストーン達成**
3. ℹ️ **ビルド完了**

---

## 🔗 関連ドキュメント

- [DEVELOPMENT-RULES.md](../DEVELOPMENT-RULES.md) - プロジェクト進行ルール
- [PROJECT-PLAN.md](../PROJECT-PLAN.md) - 実装計画
- [ISSUE.md](../ISSUE.md) - 不具合管理表

---

## 📝 今後の改善案

- [ ] カスタムサウンドファイルのサポート
- [ ] Slackへの通知送信
- [ ] LINEへの通知送信（n8n連携）
- [ ] メール通知
- [ ] 通知履歴の記録

---

*最終更新: 2026-01-18*
*作成者: Claude Sonnet 4.5*
