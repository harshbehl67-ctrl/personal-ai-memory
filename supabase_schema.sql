CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  tier VARCHAR(50) DEFAULT 'long_term',
  importance_score INT DEFAULT 3,
  confidence_score INT DEFAULT 90,
  sensitivity_level VARCHAR(50) DEFAULT 'personal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  why_saved TEXT,
  is_verified_fact BOOLEAN DEFAULT true,
  tags TEXT[]
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  importance INT DEFAULT 3,
  memory_created BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  owner VARCHAR(100) DEFAULT 'Me',
  due_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending',
  related_project TEXT
);
