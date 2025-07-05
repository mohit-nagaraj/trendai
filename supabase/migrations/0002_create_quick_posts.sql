-- Create quick_posts table for Quick Post feature (one row per pill/article)
CREATE TABLE quick_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT,
  urlToImage TEXT,
  publishedAt TIMESTAMP,
  source TEXT,
  created_at TIMESTAMP DEFAULT NOW()
); 