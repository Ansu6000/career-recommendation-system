-- ============================================================================
-- Pathwise Analytics Schema for Supabase
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor to set up analytics tracking
-- ============================================================================

-- ============================================================================
-- 1. ANALYTICS EVENTS TABLE
-- Core table for all event tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id TEXT NOT NULL,
    session_id TEXT,
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);

-- Composite index for DAU/MAU queries
CREATE INDEX IF NOT EXISTS idx_analytics_user_timestamp ON analytics_events(user_id, timestamp);


-- ============================================================================
-- 2. DAILY METRICS TABLE (Aggregated)
-- Pre-computed daily metrics for faster dashboard loading
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    dau INTEGER DEFAULT 0,
    signups INTEGER DEFAULT 0,
    assessments_started INTEGER DEFAULT 0,
    assessments_completed INTEGER DEFAULT 0,
    avg_completion_time_seconds FLOAT DEFAULT 0,
    most_popular_career TEXT,
    career_distribution JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);


-- ============================================================================
-- 3. USER SESSIONS TABLE
-- Track individual user sessions for retention analysis
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT UNIQUE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 0,
    assessments_taken INTEGER DEFAULT 0,
    user_agent TEXT,
    screen_resolution TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start ON user_sessions(start_time);


-- ============================================================================
-- 4. CAREER ANALYTICS TABLE
-- Track career recommendation patterns
-- ============================================================================
CREATE TABLE IF NOT EXISTS career_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    career_name TEXT NOT NULL,
    category TEXT NOT NULL,
    times_recommended INTEGER DEFAULT 0,
    last_recommended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(career_name)
);

CREATE INDEX IF NOT EXISTS idx_career_name ON career_analytics(career_name);
CREATE INDEX IF NOT EXISTS idx_career_category ON career_analytics(category);


-- ============================================================================
-- 5. VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Daily Active Users by Date
CREATE OR REPLACE VIEW vw_dau AS
SELECT 
    DATE(timestamp) as date,
    COUNT(DISTINCT user_id) as dau
FROM analytics_events
WHERE user_id != 'anonymous'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- View: Monthly Active Users
CREATE OR REPLACE VIEW vw_mau AS
SELECT 
    DATE_TRUNC('month', timestamp) as month,
    COUNT(DISTINCT user_id) as mau
FROM analytics_events
WHERE user_id != 'anonymous'
GROUP BY DATE_TRUNC('month', timestamp)
ORDER BY month DESC;

-- View: Assessment Metrics
CREATE OR REPLACE VIEW vw_assessment_metrics AS
SELECT 
    DATE(timestamp) as date,
    COUNT(CASE WHEN event_type = 'assessment_started' THEN 1 END) as started,
    COUNT(CASE WHEN event_type = 'assessment_completed' THEN 1 END) as completed,
    ROUND(
        COUNT(CASE WHEN event_type = 'assessment_completed' THEN 1 END)::numeric / 
        NULLIF(COUNT(CASE WHEN event_type = 'assessment_started' THEN 1 END), 0) * 100, 
        2
    ) as completion_rate
FROM analytics_events
WHERE event_type IN ('assessment_started', 'assessment_completed')
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- View: Average Assessment Time
CREATE OR REPLACE VIEW vw_avg_completion_time AS
SELECT 
    DATE(timestamp) as date,
    ROUND(AVG((properties->>'totalTimeSeconds')::numeric), 2) as avg_seconds,
    ROUND(AVG((properties->>'totalTimeSeconds')::numeric) / 60, 2) as avg_minutes,
    COUNT(*) as total_completions
FROM analytics_events
WHERE event_type = 'assessment_completed'
AND properties->>'totalTimeSeconds' IS NOT NULL
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- View: Career Distribution
CREATE OR REPLACE VIEW vw_career_distribution AS
SELECT 
    properties->>'topCareerCategory' as category,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER() * 100, 2) as percentage
FROM analytics_events
WHERE event_type = 'assessment_completed'
AND properties->>'topCareerCategory' IS NOT NULL
GROUP BY properties->>'topCareerCategory'
ORDER BY count DESC;


-- ============================================================================
-- 6. FUNCTIONS FOR ANALYTICS
-- ============================================================================

