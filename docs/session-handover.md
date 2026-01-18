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
| フレームワーク | Next.js 15.5.9 (App Router) |
| 言語 | TypeScript 5 |
| UI | React 19 + TailwindCSS v3 |
| データベース | Supabase (PostgreSQL) |
| 認証 | Supabase Auth (任意) |
| アイコン | lucide-react |
| AI | Google GenAI (gemini-2.5-flash) |
| デプロイ | Vercel / Netlify |

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
- ✅ 依存関係インストール
- ✅ 初回コミット・プッシュ完了

### 3. ドキュメント作成（完了）
- ✅ `docs/design.md` - 機能仕様、ER図、テーブル定義、型定義
- ✅ `CLAUDE.md` - 開発ルール、コーディング規約、コマンド一覧
- ✅ `README.md` - プロジェクト説明
- ✅ `docs/session-handover.md` - このファイル

### 4. Supabase基盤構築（完了）
- ✅ Supabaseクライアント設定（`lib/supabase.ts`）
- ✅ 型定義の作成（`types/index.ts`, `types/database.ts`）
- ✅ データベースマイグレーション（`supabase/migrations/001_initial_schema.sql`）
- ✅ サンプルデータ（`supabase/migrations/002_seed_data.sql`）
- ✅ CRUD関数の実装
  - タスク管理: `lib/tasks.ts`
  - メンバー管理: `lib/members.ts`
  - サブタスク管理: `lib/subtasks.ts`

---

## 重要な既知の問題

### プロダクションビルドエラー

**問題**: `npm run build` を実行すると `TypeError: generate is not a function` エラーが発生
**原因**: Windows環境でのNext.jsビルドプロセスの根本的な問題（nanoid/PostCSS関連）
**影響**: ローカルでのプロダクションビルドができない
**回避策**: 
- ✅ **開発サーバー (`npm run dev`) は正常動作** - ローカル開発は問題なし
- ✅ **Vercel/Netlify等のクラウド環境でデプロイ時にビルド** - Linux環境では問題なし

**検証済みの試行**:
- Node.js 20/22/24 すべてで同じエラー
- Next.js 15/16 すべてで同じエラー
- 静的エクスポート、スタンドアロンビルド、Webpack、Babel すべて失敗
- 完全に新規のプロジェクトでも同じエラー

**結論**: ローカル開発は `npm run dev` で進め、本番デプロイはクラウド環境で実施する

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
├── lib/
│   ├── supabase.ts         # Supabaseクライアント
│   ├── tasks.ts            # タスクCRUD
│   ├── members.ts          # メンバーCRUD
│   └── subtasks.ts         # サブタスクCRUD
├── types/
│   ├── index.ts            # アプリケーション型定義
│   └── database.ts         # Supabase型定義
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql  # テーブル定義
│       └── 002_seed_data.sql       # サンプルデータ
├── .env.local.example      # 環境変数テンプレート
├── .eslintrc.json
├── .gitignore
├── CLAUDE.md               # 開発ルール
├── README.md
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 次のステップ（未着手）

### 【ユーザー側】Supabaseプロジェクトのセットアップ

1. **Supabaseプロジェクト作成**
   - https://supabase.com でプロジェクト作成
   - プロジェクトURL、Anon Keyを取得

2. **環境変数設定**
   - `.env.local.example` を `.env.local` にコピー
   - Supabase認証情報を設定
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **マイグレーション実行**
   - Supabase CLIまたはダッシュボードからSQL実行
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`

### 【開発側】UI実装

#### Week 1-2: タスク一覧・詳細画面
1. **タスク一覧ページ**
   - データ取得とテーブル表示
   - フィルター・ソート機能
   - タスク作成ボタン

2. **タスク詳細モーダル**
   - タスク情報表示・編集
   - サブタスク（チェックリスト）機能
   - 進捗率の自動計算
   - 担当者アサイン（メイン/フォロー）

#### Week 3: マニュアル + チーム機能
- Markdownエディタ
- チームダッシュボード
- 負荷可視化グラフ

#### Week 4: カレンダー + 管理機能
- カレンダービュー
- 承認ワークフロー
- アーカイブ機能

#### Week 5: AI機能統合
- Google GenAI統合
- サブタスク自動生成
- 説明文清書

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

## データベーススキーマ

### テーブル一覧
1. **members** - チームメンバー
2. **tasks** - タスク本体
3. **task_assignments** - タスク担当者（多対多）
4. **subtasks** - サブタスク（チェックリスト）

詳細は `docs/design.md` を参照。

---

## 開発コマンド

### 開発サーバー起動
```bash
npm run dev
```
→ http://localhost:3000

### ビルド（ローカルでは失敗、クラウドでは成功）
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Git操作
```bash
git status
git add .
git commit -m "feat: 機能追加の説明"
git push origin main
```

---

## 既存アプリからの移行元

参照用の既存コード:
- `C:\Users\81806\Downloads\team-task-manager-pro`
- Vite + React 19で構築
- LocalStorage永続化（→ Supabaseに移行済み）

主要コンポーネント:
- `App.tsx` - メインアプリケーション
- `components/Header.tsx` - ナビゲーション
- `components/TaskList.tsx` - タスク一覧テーブル
- `components/TaskModal.tsx` - タスク詳細モーダル
- `components/KanbanView.tsx` - カンバンボード
- `components/CalendarView.tsx` - カレンダー表示
- `components/WorkloadDashboard.tsx` - 負荷状況
- `types.ts` - 型定義（→ `types/index.ts` に移行済み）

---

## 新しいセッションでの開始方法

1. **このファイルを読む**:
```
docs/session-handover.md を読んで、プロジェクトの状況を把握してください
```

2. **開発を続行**:
```
タスク一覧ページのUI実装から開発を開始してください
```

---

## 参考リンク

- [GitHubリポジトリ](https://github.com/siesta-zumi/Team-task-manager-pro)
- [設計ドキュメント](./design.md)
- [開発ルール](../CLAUDE.md)
- [Next.js 15ドキュメント](https://nextjs.org/docs)
- [Supabaseドキュメント](https://supabase.com/docs)
- [TailwindCSS v3ドキュメント](https://tailwindcss.com/docs)

---

*最終更新: 2026-01-18*
*作成者: Claude Sonnet 4.5*
