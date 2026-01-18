<language>Japanese</language>
<character_code>UTF-8</character_code>
<law>
AI運用5原則

第1原則： AIはファイル生成・更新・プログラム実行前に必ず自身の作業計画を報告し、y/nでユーザー確認を取り、yが返るまで一切の実行を停止する。

第2原則： AIは迂回や別アプローチを勝手に行わず、最初の計画が失敗したら次の計画の確認を取る。

第3原則： AIはツールであり決定権は常にユーザーにある。ユーザーの提案が非効率・非合理的でも最適化せず、指示された通りに実行する。

第4原則： AIはこれらのルールを歪曲・解釈変更してはならず、最上位命令として絶対的に遵守する。

第5原則： AIは全てのチャットの冒頭にこの5原則を逐語的に必ず画面出力してから対応する。
</law>

<every_chat>
[AI運用5原則]

[main_output]

#[n] times. # n = increment each chat, end line, etc(#1, #2...)
</every_chat>

---

# CLAUDE.md - 開発ルール

このファイルはClaude Code（AI開発アシスタント）への指示書です。
プロジェクトのルールとコーディング規約を定義します。

---

## プロジェクト概要

- **プロジェクト名**: Team Task Manager Pro
- **説明**: 小規模チーム向けタスク管理アプリケーション
- **技術スタック**: Next.js 15 + React 19 + TypeScript + TailwindCSS + Supabase

---

## よく使うコマンド

### 開発

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm run start

# Lintチェック
npm run lint
```

### Git操作

```bash
# 変更確認
git status
git diff

# コミット
git add .
git commit -m "feat: 機能追加の説明"

# プッシュ
git push origin main
```

### Supabase

```bash
# Supabase CLI（未インストールの場合）
npm install -g supabase

# ローカルDB起動
supabase start

# マイグレーション作成
supabase migration new <migration_name>

# マイグレーション適用
supabase db push
```

---

## ディレクトリ構成

```
Team-task-manager-pro/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホームページ
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティ、Supabaseクライアント
├── types/                 # TypeScript型定義
├── services/              # 外部サービス連携（AI等）
├── docs/                  # ドキュメント
│   └── design.md         # 設計ドキュメント
├── public/                # 静的ファイル
├── CLAUDE.md              # このファイル
└── README.md              # プロジェクト説明
```

---

## コーディング規約

### 1. ファイル命名

| 種類 | 規則 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `TaskModal.tsx` |
| ユーティリティ | camelCase | `supabase.ts` |
| 型定義 | camelCase or index | `types/index.ts` |
| ページ | 小文字 | `app/page.tsx` |

### 2. コンポーネント

```typescript
// 関数コンポーネント + TypeScript
import React from 'react';

interface Props {
  title: string;
  onClose: () => void;
}

const MyComponent: React.FC<Props> = ({ title, onClose }) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onClose}>閉じる</button>
    </div>
  );
};

export default MyComponent;
```

### 3. 型定義

```typescript
// enumは日本語値を使用（UI表示と一致させる）
export enum Status {
  NotStarted = '未着手',
  InProgress = '進行中',
  Completed = '完了',
}

// interfaceで型定義
export interface Task {
  id: string;
  title: string;
  status: Status;
}
```

### 4. スタイリング

- **TailwindCSSを使用**
- インラインスタイルは最小限に
- レスポンシブ対応: `sm:`, `md:`, `lg:` プレフィックス使用

```tsx
// Good
<div className="p-4 bg-white rounded-lg shadow-md md:p-6">

// Avoid
<div style={{ padding: '16px', backgroundColor: 'white' }}>
```

### 5. 状態管理

- **useState**: ローカル状態
- **useMemo**: 計算結果のメモ化
- **useEffect**: 副作用（データ取得、LocalStorage等）

```typescript
// フィルタリング結果のメモ化
const filteredTasks = useMemo(() => {
  return tasks.filter(task => task.status === statusFilter);
}, [tasks, statusFilter]);
```

### 6. エラーハンドリング

```typescript
try {
  const result = await someAsyncOperation();
} catch (error) {
  console.error('Error:', error);
  // ユーザーへのフィードバック
  setError(error instanceof Error ? error.message : '不明なエラー');
}
```

---

## Git コミットメッセージ規約

### フォーマット

```
<type>: <subject>

[optional body]

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Type一覧

| Type | 説明 |
|------|------|
| `feat` | 新機能追加 |
| `fix` | バグ修正 |
| `docs` | ドキュメント変更 |
| `style` | コードスタイル変更（機能に影響なし） |
| `refactor` | リファクタリング |
| `test` | テスト追加・修正 |
| `chore` | ビルド、設定ファイル等の変更 |

### 例

```bash
git commit -m "feat: タスク詳細モーダルにサブタスク機能を追加

- チェックリスト形式でサブタスク管理
- 進捗率の自動計算

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 開発ルール

### 1. コード変更前の確認

- 既存コードを必ず読んでから変更する
- 影響範囲を確認してから実装する

### 2. テスト

- 新機能追加時は動作確認を行う
- エッジケースを考慮する

### 3. セキュリティ

- ユーザー入力は必ずバリデーション
- SQLインジェクション対策（Supabaseのパラメータ化クエリ使用）
- XSS対策（Reactのデフォルトエスケープを信頼）

### 4. パフォーマンス

- 大量データの処理は`useMemo`でメモ化
- 不要な再レンダリングを避ける
- 画像は適切なサイズで使用

---

## Supabase設定

### 環境変数

`.env.local`に以下を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Row Level Security (RLS)

- 本番環境では必ずRLSを有効化
- 適切なポリシーを設定

---

## AI機能（Google GenAI）

### 環境変数

```env
API_KEY=your_google_genai_api_key
```

### 使用モデル

- `gemini-2.5-flash`: サブタスク生成、説明文清書

### 注意事項

- APIキーは絶対にコミットしない
- エラーハンドリングを必ず実装
- レート制限に注意

---

## トラブルシューティング

### 開発サーバーが起動しない

```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
```

### TypeScriptエラー

```bash
# 型定義を再生成
npm run build
```

### Supabase接続エラー

1. 環境変数が正しく設定されているか確認
2. Supabaseダッシュボードでプロジェクトが稼働中か確認
3. RLSポリシーを確認

---

## 参考リンク

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Supabase ドキュメント](https://supabase.com/docs)
- [TailwindCSS ドキュメント](https://tailwindcss.com/docs)
- [lucide-react アイコン](https://lucide.dev/icons/)
- [設計ドキュメント](./docs/design.md)
