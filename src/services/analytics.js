/**
 * Analytics Service for Pathwise
 * ============================================================================
 * Tracks user engagement, assessment metrics, and product analytics.
 * Integrates with Supabase for persistent storage.
 * ============================================================================
 */

import { supabase } from './supabase';

// ============================================================================
// CONSTANTS
// ============================================================================
const ANALYTICS_TABLE = 'analytics_events';
const DAILY_METRICS_TABLE = 'daily_metrics';
const USER_SESSIONS_TABLE = 'user_sessions';

// Event Types
export const ANALYTICS_EVENTS = {
    // Authentication Events
    USER_SIGNUP: 'user_signup',
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',

    // Assessment Events
    ASSESSMENT_STARTED: 'assessment_started',
    ASSESSMENT_COMPLETED: 'assessment_completed',
    ASSESSMENT_ABANDONED: 'assessment_abandoned',
    QUESTION_ANSWERED: 'question_answered',

    // Results Events
    RESULTS_VIEWED: 'results_viewed',
    CAREER_EXPANDED: 'career_expanded',
    RESOURCE_CLICKED: 'resource_clicked',

    // Engagement Events
    PAGE_VIEW: 'page_view',
    SESSION_START: 'session_start',
    SESSION_END: 'session_end',

    // Retake Events
    ASSESSMENT_RETAKEN: 'assessment_retaken',
};

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================
let sessionId = null;
let sessionStartTime = null;

/**
 * Generate a unique session ID
 */
const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Start a new user session
 */
export const startSession = async (userId) => {
    sessionId = generateSessionId();
    sessionStartTime = new Date();

    await trackEvent(ANALYTICS_EVENTS.SESSION_START, userId, {
        sessionId,
        startTime: sessionStartTime.toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        referrer: document.referrer || 'direct',
    });

    // Store session in localStorage for page refreshes
    localStorage.setItem('pathwise_session', JSON.stringify({
        sessionId,
        startTime: sessionStartTime.toISOString(),
        userId,
    }));

    return sessionId;
};

/**
 * End current session
 */
export const endSession = async (userId) => {
    if (!sessionStartTime) return;

    const sessionDuration = Math.round((Date.now() - sessionStartTime.getTime()) / 1000);

    await trackEvent(ANALYTICS_EVENTS.SESSION_END, userId, {
        sessionId,
        sessionDurationSeconds: sessionDuration,
        endTime: new Date().toISOString(),
    });

    localStorage.removeItem('pathwise_session');
    sessionId = null;
    sessionStartTime = null;
};

/**
 * Restore session from localStorage (for page refreshes)
 */
export const restoreSession = () => {
    const stored = localStorage.getItem('pathwise_session');
    if (stored) {
        const data = JSON.parse(stored);
        sessionId = data.sessionId;
        sessionStartTime = new Date(data.startTime);
        return data;
    }
    return null;
};

// ============================================================================
// EVENT TRACKING
// ============================================================================

/**
 * Track an analytics event
 */
export const trackEvent = async (eventType, userId, properties = {}) => {
    if (!supabase) {
        console.warn('Analytics: Supabase not available');
        return { success: false };
    }

    const eventData = {
        event_type: eventType,
        user_id: userId || 'anonymous',
        session_id: sessionId,
        properties: properties,
        timestamp: new Date().toISOString(),
        page_url: window.location.pathname,
    };

    try {
        const { data, error } = await supabase
            .from(ANALYTICS_TABLE)
            .insert(eventData)
            .select();

        if (error) throw error;

        console.log(`📊 Analytics: ${eventType}`, properties);
        return { success: true, data };
    } catch (error) {
        console.error('Analytics tracking error:', error);
        return { success: false, error: error.message };
    }
};

// ============================================================================
// ASSESSMENT ANALYTICS
// ============================================================================

let assessmentStartTime = null;
let questionTimes = {};

/**
 * Track when assessment starts
 */
