# セッション引き継ぎドキュメント

このファイルを新しいClaude Codeセッションに読み込ませて、会話を継続してください。

---

## プロジェクト概要

- **プロジェクト名**: Team Task Manager Pro
- **リポジトリ**: https://github.com/siesta-zumi/Team-task-manager-pro
- **作業フォルダ**: `C:\Users\81806\Desktop\AI駆動開発コース\Team-task-manager-pro`

---

## 技術スタック（確定）

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| UI | React 19 + TailwindCSS |
| データベース | Supabase (PostgreSQL) |
| 認証 | Supabase Auth |
| アイコン | lucide-react |
| AI | Google GenAI (gemini-2.5-flash) |
| デプロイ | Vercel |

---

## 完了済みタスク

### 1. 要件定義・設計（完了）
- ✅ 既存アプリ（team-task-manager-pro）の機能分析
- ✅ 業務課題の整理（タスク・ファイル・マニュアル統合、負荷可視化、リアルタイム進捗等）
- ✅ UI/UX設計（SharePoint風：左サイドバー + 上部タブ）
- ✅ データモデル設計（担当者ロール：メイン100%/フォロー30%）
- ✅ 承認ワークフロー設計（完了→承認済み、単発=アーカイブ、継続=リセット）

### 2. プロジェクトセットアップ（完了）
- ✅ GitHubリポジトリ作成・クローン
- ✅ Next.js 15プロジェクト初期化
- ✅ TypeScript + TailwindCSS設定
- ✅ 依存関係インストール（npm install完了）
- ✅ 初回コミット・プッシュ完了

### 3. ドキュメント作成（完了）
- ✅ `docs/design.md` - 機能仕様、ER図、テーブル定義、型定義
- ✅ `CLAUDE.md` - 開発ルール、コーディング規約、コマンド一覧
- ✅ `README.md` - プロジェクト説明

---

## 現在のプロジェクト構造

```
Team-task-manager-pro/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # ホームページ（仮）
│   └── globals.css         # グローバルスタイル
├── docs/
│   ├── design.md           # 設計ドキュメント
│   └── session-handover.md # このファイル
├── .eslintrc.json
├── .gitignore
├── CLAUDE.md               # 開発ルール
├── README.md
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## 次のステップ（未着手）

### Week 1: 基盤構築
1. **Supabaseセットアップ**
   - プロジェクト作成
   - 環境変数設定（`.env.local`）
   - Supabaseクライアント作成（`lib/supabase.ts`）

2. **データベーススキーマ作成**
   - `members`テーブル
   - `tasks`テーブル
   - `task_assignments`テーブル
   - `subtasks`テーブル

3. **型定義の作成**
   - `types/index.ts` に型定義を移植

4. **認証機能（任意）**
   - Supabase Auth設定

5. **基本的なタスクCRUD**
   - タスク一覧取得
   - タスク作成・更新・削除

### Week 2: タスク詳細ページ
- タスク詳細画面
- チェックリスト機能
- 進捗率自動計算

### Week 3: マニュアル + チーム機能
- Markdownエディタ
- チームダッシュボード
- 負荷可視化

### Week 4: カレンダー + 管理機能
- カレンダービュー
- 承認ワークフロー

---

## 主要な設計決定事項

### 1. 担当者ロール
- **メイン担当**: 負荷100%（`workload_ratio: 1.0`）
- **フォロー担当**: 負荷30%（`workload_ratio: 0.3`）

### 2. ステータスフロー
```
未着手 → 進行中 → 完了 → 承認済み
```
- 承認後の動作:
  - **単発タスク**: アーカイブ
  - **継続タスク**: 次期間にリセット（進捗0%、未着手に戻る）

### 3. チェックリストとマニュアルの連動
- マニュアルのH2見出し → チェックリスト項目として同期

### 4. 業務スコア計算
- 自動: `時間 × 重要度`
- 手動: 直接入力も可能

---

## 既存アプリからの移行元

参照用の既存コード:
- `C:\Users\81806\Downloads\team-task-manager-pro`
- Vite + React 19で構築
- LocalStorage永続化（→ Supabaseに移行予定）

主要コンポーネント:
- `App.tsx` - メインアプリケーション
- `components/Header.tsx` - ナビゲーション
- `components/TaskList.tsx` - タスク一覧テーブル
- `components/TaskModal.tsx` - タスク詳細モーダル
- `components/KanbanView.tsx` - カンバンボード
- `components/CalendarView.tsx` - カレンダー表示
- `components/WorkloadDashboard.tsx` - 負荷状況
- `types.ts` - 型定義

---

## 新しいセッションでの開始方法

1. このファイルを読む:
```
docs/session-handover.md を読んで、プロジェクトの状況を把握してください
```

2. 開発を続行:
```
Supabaseのセットアップから開発を開始してください
```

---

## 参考リンク

- [GitHubリポジトリ](https://github.com/siesta-zumi/Team-task-manager-pro)
- [設計ドキュメント](./design.md)
- [開発ルール](../CLAUDE.md)

---

*最終更新: 2026-01-17*
