-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    country VARCHAR(255),
    region VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    eligibility TEXT,
    funding_amount VARCHAR(255),
    deadline TIMESTAMPTZ,
    application_link TEXT NOT NULL,
    source_url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    remote_type VARCHAR(50),
    women_founder_friendly BOOLEAN DEFAULT FALSE,
    indian_applicant_eligible BOOLEAN DEFAULT FALSE,
    student_eligible BOOLEAN DEFAULT FALSE,
    age_limit VARCHAR(100),
    application_fee VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    raw_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_tags ON opportunities USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_country ON opportunities(country);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);

-- Saved Opportunities table
CREATE TABLE IF NOT EXISTS saved_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    application_status VARCHAR(50) DEFAULT 'Saved',
    priority VARCHAR(50) DEFAULT 'Medium',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application Timeline table
CREATE TABLE IF NOT EXISTS application_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    saved_opportunity_id UUID NOT NULL REFERENCES saved_opportunities(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Source Logs table
CREATE TABLE IF NOT EXISTS source_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name VARCHAR(255) NOT NULL,
    source_url TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    opportunities_found INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_opportunities_modtime ON opportunities;
CREATE TRIGGER update_opportunities_modtime
    BEFORE UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_saved_opportunities_modtime ON saved_opportunities;
CREATE TRIGGER update_saved_opportunities_modtime
    BEFORE UPDATE ON saved_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