export const trackAssessmentStart = async (userId, assessmentType = 'self') => {
    assessmentStartTime = Date.now();
    questionTimes = {};

    return trackEvent(ANALYTICS_EVENTS.ASSESSMENT_STARTED, userId, {
        assessmentType,
        startTime: new Date().toISOString(),
    });
};

/**
 * Track time spent on each question
 */
export const trackQuestionAnswer = async (userId, questionId, optionSelected, timeSpentMs) => {
    questionTimes[questionId] = timeSpentMs;

    return trackEvent(ANALYTICS_EVENTS.QUESTION_ANSWERED, userId, {
        questionId,
        optionIndex: optionSelected,
        timeSpentMs,
        averageTimePerQuestionMs: Object.values(questionTimes).reduce((a, b) => a + b, 0) / Object.keys(questionTimes).length,
    });
};

/**
 * Track assessment completion
 */
export const trackAssessmentComplete = async (userId, result) => {
    const totalTimeMs = Date.now() - assessmentStartTime;
    const totalTimeSeconds = Math.round(totalTimeMs / 1000);

    // Extract career names from result
    const careersGenerated = result?.careers?.map(c => c.name || c.title) || [];
    const topCareerCategory = result?.topCategory || 'unknown';

    return trackEvent(ANALYTICS_EVENTS.ASSESSMENT_COMPLETED, userId, {
        totalTimeSeconds,
        totalTimeMs,
        careersGenerated,
        topCareerCategory,
        questionCount: Object.keys(questionTimes).length,
        averageTimePerQuestionMs: Object.values(questionTimes).reduce((a, b) => a + b, 0) / Object.keys(questionTimes).length,
        questionTimes,
    });
};

/**
 * Track assessment abandonment
 */
export const trackAssessmentAbandoned = async (userId, lastQuestionId) => {
    const timeSpentMs = Date.now() - (assessmentStartTime || Date.now());

    return trackEvent(ANALYTICS_EVENTS.ASSESSMENT_ABANDONED, userId, {
        lastQuestionId,
        questionsCompleted: Object.keys(questionTimes).length,
        timeSpentBeforeAbandonMs: timeSpentMs,
    });
};

// ============================================================================
// RESULTS ANALYTICS
// ============================================================================

/**
 * Track results page view
 */
export const trackResultsView = async (userId, careersShown) => {
    return trackEvent(ANALYTICS_EVENTS.RESULTS_VIEWED, userId, {
        careersShown,
        viewTime: new Date().toISOString(),
    });
};

/**
 * Track when user expands a career for details
 */
export const trackCareerExpanded = async (userId, careerName) => {
    return trackEvent(ANALYTICS_EVENTS.CAREER_EXPANDED, userId, {
        careerName,
    });
};

/**
 * Track resource link clicks
 */
export const trackResourceClick = async (userId, resourceType, resourceUrl) => {
    return trackEvent(ANALYTICS_EVENTS.RESOURCE_CLICKED, userId, {
        resourceType,
        resourceUrl,
    });
};

// ============================================================================
// DAU/MAU & RETENTION METRICS (Query Functions)
// ============================================================================

/**
 * Get Daily Active Users for a specific date
 */
export const getDailyActiveUsers = async (date) => {
    if (!supabase) return { success: false, count: 0 };

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
        const { data, error } = await supabase
            .from(ANALYTICS_TABLE)
            .select('user_id')
            .gte('timestamp', startOfDay.toISOString())
            .lte('timestamp', endOfDay.toISOString())
            .neq('user_id', 'anonymous');

        if (error) throw error;

        const uniqueUsers = [...new Set(data.map(d => d.user_id))];
        return { success: true, count: uniqueUsers.length, users: uniqueUsers };
    } catch (error) {
        console.error('Error fetching DAU:', error);
        return { success: false, count: 0, error: error.message };
    }
};

/**
 * Get Monthly Active Users for a specific month
 */
