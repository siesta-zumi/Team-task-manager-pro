# ClaudeCode作業完了通知スクリプト
# 使用方法: PowerShellで実行するか、完了時にこのスクリプトを呼び出す

# 方法1: システムビープ音を3回鳴らす
1..3 | ForEach-Object {
    [Console]::Beep(800, 300)  # 周波数800Hz、300ms
    Start-Sleep -Milliseconds 200
}

# 方法2: Windowsのシステムサウンドを再生（コメントアウト済み）
# 以下のコメントを外すと、Windowsのシステムサウンドが鳴ります
# [System.Media.SystemSounds]::Exclamation.Play()

Write-Host "✅ ClaudeCode作業完了通知 - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
