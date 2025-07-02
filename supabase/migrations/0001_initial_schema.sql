-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Content posts table (matches CSV structure)
CREATE TABLE content_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   
  
  -- CSV Import Fields (exact field names from provided CSV)
  post_id VARCHAR(50) UNIQUE NOT NULL,
  account_id VARCHAR(50) NOT NULL,
  account_username VARCHAR(100) NOT NULL,
  account_name VARCHAR(200),
  description TEXT,
  duration_sec INTEGER DEFAULT 0,
  publish_time TIMESTAMP,
  permalink TEXT,
  post_type VARCHAR(50),
  data_comment TEXT,
  date_field VARCHAR(20), -- 'Lifetime' from CSV
  platform VARCHAR(20) DEFAULT 'instagram',
  post_link VARCHAR(200), -- Supabase Storage URL
  
  -- Performance Metrics (from CSV)
  views INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  follows INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  
  -- Calculated Performance Metrics
  engagement_rate DECIMAL(5,2),
  viral_coefficient DECIMAL(5,2),
  performance_score DECIMAL(5,2),
  
  -- Processing Status
  processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  ai_analysis_complete BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Analysis Results table
CREATE TABLE content_analysis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_id UUID REFERENCES content_posts(id) ON DELETE CASCADE,
   
  
  -- AI Analysis Results (JSON structure)
  ai_insights JSONB,
  content_themes TEXT[],
  hook_effectiveness_score DECIMAL(3,1), -- 1-10 scale
  hook_reasoning TEXT,
  hook_suggestions TEXT[],
  engagement_drivers TEXT[],
  target_audience_alignment_score DECIMAL(3,1), -- 1-10 scale
  target_audience_reasoning TEXT,
  performance_category VARCHAR(20), -- 'high', 'medium', 'low'
  key_insights TEXT[],
  optimization_suggestions TEXT[],
  
  -- Processing metadata
  processing_time_ms INTEGER,
  gemini_model_used VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trends table
CREATE TABLE trends (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   
  
  -- Trend Information
  trend_name VARCHAR(200) NOT NULL,
  trend_description TEXT,
  platform VARCHAR(50) NOT NULL, -- 'tiktok', 'twitter', 'youtube', 'google', 'reddit'
  category VARCHAR(50), -- 'tech', 'career', 'education', 'viral'
  
  -- AI Analysis
  relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 10),
  relevance_reasoning TEXT,
  content_angle TEXT,
  
  -- Trend Metadata
  trend_source VARCHAR(100), -- specific API/source
  trend_data JSONB, -- raw trend data
  fetch_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content Ideas table
CREATE TABLE content_ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
   
  
  -- Content Idea Details
  title VARCHAR(200) NOT NULL,
  content_outline TEXT,
  hook_examples TEXT[],
  key_points TEXT[],
  content_format VARCHAR(50), -- 'short_video', 'carousel', 'reel', 'story'
  
  -- Performance Prediction
  estimated_performance VARCHAR(20), -- 'high', 'medium', 'low'
  performance_reasoning TEXT,
  
  -- Content Suggestions
  hashtags TEXT[],
  visual_style_suggestions TEXT[],
  timing_recommendations TEXT,
  call_to_action VARCHAR(200),
  
  -- Processing metadata
  gemini_model_used VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW()
);