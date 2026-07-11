-- カテゴリの初期データ
INSERT INTO categories (name, slug, description) VALUES
('技術', 'tech', 'プログラミングや技術に関する記事'),
('ライフスタイル', 'lifestyle', '日常生活や趣味に関する記事'),
('ビジネス', 'business', 'ビジネスや起業に関する記事');

-- 記事の初期データ
INSERT INTO articles (title, content, excerpt, author, status, published_at) VALUES
(
  'D1入門ガイド',
  'D1は、エッジで動作するServerless SQLデータベースです。従来のデータベースと比較して、レイテンシーの大幅な改善が期待できます。この記事では、D1の基本的な使い方から実践的な活用方法まで詳しく解説していきます。',
  'D1の基本的な使い方を初心者向けに解説します。',
  'Cloudflare Developer',
  'published',
  '2024-01-15 09:00:00'
),
(
  'エッジコンピューティングの未来',
  'エッジコンピューティングは、クラウドコンピューティングの次なる進化として注目されています。ユーザーに近い場所でデータ処理を行うことで、レスポンス時間の短縮とコスト削減を実現します。',
  'エッジコンピューティングがもたらす技術革新について考察します。',
  'Tech Writer',
  'published',
  '2024-01-10 14:30:00'
),
(
  'Workers開発のベストプラクティス',
  'Cloudflare Workersでの開発において、パフォーマンスと保守性を両立するためのベストプラクティスをまとめました。型安全性の確保からデプロイメント戦略まで幅広くカバーします。',
  'Workers開発で押さえておくべきポイントを整理しました。',
  'Edge Developer',
  'draft',
  NULL
);

-- 記事とカテゴリの関連付け
INSERT INTO article_categories (article_id, category_id) VALUES
(1, 1), -- 'D1入門ガイド' → '技術'
(2, 1), -- 'エッジコンピューティングの未来' → '技術'
(2, 3), -- 'エッジコンピューティングの未来' → 'ビジネス'
(3, 1); -- 'Workers開発のベストプラクティス' → '技術'
