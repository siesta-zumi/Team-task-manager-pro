-- Team Task Manager Pro - サンプルデータ
-- 実行方法: スキーマ作成後にSupabaseダッシュボードのSQL Editorで実行

-- ========================================
-- サンプルメンバー
-- ========================================
INSERT INTO members (id, name, avatar) VALUES
  ('11111111-1111-1111-1111-111111111111', '田中太郎', NULL),
  ('22222222-2222-2222-2222-222222222222', '佐藤花子', NULL),
  ('33333333-3333-3333-3333-333333333333', '鈴木一郎', NULL),
  ('44444444-4444-4444-4444-444444444444', '山田美咲', NULL),
  ('55555555-5555-5555-5555-555555555555', '高橋健太', NULL);

-- ========================================
-- サンプルタスク
-- ========================================
INSERT INTO tasks (id, title, description, status, score, start_date, end_date, is_recurring, recurring_type, progress) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '月次レポート作成',
    '毎月の売上レポートを作成し、経営陣に報告する',
    '進行中',
    5,
    '2026-01-01',
    '2026-01-31',
    true,
    '毎月',
    40
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '新機能開発：ユーザー認証',
    'OAuth2.0を使用した認証機能の実装',
    '未着手',
    8,
    '2026-01-15',
    '2026-02-15',
    false,
    NULL,
    0
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'バグ修正：ログイン画面',
    'ログインボタンが反応しない問題の修正',
    '完了',
    3,
    '2026-01-10',
    '2026-01-12',
    false,
    NULL,
    100
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'ドキュメント整備',
    'API仕様書とユーザーマニュアルの更新',
    '進行中',
    4,
    '2026-01-05',
    '2026-01-25',
    false,
    NULL,
    60
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'チームミーティング準備',
    '週次ミーティングの議題準備と資料作成',
    '未着手',
    2,
    '2026-01-20',
    '2026-01-20',
    true,
    '毎月',
    0
  );

-- ========================================
-- サンプル担当者アサイン
-- ========================================
INSERT INTO task_assignments (task_id, member_id, role, workload_ratio) VALUES
  -- 月次レポート: 田中(メイン) + 佐藤(フォロー)
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'main', 1.0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'follower', 0.3),
  -- 新機能開発: 鈴木(メイン) + 高橋(フォロー)
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'main', 1.0),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 'follower', 0.3),
  -- バグ修正: 山田(メイン)
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'main', 1.0),
  -- ドキュメント: 佐藤(メイン)
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'main', 1.0),
  -- ミーティング準備: 田中(メイン)
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'main', 1.0);

-- ========================================
-- サンプルサブタスク
-- ========================================
INSERT INTO subtasks (task_id, text, completed, order_index) VALUES
  -- 月次レポートのサブタスク
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'データ収集', true, 0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'グラフ作成', true, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'レポート本文執筆', false, 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'レビュー依頼', false, 3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '最終提出', false, 4),
  -- 新機能開発のサブタスク
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '要件定義', false, 0),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'OAuth設定', false, 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'フロントエンド実装', false, 2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'バックエンド実装', false, 3),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'テスト', false, 4),
  -- ドキュメントのサブタスク
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'API仕様書更新', true, 0),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'ユーザーマニュアル更新', true, 1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '図表追加', true, 2),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'レビュー対応', false, 3),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '公開', false, 4);
