# ファイル構成ガイド

このドキュメントでは、mdファイルの配置ルールとディレクトリ構成を説明します。

---

## 📁 mdファイルの配置ルール

### ルートディレクトリ（プロジェクト直下）

**用途**: プロジェクト管理・開発プロセスに関する重要なドキュメント

**配置基準**:
- 開発者が**最初に読むべき**ドキュメント
- **頻繁に更新される**ドキュメント
- **プロジェクト全体に影響する**ルールやガイドライン
- GitHubで**トップページに表示させたい**ドキュメント

**配置するファイル**:

| ファイル | 説明 | 更新頻度 |
|---------|------|---------|
| `README.md` | プロジェクト概要、セットアップ手順 | 低 |
| `CLAUDE.md` | 開発ルール、コーディング規約 | 低 |
| `ISSUE.md` | 不具合管理表 | **高** |
| `PROJECT-PLAN.md` | 実装計画書 | **高** |
| `DEVELOPMENT-RULES.md` | プロジェクト進行ルール | 中 |

**理由**:
- GitHub上でREADME.mdが自動表示される
- 開発者がすぐにアクセスできる
- プロジェクトの「顔」となるドキュメント

---

### docs/ ディレクトリ

**用途**: 設計書、技術仕様、参考資料

**配置基準**:
- **技術的な詳細**を記載したドキュメント
- **参照用**のドキュメント（頻繁には見ない）
- **特定の機能や概念**に関するガイド
- **長期的に変更されない**ドキュメント

**配置するファイル**:

| ファイル | 説明 | 更新頻度 |
|---------|------|---------|
| `docs/design.md` | 設計書（ER図、テーブル定義、UI設計） | 低 |
| `docs/session-handover.md` | セッション引き継ぎ情報 | 中 |
| `docs/NOTIFICATION-GUIDE.md` | 通知機能の使い方 | 低 |
| `docs/FILE-STRUCTURE-GUIDE.md` | このファイル | 低 |
| `docs/API-REFERENCE.md` | API仕様（将来追加） | 低 |
| `docs/DEPLOYMENT-GUIDE.md` | デプロイ手順（将来追加） | 低 |

**理由**:
- 技術的な詳細をルートから分離
- ドキュメントが増えてもルートがスッキリ
- 種類別に整理しやすい

---

## 🗂️ 完全なディレクトリ構成

```
Team-task-manager-pro/
│
├── README.md                    # プロジェクト概要（最初に読む）
├── CLAUDE.md                    # 開発ルール（開発前に読む）
├── ISSUE.md                     # 不具合管理（問題発生時に更新）
├── PROJECT-PLAN.md              # 実装計画（タスク管理）
├── DEVELOPMENT-RULES.md         # 進行ルール（全員が従う）
│
├── docs/                        # 技術ドキュメント
│   ├── design.md               # 設計書
│   ├── session-handover.md     # セッション引き継ぎ
│   ├── NOTIFICATION-GUIDE.md   # 通知機能ガイド
│   ├── FILE-STRUCTURE-GUIDE.md # このファイル
│   └── screenshots/            # スクリーンショット（将来追加）
│
├── app/                         # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── tasks/
│   └── globals.css
│
├── components/                  # Reactコンポーネント
│   └── TaskTable.tsx
│
├── lib/                         # ユーティリティ、CRUD関数
│   ├── supabase.ts
│   ├── tasks.ts
│   ├── members.ts
│   └── subtasks.ts
│
├── types/                       # TypeScript型定義
│   ├── index.ts
│   └── database.ts
│
├── scripts/                     # ユーティリティスクリプト
│   └── notify-completion.js
│
├── supabase/                    # Supabaseマイグレーション
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_seed_data.sql
│
├── public/                      # 静的ファイル
│
├── .env.local.example           # 環境変数テンプレート
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

---

## 📋 判断フローチャート

**新しいmdファイルを作成する際の判断基準**:

```
新しいmdファイルを作成する必要がある
  ↓
