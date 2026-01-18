#!/usr/bin/env node

const process = require('process');
const { execSync } = require('child_process');

const message = process.argv[2] || 'タスクが完了しました';
const soundType = process.argv[3] || 'success';

const sounds = {
  success: { beeps: 2, freq: 800, duration: 200, description: '完了通知（2回ビープ）' },
  question: { beeps: 1, freq: 600, duration: 300, description: '確認要求（1回ビープ）' },
  error: { beeps: 3, freq: 400, duration: 150, description: 'エラー通知（3回ビープ）' },
  info: { beeps: 1, freq: 1000, duration: 100, description: '情報通知（1回ビープ）' },
};

const sound = sounds[soundType] || sounds.success;

console.log('\n' + '='.repeat(60));
console.log(`🔔 通知: ${message}`);
console.log(`   種類: ${sound.description}`);
console.log('='.repeat(60) + '\n');

function playBeep() {
  const platform = process.platform;

  try {
    if (platform === 'win32') {
      for (let i = 0; i < sound.beeps; i++) {
        execSync(`powershell -c "[console]::beep(${sound.freq},${sound.duration})"`, { stdio: 'ignore' });
        if (i < sound.beeps - 1) {
          const delay = 300;
          const start = Date.now();
          while (Date.now() - start < delay) {}
        }
      }
    } else if (platform === 'darwin') {
      for (let i = 0; i < sound.beeps; i++) {
        execSync('afplay /System/Library/Sounds/Glass.aiff', { stdio: 'ignore' });
      }
    } else {
      for (let i = 0; i < sound.beeps; i++) {
        console.log('\x07');
      }
    }

    console.log('✅ 通知音を再生しました\n');
  } catch (error) {
    console.log('⚠️  通知音の再生に失敗しました');
    console.log(`   ${error.message}\n`);
  }
}

function showDesktopNotification() {
  const platform = process.platform;

  try {
    if (platform === 'win32') {
      const psScript = `Add-Type -AssemblyName System.Windows.Forms; $notification = New-Object System.Windows.Forms.NotifyIcon; $notification.Icon = [System.Drawing.SystemIcons]::Information; $notification.BalloonTipIcon = 'Info'; $notification.BalloonTipText = '${message.replace(/'/g, "''")}'; $notification.BalloonTipTitle = 'Team Task Manager Pro'; $notification.Visible = $true; $notification.ShowBalloonTip(3000)`;
      
      execSync(`powershell -Command "${psScript}"`, { stdio: 'ignore' });
      console.log('✅ デスクトップ通知を表示しました\n');
    }
  } catch (error) {
    console.log('⚠️  デスクトップ通知の表示に失敗しました\n');
  }
}

playBeep();
showDesktopNotification();

process.exit(0);
