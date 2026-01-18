# 通知スクリプト

ClaudeCodeの作業完了時に音で通知するためのスクリプトです。

## 使用方法

### 方法1: npmスクリプトから実行（推奨）

```bash
npm run notify
```

### 方法2: PowerShellスクリプトを直接実行

```powershell
.\scripts\notify-completion.ps1
```

または

```powershell
powershell -ExecutionPolicy Bypass -File scripts/notify-completion.ps1
```

### 方法3: Node.jsスクリプトを直接実行

```bash
node scripts/notify-completion.js
```

## 動作

- システムビープ音を3回（約0.3秒間隔）鳴らします
- コンソールに完了メッセージを表示します

## カスタマイズ

### 音の長さや周波数を変更する

`scripts/notify-completion.ps1` または `scripts/notify-completion.js` を編集：

```powershell
[Console]::Beep(周波数, 時間ミリ秒)
```

例：
- `[Console]::Beep(800, 300)` - 800Hz、300ms（デフォルト）
- `[Console]::Beep(1000, 500)` - 1000Hz、500ms（高音・長め）
- `[Console]::Beep(600, 200)` - 600Hz、200ms（低音・短め）

### Windowsのシステムサウンドを使用する

`scripts/notify-completion.ps1` の以下の行のコメントを外してください：

```powershell
[System.Media.SystemSounds]::Exclamation.Play()
```

または、別のシステムサウンドを使用：

```powershell
[System.Media.SystemSounds]::Asterisk.Play()  # 情報音
[System.Media.SystemSounds]::Hand.Play()      # エラー音
[System.Media.SystemSounds]::Question.Play()  # 質問音
```

## 注意事項

- Windows環境でのみ動作します（macOS/Linuxでは異なる方法が必要です）
- PowerShellの実行ポリシーによっては、スクリプトの実行が制限される場合があります
  - その場合は `powershell -ExecutionPolicy Bypass -File` を使用してください