Q1: このドキュメントは開発者が最初に読むべきか？
  YES → ルートディレクトリ
  NO  → Q2へ
  ↓
Q2: このドキュメントは頻繁に更新されるか？
  YES → ルートディレクトリ（ISSUE.md、PROJECT-PLAN.mdなど）
  NO  → Q3へ
  ↓
Q3: このドキュメントは技術的な詳細や設計に関するものか？
  YES → docs/ディレクトリ
  NO  → Q4へ
  ↓
Q4: このドキュメントはプロジェクト全体のルールやガイドラインか？
  YES → ルートディレクトリ
  NO  → docs/ディレクトリ（デフォルト）
```

---

## 📝 具体例

### ルートディレクトリに配置すべき例

✅ **README.md**
- 理由: GitHubのトップページに表示される
- 内容: プロジェクト概要、インストール手順

✅ **ISSUE.md**
- 理由: エラー発生時に即座にアクセスする必要がある
- 内容: 不具合の記録と追跡

✅ **PROJECT-PLAN.md**
- 理由: タスク完了毎に更新される
- 内容: 実装計画とチェックリスト

✅ **DEVELOPMENT-RULES.md**
- 理由: すべての開発者が従うべきルール
- 内容: 開発プロセスの共通ルール

### docs/に配置すべき例

✅ **docs/design.md**
- 理由: 設計が固まった後はあまり変更しない
- 内容: ER図、テーブル定義、UI設計

✅ **docs/NOTIFICATION-GUIDE.md**
- 理由: 通知機能の使い方は参照用
- 内容: 通知スクリプトの詳細な使い方

✅ **docs/API-REFERENCE.md**（将来追加）
- 理由: API仕様は技術的な詳細
- 内容: エンドポイント一覧、リクエスト/レスポンス形式

✅ **docs/DEPLOYMENT-GUIDE.md**（将来追加）
- 理由: デプロイは頻繁に行わない
- 内容: Vercel/Netlifyへのデプロイ手順

---

## 🔄 ドキュメントの移動基準

**ルートからdocs/へ移動すべきタイミング**:

1. ドキュメントが成熟し、頻繁に更新されなくなった
2. ルートディレクトリのファイル数が10個を超えた
3. 技術的な詳細が増え、初心者には難しくなった

**docs/からルートへ移動すべきタイミング**:

1. そのドキュメントが重要性を増し、全員が読むべきになった
2. 頻繁に更新されるようになった
3. プロジェクト全体のルールに格上げされた

---

## 📌 特殊なケース

### CHANGELOG.md

**配置**: ルートディレクトリ
**理由**: ユーザーが最新の変更を確認するため
**内容**: バージョン毎の変更履歴

### LICENSE.md

**配置**: ルートディレクトリ
**理由**: GitHubの標準、法的に重要
**内容**: ライセンス情報

### CONTRIBUTING.md

**配置**: ルートディレクトリ
**理由**: GitHubの標準、コントリビューター向け
**内容**: プロジェクトへの貢献方法

---

## 🎯 まとめ

### ルートディレクトリ = 「すぐにアクセスすべきもの」

- プロジェクト管理（ISSUE.md、PROJECT-PLAN.md）
- 開発ルール（CLAUDE.md、DEVELOPMENT-RULES.md）
- プロジェクト概要（README.md）

### docs/ = 「参照用・技術的詳細」

- 設計書（design.md）
- 使い方ガイド（NOTIFICATION-GUIDE.md）
- 引き継ぎ情報（session-handover.md）

### 判断に迷ったら

**デフォルト: docs/ディレクトリに配置**

理由:
- 後からルートに移動するのは簡単
- ルートがスッキリ保たれる
- 整理しやすい

---

## 🔗 関連ドキュメント

- [README.md](../README.md) - プロジェクト概要
- [DEVELOPMENT-RULES.md](../DEVELOPMENT-RULES.md) - 開発ルール
- [PROJECT-PLAN.md](../PROJECT-PLAN.md) - 実装計画

---

*最終更新: 2026-01-18*
*作成者: Claude Sonnet 4.5*
