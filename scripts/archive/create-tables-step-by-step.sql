-- Step-by-step table creation to avoid errors
-- Run each section separately in Supabase SQL Editor

-- STEP 1: Create seasons table
CREATE TABLE IF NOT EXISTS seasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 2: Create tournament_formats table
CREATE TABLE IF NOT EXISTS tournament_formats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create member_dues table
CREATE TABLE IF NOT EXISTS member_dues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    tournament_format_ids UUID[] NOT NULL DEFAULT '{}',
    season_dues DECIMAL(10,2) NOT NULL DEFAULT 0,
    extra_jersey_dues DECIMAL(10,2) NOT NULL DEFAULT 0,
    extra_trouser_dues DECIMAL(10,2) NOT NULL DEFAULT 0,
    credit_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_dues DECIMAL(10,2) NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Not Paid' CHECK (payment_status IN ('Paid', 'Not Paid')),
    settlement_date DATE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: Create general_expenses table
CREATE TABLE IF NOT EXISTS general_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL,
    tournament_format_id UUID REFERENCES tournament_formats(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Umpire', 'Equipment', 'Storage', 'LiveStream', 'Mat', 'Food', 'Others')),
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    paid_by_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    settlement_status VARCHAR(20) DEFAULT 'Not Settled' CHECK (settlement_status IN ('Settled', 'Not Settled')),
    settlement_date DATE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 5: Create due_reminders table
CREATE TABLE IF NOT EXISTS due_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_dues_id UUID NOT NULL REFERENCES member_dues(id) ON DELETE CASCADE,
    reminder_date DATE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