export const getMonthlyActiveUsers = async (year, month) => {
    if (!supabase) return { success: false, count: 0 };

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    try {
        const { data, error } = await supabase
            .from(ANALYTICS_TABLE)
            .select('user_id')
            .gte('timestamp', startOfMonth.toISOString())
            .lte('timestamp', endOfMonth.toISOString())
            .neq('user_id', 'anonymous');

        if (error) throw error;

        const uniqueUsers = [...new Set(data.map(d => d.user_id))];
        return { success: true, count: uniqueUsers.length, users: uniqueUsers };
    } catch (error) {
        console.error('Error fetching MAU:', error);
        return { success: false, count: 0, error: error.message };
    }
};

/**
 * Get DAU/MAU ratio (stickiness)
 */
export const getStickiness = async (date) => {
    const dau = await getDailyActiveUsers(date);
    const mau = await getMonthlyActiveUsers(date.getFullYear(), date.getMonth() + 1);

    if (!dau.success || !mau.success || mau.count === 0) {
        return { success: false, ratio: 0 };
    }

    return {
        success: true,
        ratio: Math.round((dau.count / mau.count) * 100) / 100,
        dau: dau.count,
        mau: mau.count,
        percentage: `${Math.round((dau.count / mau.count) * 100)}%`,
    };
};

/**
 * Get retention rate (users who returned after X days)
 */
export const getRetentionRate = async (cohortDate, daysLater) => {
    if (!supabase) return { success: false, rate: 0 };

    const cohortStart = new Date(cohortDate);
    cohortStart.setHours(0, 0, 0, 0);

    const cohortEnd = new Date(cohortDate);
    cohortEnd.setHours(23, 59, 59, 999);

    const retentionStart = new Date(cohortDate);
    retentionStart.setDate(retentionStart.getDate() + daysLater);
    retentionStart.setHours(0, 0, 0, 0);

    const retentionEnd = new Date(retentionStart);
    retentionEnd.setHours(23, 59, 59, 999);

    try {
        // Get cohort users (users who signed up or were active on cohort date)
        const { data: cohortData, error: cohortError } = await supabase
            .from(ANALYTICS_TABLE)
            .select('user_id')
            .gte('timestamp', cohortStart.toISOString())
            .lte('timestamp', cohortEnd.toISOString())
            .neq('user_id', 'anonymous');

        if (cohortError) throw cohortError;

        const cohortUsers = [...new Set(cohortData.map(d => d.user_id))];

        // Get returning users
        const { data: returnData, error: returnError } = await supabase
            .from(ANALYTICS_TABLE)
            .select('user_id')
            .gte('timestamp', retentionStart.toISOString())
            .lte('timestamp', retentionEnd.toISOString())
            .in('user_id', cohortUsers);

        if (returnError) throw returnError;

        const returningUsers = [...new Set(returnData.map(d => d.user_id))];

        const retentionRate = cohortUsers.length > 0
            ? Math.round((returningUsers.length / cohortUsers.length) * 100)
            : 0;

        return {
            success: true,
            cohortSize: cohortUsers.length,
            returningUsers: returningUsers.length,
            retentionRate: `${retentionRate}%`,
            daysLater,
        };
    } catch (error) {
        console.error('Error calculating retention:', error);
        return { success: false, rate: 0, error: error.message };
    }
};

// ============================================================================
// CAREER ANALYTICS
// ============================================================================

/**
 * Get most generated careers
 */
export const getTopCareers = async (limit = 10) => {
    if (!supabase) return { success: false, careers: [] };

    try {
        const { data, error } = await supabase
            .from(ANALYTICS_TABLE)
            .select('properties')
            .eq('event_type', ANALYTICS_EVENTS.ASSESSMENT_COMPLETED);

        if (error) throw error;

        // Count career occurrences
        const careerCounts = {};
        data.forEach(event => {
            const careers = event.properties?.careersGenerated || [];
            careers.forEach(career => {
                careerCounts[career] = (careerCounts[career] || 0) + 1;
            });
        });

        // Sort and return top careers
        const sortedCareers = Object.entries(careerCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([career, count]) => ({ career, count }));

        return { success: true, careers: sortedCareers };
    } catch (error) {
        console.error('Error fetching top careers:', error);
        return { success: false, careers: [], error: error.message };
    }
};

/**
 * Get career category distribution
 */
