-- Migration number: 0002 	 2026-07-10T23:16:36.668Z
-- タグテーブルの追加
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6366f1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 記事とタグの関連テーブル
CREATE TABLE article_tags (
  article_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 初期タグデータ
INSERT INTO tags (name, slug, color) VALUES
('Cloudflare', 'cloudflare', '#f97316'),
('Workers', 'workers', '#06b6d4'),
('D1', 'd1', '#8b5cf6'),
('エッジ', 'edge', '#10b981');
