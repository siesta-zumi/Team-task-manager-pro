# Team Task Manager Pro - 設計ドキュメント

## 1. 概要

チームタスク管理アプリケーション。小規模チーム（5-10人）向けに、タスクの作成・管理・進捗可視化を提供する。

### 1.1 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| UI | React 19 + TailwindCSS |
| アイコン | lucide-react |
| グラフ | recharts |
| AI | Google GenAI (gemini-2.5-flash) |
| データベース | Supabase (PostgreSQL) |
| 認証 | Supabase Auth |

---

## 2. 機能仕様

### 2.1 機能一覧

#### コア機能

| # | 機能名 | 説明 | 優先度 |
|---|--------|------|--------|
| F01 | タスクCRUD | タスクの作成・閲覧・更新・削除 | 必須 |
| F02 | メンバー管理 | チームメンバーの追加・削除 | 必須 |
| F03 | 担当者アサイン | タスクに複数メンバーをアサイン | 必須 |
| F04 | ステータス管理 | 未着手→進行中→完了のステータス遷移 | 必須 |
| F05 | サブタスク管理 | タスク内のチェックリスト管理 | 必須 |
| F06 | 進捗率自動計算 | サブタスク完了率から進捗を自動計算 | 必須 |
| F07 | 負荷スコア | タスクの負荷を1-10で数値化 | 必須 |
| F08 | 繰り返しタスク | 月次で繰り返すタスクの設定 | 必須 |

#### ビュー機能

| # | 機能名 | 説明 | 優先度 |
|---|--------|------|--------|
| V01 | チームタスク一覧 | 全タスクをテーブル形式で表示 | 必須 |
| V02 | マイタスク一覧 | ログインユーザーのタスクのみ表示 | 必須 |
| V03 | 負荷状況ダッシュボード | メンバー別の負荷をグラフで可視化 | 必須 |
| V04 | カレンダー（ガントチャート） | タスク期間を視覚的に表示 | 必須 |
| V05 | カンバンボード | ステータス別にカード形式で表示 | 必須 |

#### 検索・フィルタ機能

| # | 機能名 | 説明 | 優先度 |
|---|--------|------|--------|
| S01 | キーワード検索 | タスク名での検索 | 必須 |
| S02 | ステータスフィルタ | 未着手/進行中/完了でフィルタ | 必須 |
| S03 | 担当者フィルタ | メンバーでフィルタ | 必須 |
| S04 | ソート | 各カラムでの昇順/降順ソート | 必須 |

#### AI機能

| # | 機能名 | 説明 | 優先度 |
|---|--------|------|--------|
| A01 | サブタスク自動生成 | タスク名からサブタスクをAI生成 | オプション |
| A02 | 説明文清書 | タスク説明をAIで清書 | オプション |

#### リンク機能

| # | 機能名 | 説明 | 優先度 |
|---|--------|------|--------|
| L01 | マニュアルリンク | タスクに関連するドキュメントURL | オプション |
| L02 | コミュニケーションリンク | Slack/Teamsチャンネル等へのURL | オプション |

---

### 2.2 画面一覧

| 画面ID | 画面名 | パス | 説明 |
|--------|--------|------|------|
| SCR01 | チームタスク | `/` or `/team` | チーム全体のタスク一覧 |
| SCR02 | マイタスク | `/my-tasks` | 自分のタスク一覧 |
| SCR03 | 負荷状況 | `/dashboard` | 負荷状況ダッシュボード |
| SCR04 | カレンダー | `/calendar` | ガントチャート形式のカレンダー |
| SCR05 | カンバン | `/kanban` | カンバンボード |
| MOD01 | タスク詳細モーダル | - | タスクの詳細編集 |
| MOD02 | メンバー管理モーダル | - | メンバーの追加・削除 |
| MOD03 | アイコン選択モーダル | - | マイタスクのアイコン変更 |

---

## 3. 構造仕様

### 3.1 ER図

```
┌─────────────────┐       ┌─────────────────┐
│     members     │       │      tasks      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ title           │
│ avatar          │       │ description     │
│ created_at      │◄──┐   │ status          │
└─────────────────┘   │   │ score           │
                      │   │ start_date      │
                      │   │ end_date        │
┌─────────────────┐   │   │ is_recurring    │
│ task_assignments│   │   │ recurring_type  │
├─────────────────┤   │   │ link            │
│ task_id (FK)    │───┼──►│ communication_  │
│ member_id (FK)  │───┘   │   link          │
│ role            │       │ progress        │
│ workload_ratio  │       │ created_at      │
└─────────────────┘       │ updated_at      │
                          └─────────────────┘
                                  │
                                  │ 1:N
                                  ▼
                          ┌─────────────────┐
                          │    subtasks     │
                          ├─────────────────┤
                          │ id (PK)         │
                          │ task_id (FK)    │
                          │ text            │
                          │ completed       │
                          │ order_index     │
                          └─────────────────┘
```

### 3.2 テーブル定義

#### members（メンバー）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| id | UUID | NO | gen_random_uuid() | プライマリキー |
| name | VARCHAR(100) | NO | - | メンバー名 |
| avatar | TEXT | YES | NULL | アバターURL |
| created_at | TIMESTAMPTZ | NO | now() | 作成日時 |