export const getCategoryDistribution = async () => {
    if (!supabase) return { success: false, distribution: {} };

    try {
        const { data, error } = await supabase
            .from(ANALYTICS_TABLE)
            .select('properties')
            .eq('event_type', ANALYTICS_EVENTS.ASSESSMENT_COMPLETED);

        if (error) throw error;

        const categoryCounts = {};
        data.forEach(event => {
            const category = event.properties?.topCareerCategory;
            if (category) {
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
        });

        return { success: true, distribution: categoryCounts };
    } catch (error) {
        console.error('Error fetching category distribution:', error);
        return { success: false, distribution: {}, error: error.message };
    }
};

// ============================================================================
// TIME ANALYTICS
// ============================================================================

/**
 * Get average assessment completion time
 */
export const getAverageCompletionTime = async () => {
    if (!supabase) return { success: false, averageSeconds: 0 };

    try {
        const { data, error } = await supabase
            .from(ANALYTICS_TABLE)
            .select('properties')
            .eq('event_type', ANALYTICS_EVENTS.ASSESSMENT_COMPLETED);

        if (error) throw error;

        const times = data
            .map(event => event.properties?.totalTimeSeconds)
            .filter(t => t != null);

        const averageSeconds = times.length > 0
            ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
            : 0;

        return {
            success: true,
            averageSeconds,
            averageMinutes: Math.round(averageSeconds / 60 * 10) / 10,
            totalAssessments: times.length,
            minTime: Math.min(...times),
            maxTime: Math.max(...times),
        };
    } catch (error) {
        console.error('Error fetching completion time:', error);
        return { success: false, averageSeconds: 0, error: error.message };
    }
};

/**
 * Get completion rate
 */
export const getCompletionRate = async () => {
    if (!supabase) return { success: false, rate: 0 };

    try {
        const { data: started, error: startError } = await supabase
            .from(ANALYTICS_TABLE)
            .select('id')
            .eq('event_type', ANALYTICS_EVENTS.ASSESSMENT_STARTED);

        const { data: completed, error: completeError } = await supabase
            .from(ANALYTICS_TABLE)
            .select('id')
            .eq('event_type', ANALYTICS_EVENTS.ASSESSMENT_COMPLETED);

        if (startError || completeError) throw startError || completeError;

        const rate = started.length > 0
            ? Math.round((completed.length / started.length) * 100)
            : 0;

        return {
            success: true,
            started: started.length,
            completed: completed.length,
            rate: `${rate}%`,
            abandoned: started.length - completed.length,
        };
    } catch (error) {
        console.error('Error fetching completion rate:', error);
        return { success: false, rate: 0, error: error.message };
    }
};

// ============================================================================
// DASHBOARD AGGREGATION
// ============================================================================

/**
 * Get all key metrics for a dashboard
 */
export const getDashboardMetrics = async () => {
    const today = new Date();

    const [
        dau,
        mau,
        stickiness,
        topCareers,
        avgTime,
        completionRate,
        categoryDist,
        d1Retention,
        d7Retention,
    ] = await Promise.all([
        getDailyActiveUsers(today),
        getMonthlyActiveUsers(today.getFullYear(), today.getMonth() + 1),
        getStickiness(today),
        getTopCareers(5),
        getAverageCompletionTime(),
        getCompletionRate(),
        getCategoryDistribution(),
        getRetentionRate(new Date(today.getTime() - 86400000), 1), // D1
        getRetentionRate(new Date(today.getTime() - 7 * 86400000), 7), // D7
    ]);

    return {
        engagement: {
            dau: dau.count,
            mau: mau.count,
            stickiness: stickiness.percentage,
        },
        retention: {
            d1: d1Retention.retentionRate,
            d7: d7Retention.retentionRate,
        },
        assessments: {
            completionRate: completionRate.rate,
            averageTimeMinutes: avgTime.averageMinutes,
            totalCompleted: avgTime.totalAssessments,
        },
        careers: {
            topCareers: topCareers.careers,
            categoryDistribution: categoryDist.distribution,
        },
    };
};

// Initialize session on module load
restoreSession();
