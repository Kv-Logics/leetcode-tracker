-- Complete Database Schema for LeetCode Tracker
-- Run this in Supabase SQL Editor

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  problems JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, problem_id, company_name)
);

-- 4. Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#58a6ff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 5. Bookmark items table
CREATE TABLE IF NOT EXISTS bookmark_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bookmark_id, problem_id, company_name)
);

-- 6. Notes table (NEW)
CREATE TABLE IF NOT EXISTS problem_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, problem_id, company_name)
);

-- 7. Code snippets table (NEW)
CREATE TABLE IF NOT EXISTS code_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, problem_id, company_name, language)
);

-- 8. Custom problems table (NEW - User's own problems)
CREATE TABLE IF NOT EXISTS custom_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  category TEXT,
  leetcode_url TEXT,
  note TEXT,
  code TEXT,
  language TEXT DEFAULT 'javascript',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_problems ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (allow all for JWT-based auth)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all on companies" ON companies FOR ALL USING (true);
CREATE POLICY "Allow all on user_progress" ON user_progress FOR ALL USING (true);
CREATE POLICY "Allow all on bookmarks" ON bookmarks FOR ALL USING (true);
CREATE POLICY "Allow all on bookmark_items" ON bookmark_items FOR ALL USING (true);
CREATE POLICY "Allow all on problem_notes" ON problem_notes FOR ALL USING (true);
CREATE POLICY "Allow all on code_snippets" ON code_snippets FOR ALL USING (true);
CREATE POLICY "Allow all on custom_problems" ON custom_problems FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_company ON user_progress(company_name);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_items_bookmark_id ON bookmark_items(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_problem_notes_user_problem ON problem_notes(user_id, problem_id, company_name);
CREATE INDEX IF NOT EXISTS idx_code_snippets_user_problem ON code_snippets(user_id, problem_id, company_name);
CREATE INDEX IF NOT EXISTS idx_custom_problems_user_id ON custom_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_problems_category ON custom_problems(category);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_problem_notes_updated_at BEFORE UPDATE ON problem_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_code_snippets_updated_at BEFORE UPDATE ON code_snippets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_problems_updated_at BEFORE UPDATE ON custom_problems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
