# Team Task Manager Pro

チームタスク管理アプリケーション - Next.js 15 + Supabase版

## 概要

小規模チーム（5-10人）向けのタスク管理アプリケーション。
タスク・作業ファイル・マニュアルを統合し、リアルタイムの進捗管理と負荷可視化を実現します。

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + React 19 + TypeScript
- **スタイリング**: TailwindCSS
- **バックエンド**: Supabase (PostgreSQL + Realtime + Auth)
- **デプロイ**: Vercel

## 主要機能

- タスク管理（CRUD、フィルタリング、検索）
- 複数メンバーアサイン（メイン・フォロー役割）
- 業務スコア計算（時間 × 重要度）
- リアルタイム進捗管理
- チェックリスト機能
- マニュアル統合（Markdown）
- 作業ファイル管理
- カレンダービュー
- 承認ワークフロー
- チーム負荷可視化

## 開発開始

### 依存関係のインストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## プロジェクト構成

```
team-task-manager/
├── app/                  # Next.js App Router
│   ├── layout.tsx       # ルートレイアウト
│   ├── page.tsx         # ホームページ
│   └── globals.css      # グローバルスタイル
├── components/          # Reactコンポーネント
├── lib/                 # ユーティリティ関数
├── types/               # TypeScript型定義
└── public/              # 静的ファイル
```

## 開発計画

### Week 1: 基盤構築 + 既存機能移行
- Next.js + Supabaseセットアップ
- データベーススキーマ作成
- 認証機能実装
- 基本的なタスクCRUD

### Week 2: タスク詳細ページ
- タスク詳細画面
- チェックリスト機能
- ファイル管理
- 進捗率計算

### Week 3: マニュアル + チーム機能
- Markdownエディタ
- チームダッシュボード
- 負荷可視化

### Week 4: カレンダー + 管理機能
- カレンダービュー
- 承認ワークフロー
- 最終調整

## ライセンス

Private
