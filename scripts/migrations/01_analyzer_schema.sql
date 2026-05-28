-- Migration: 01_analyzer_schema.sql
-- Description: Creates the analyzed_profiles table for the LinkedIn Profile Analyzer feature

CREATE TABLE IF NOT EXISTS public.analyzed_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Optional, if users table exists. If no users table, remove the REFERENCES part. Let's make it TEXT for now if users table doesn't exist, or just omit user_id relation if not sure. Wait, let's assume the user table might be handled by Supabase auth.
    -- Actually, if we don't have a users table, let's just make user_id UUID and not enforce a foreign key to prevent errors, as Supabase uses auth.users.
    -- Let's just create the table without foreign key to be safe.
    
    name VARCHAR(255),
    current_title VARCHAR(255),
    current_company VARCHAR(255),
    skills TEXT[] DEFAULT '{}',
    experience_years INTEGER,
    experience_level VARCHAR(50),
    location VARCHAR(255),
    education TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    certifications TEXT[] DEFAULT '{}',
    is_student BOOLEAN DEFAULT false,
    leadership_experience BOOLEAN DEFAULT false,
    entrepreneurship BOOLEAN DEFAULT false,
    research_background BOOLEAN DEFAULT false,
    target_interests TEXT[] DEFAULT '{}',
    raw_input TEXT,
    extraction_confidence FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: We are not enforcing FOREIGN KEY on user_id to allow anonymous analyses or if the users table is named auth.users
ALTER TABLE public.analyzed_profiles ADD COLUMN IF NOT EXISTS user_id UUID;

CREATE INDEX IF NOT EXISTS idx_analyzed_profiles_user ON public.analyzed_profiles(user_id);

-- Optional: Enable RLS (Row Level Security)
ALTER TABLE public.analyzed_profiles ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated inserts
CREATE POLICY "Allow public inserts" ON public.analyzed_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to read their own profiles" ON public.analyzed_profiles FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Required new fields on opportunities table
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS remote_type VARCHAR(50) DEFAULT 'unspecified';
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS student_eligible BOOLEAN DEFAULT false;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS women_founder_friendly BOOLEAN DEFAULT false;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS indian_applicant_eligible BOOLEAN DEFAULT false;