```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### tasks（タスク）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| id | UUID | NO | gen_random_uuid() | プライマリキー |
| title | VARCHAR(200) | NO | - | タスク名 |
| description | TEXT | YES | NULL | 説明 |
| status | VARCHAR(20) | NO | '未着手' | ステータス |
| score | INTEGER | NO | 1 | 負荷スコア (1-10) |
| start_date | DATE | NO | - | 開始日 |
| end_date | DATE | NO | - | 終了日 |
| is_recurring | BOOLEAN | NO | false | 繰り返しフラグ |
| recurring_type | VARCHAR(20) | YES | NULL | 繰り返しタイプ |
| link | TEXT | YES | NULL | マニュアルリンク |
| communication_link | TEXT | YES | NULL | コミュニケーションリンク |
| progress | INTEGER | NO | 0 | 進捗率 (0-100) |
| created_at | TIMESTAMPTZ | NO | now() | 作成日時 |
| updated_at | TIMESTAMPTZ | NO | now() | 更新日時 |

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT '未着手',
  score INTEGER NOT NULL DEFAULT 1 CHECK (score >= 1 AND score <= 10),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_type VARCHAR(20),
  link TEXT,
  communication_link TEXT,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### task_assignments（タスク担当者）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| task_id | UUID | NO | - | タスクID (FK) |
| member_id | UUID | NO | - | メンバーID (FK) |
| role | VARCHAR(20) | NO | 'main' | 役割 (main/follower) |
| workload_ratio | DECIMAL(3,2) | NO | 1.0 | 負荷比率 |

```sql
CREATE TABLE task_assignments (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'main',
  workload_ratio DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  PRIMARY KEY (task_id, member_id)
);
```

#### subtasks（サブタスク）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| id | UUID | NO | gen_random_uuid() | プライマリキー |
| task_id | UUID | NO | - | タスクID (FK) |
| text | VARCHAR(500) | NO | - | サブタスク内容 |
| completed | BOOLEAN | NO | false | 完了フラグ |
| order_index | INTEGER | NO | 0 | 並び順 |

```sql
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  text VARCHAR(500) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0
);
```

---

### 3.3 型定義（TypeScript）

```typescript
// ステータスEnum
export enum Status {
  NotStarted = '未着手',
  InProgress = '進行中',
  Completed = '完了',
}

// 繰り返しタイプEnum
export enum RecurringType {
  None = 'なし',
  Monthly = '毎月',
}

// メンバー
export interface Member {
  id: string;
  name: string;
  avatar: string;
}

// サブタスク
export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

// タスク
export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeIds: string[];
  status: Status;
  score: number;
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  recurringType: RecurringType;
  link?: string;
  communicationLink?: string;
  subtasks: Subtask[];
  progress: number;
}

// ビュータイプ
export type View = 'team' | 'my-tasks' | 'dashboard' | 'calendar' | 'kanban';

// ソート設定
export type SortConfig = {
  key: keyof Task;
  direction: 'ascending' | 'descending';
};
```

---

## 4. コンポーネント構成

```
app/
├── layout.tsx              # ルートレイアウト
├── page.tsx                # ホームページ (チームタスク)
└── globals.css             # グローバルスタイル

components/
├── Header.tsx              # ヘッダー (ナビゲーション、ユーザー選択)
├── TeamTasks.tsx           # チームタスクビュー
├── MyTasks.tsx             # マイタスクビュー
├── WorkloadDashboard.tsx   # 負荷状況ダッシュボード
├── CalendarView.tsx        # カレンダー (ガントチャート)
├── KanbanView.tsx          # カンバンボード
├── KanbanCard.tsx          # カンバンカード
├── TaskList.tsx            # タスクテーブル
├── TaskModal.tsx           # タスク詳細モーダル
├── TaskToolbar.tsx         # フィルタ・検索ツールバー
├── MemberManagementModal.tsx # メンバー管理モーダル
├── IconPickerModal.tsx     # アイコン選択モーダル
└── DynamicIcon.tsx         # 動的アイコンコンポーネント

lib/
└── supabase.ts             # Supabaseクライアント

services/
└── geminiService.ts        # AI機能サービス

types/
└── index.ts                # 型定義
```

---

## 5. API設計（Supabase）

### 5.1 タスクAPI

| 操作 | メソッド | エンドポイント | 説明 |
|------|----------|----------------|------|
| 一覧取得 | GET | `/tasks` | 全タスク取得 |
| 詳細取得 | GET | `/tasks/:id` | 特定タスク取得 |
| 作成 | POST | `/tasks` | タスク作成 |
| 更新 | PATCH | `/tasks/:id` | タスク更新 |
| 削除 | DELETE | `/tasks/:id` | タスク削除 |

### 5.2 メンバーAPI

| 操作 | メソッド | エンドポイント | 説明 |
|------|----------|----------------|------|
| 一覧取得 | GET | `/members` | 全メンバー取得 |
| 作成 | POST | `/members` | メンバー作成 |
| 削除 | DELETE | `/members/:id` | メンバー削除 |

---

## 6. 将来拡張（v2）

### 6.1 承認ワークフロー
- 完了 → 承認済みステータスの追加
- 単発タスク: 承認後アーカイブ
- 継続タスク: 承認後リセット（次期間へ）

### 6.2 担当者ロール
- メイン担当（負荷100%）
- フォロー担当（負荷30%）

### 6.3 マニュアル統合
- Markdownエディタ内蔵
- タスク詳細ページにマニュアルタブ追加

### 6.4 作業ファイル管理
- ファイルパスの登録
- ファイル更新検知

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|------------|----------|
| 2026-01-17 | 1.0.0 | 初版作成 |