-- Function: Calculate retention for a cohort
CREATE OR REPLACE FUNCTION calculate_retention(
    cohort_date DATE,
    days_after INTEGER
)
RETURNS TABLE(
    cohort_size BIGINT,
    retained_users BIGINT,
    retention_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH cohort AS (
        SELECT DISTINCT user_id
        FROM analytics_events
        WHERE DATE(timestamp) = cohort_date
        AND user_id != 'anonymous'
    ),
    returned AS (
        SELECT DISTINCT ae.user_id
        FROM analytics_events ae
        INNER JOIN cohort c ON ae.user_id = c.user_id
        WHERE DATE(ae.timestamp) = cohort_date + days_after
    )
    SELECT 
        (SELECT COUNT(*) FROM cohort) as cohort_size,
        (SELECT COUNT(*) FROM returned) as retained_users,
        ROUND(
            (SELECT COUNT(*) FROM returned)::numeric / 
            NULLIF((SELECT COUNT(*) FROM cohort), 0) * 100,
            2
        ) as retention_rate;
END;
$$ LANGUAGE plpgsql;

-- Function: Get DAU/MAU stickiness ratio
CREATE OR REPLACE FUNCTION get_stickiness(target_date DATE)
RETURNS TABLE(
    dau BIGINT,
    mau BIGINT,
    stickiness_ratio NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(DISTINCT user_id) 
         FROM analytics_events 
         WHERE DATE(timestamp) = target_date 
         AND user_id != 'anonymous') as dau,
        (SELECT COUNT(DISTINCT user_id) 
         FROM analytics_events 
         WHERE DATE_TRUNC('month', timestamp) = DATE_TRUNC('month', target_date)
         AND user_id != 'anonymous') as mau,
        ROUND(
            (SELECT COUNT(DISTINCT user_id)::numeric 
             FROM analytics_events 
             WHERE DATE(timestamp) = target_date 
             AND user_id != 'anonymous') /
            NULLIF(
                (SELECT COUNT(DISTINCT user_id) 
                 FROM analytics_events 
                 WHERE DATE_TRUNC('month', timestamp) = DATE_TRUNC('month', target_date)
                 AND user_id != 'anonymous'),
                0
            ) * 100,
            2
        ) as stickiness_ratio;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 7. ROW LEVEL SECURITY (Optional - for multi-tenant if needed)
-- ============================================================================

-- Enable RLS on analytics_events (can be disabled for simple use cases)
-- ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserts from authenticated users
-- CREATE POLICY "Allow inserts" ON analytics_events FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow select" ON analytics_events FOR SELECT TO anon USING (true);


-- ============================================================================
-- 8. TRIGGERS FOR AUTO-UPDATING AGGREGATES (Optional)
-- ============================================================================

-- Function to update daily metrics
CREATE OR REPLACE FUNCTION update_daily_metrics()
RETURNS TRIGGER AS $$
DECLARE
    event_date DATE;
BEGIN
    event_date := DATE(NEW.timestamp);
    
    INSERT INTO daily_metrics (date, dau, assessments_started, assessments_completed)
    VALUES (event_date, 0, 0, 0)
    ON CONFLICT (date) DO NOTHING;
    
    -- Update DAU
    UPDATE daily_metrics
    SET 
        dau = (
            SELECT COUNT(DISTINCT user_id) 
            FROM analytics_events 
            WHERE DATE(timestamp) = event_date 
            AND user_id != 'anonymous'
        ),
        assessments_started = (
            SELECT COUNT(*) FROM analytics_events 
            WHERE DATE(timestamp) = event_date 
            AND event_type = 'assessment_started'
        ),
        assessments_completed = (
            SELECT COUNT(*) FROM analytics_events 
            WHERE DATE(timestamp) = event_date 
            AND event_type = 'assessment_completed'
        ),
        updated_at = NOW()
    WHERE date = event_date;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (optional - can impact performance at scale)
-- DROP TRIGGER IF EXISTS trigger_update_daily_metrics ON analytics_events;
-- CREATE TRIGGER trigger_update_daily_metrics
--     AFTER INSERT ON analytics_events
--     FOR EACH ROW
--     EXECUTE FUNCTION update_daily_metrics();


-- ============================================================================
-- SAMPLE QUERIES FOR DASHBOARD
-- ============================================================================

-- Get DAU for today
-- SELECT * FROM vw_dau WHERE date = CURRENT_DATE;

-- Get MAU for current month  
-- SELECT * FROM vw_mau WHERE month = DATE_TRUNC('month', CURRENT_DATE);

-- Get stickiness ratio
-- SELECT * FROM get_stickiness(CURRENT_DATE);

-- Get D1 retention
-- SELECT * FROM calculate_retention(CURRENT_DATE - INTERVAL '1 day', 1);

-- Get D7 retention
-- SELECT * FROM calculate_retention(CURRENT_DATE - INTERVAL '7 days', 7);

-- Get completion rate
-- SELECT * FROM vw_assessment_metrics WHERE date = CURRENT_DATE;

-- Get avg completion time
-- SELECT * FROM vw_avg_completion_time;

-- Get career distribution
-- SELECT * FROM vw_career_distribution;

-- Top 10 careers generated (from JSONB)
-- SELECT 
--     career,
--     COUNT(*) as times_recommended
-- FROM (
--     SELECT jsonb_array_elements_text(properties->'careersGenerated') as career
--     FROM analytics_events
--     WHERE event_type = 'assessment_completed'
-- ) careers
-- GROUP BY career
-- ORDER BY times_recommended DESC
-- LIMIT 10;
