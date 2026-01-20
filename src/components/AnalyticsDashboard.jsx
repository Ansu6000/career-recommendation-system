/**
 * Analytics Dashboard Component
 * ============================================================================
 * Beautiful, comprehensive analytics dashboard for Pathwise
 * Displays DAU/MAU, retention, completion rates, top careers, and more
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChange } from '../services/supabase';
import {
    getDashboardMetrics,
    getDailyActiveUsers,
    getMonthlyActiveUsers,
    getStickiness,
    getRetentionRate,
    getAverageCompletionTime,
    getCompletionRate,
    getTopCareers,
    getCategoryDistribution,
    getTotalUniqueUsers,
} from '../services/analytics';
import {
    ArrowLeft,
    Users,
    TrendingUp,
    Clock,
    Target,
    Award,
    BarChart3,
    PieChart,
    Calendar,
    RefreshCw,
    Zap,
    CheckCircle,
    XCircle,
    Activity,
    Briefcase,
} from 'lucide-react';

// Admin email for analytics access - set in .env file as VITE_ADMIN_EMAIL
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

const AnalyticsDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [error, setError] = useState(null);

    // Fetch all metrics
    const fetchMetrics = async () => {
        try {
            setRefreshing(true);

            const [
                dau,
                mau,
                stickiness,
                avgTime,
                completionRate,
                topCareers,
                categoryDist,
                totalUsers,
            ] = await Promise.all([
                getDailyActiveUsers(new Date()),
                getMonthlyActiveUsers(new Date().getFullYear(), new Date().getMonth() + 1),
                getStickiness(new Date()),
                getAverageCompletionTime(),
                getCompletionRate(),
                getTopCareers(5),
                getCategoryDistribution(),
                getTotalUniqueUsers(),
            ]);

            setMetrics({
                dau,
                mau,
                stickiness,
                avgTime,
                completionRate,
                topCareers,
                categoryDist,
                totalUsers,
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching metrics:', err);
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Check if user is logged in AND is admin
        const { data: { subscription } } = onAuthStateChange((event, session) => {
            if (!session?.user) {
                navigate('/login');
            } else if (session.user.email !== ADMIN_EMAIL) {
                // Not admin - redirect to home
                console.warn('⚠️ Analytics access denied: Not an admin');
                navigate('/');
            } else {
                // Admin - load analytics
                fetchMetrics();
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        padding: '32px 24px',
        background: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
    };

    const headerStyle = {
        maxWidth: '1200px',
        margin: '0 auto 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
    };

    const gridStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
    };

    const cardStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: 'var(--shadow-md)',
    };

    const metricCardStyle = {
        ...cardStyle,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    };

    const iconContainerStyle = (color) => ({
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    });

    const metricValueStyle = {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: 'var(--text-main)',
        lineHeight: '1',
    };

    const metricLabelStyle = {
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        fontWeight: '500',
    };

    const sectionTitleStyle = {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: 'var(--text-main)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    };

    // Loading state
    if (loading) {
        return (
            <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 20px' }}></div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'var(--bg-subtle)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '12px',
                            padding: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ArrowLeft size={20} color="var(--text-secondary)" />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Analytics Dashboard
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.95rem' }}>
                            Pathwise performance metrics & insights
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchMetrics}
                    disabled={refreshing}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        opacity: refreshing ? 0.7 : 1,
                    }}
                >
                    <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto 24px',
                    padding: '16px 24px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <XCircle size={20} />
                    {error}
                </div>
            )}

            {/* Main Metrics Grid */}
            <div style={gridStyle}>
                {/* Total Unique Users Card */}
                <div style={metricCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={iconContainerStyle('#F59E0B')}>
                            <Users size={24} color="#F59E0B" />
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.05em',
                        }}>
                            All Time
                        </span>
                    </div>
                    <div>
                        <div style={metricValueStyle}>{metrics?.totalUsers?.count || 0}</div>
                        <div style={metricLabelStyle}>Total Registered Users</div>
                    </div>
                </div>

                {/* DAU Card */}
                <div style={metricCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={iconContainerStyle('#8B5CF6')}>
                            <Users size={24} color="#8B5CF6" />
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.05em',
                        }}>
                            Today
                        </span>
                    </div>
                    <div>
                        <div style={metricValueStyle}>{metrics?.dau?.count || 0}</div>
                        <div style={metricLabelStyle}>Daily Active Users</div>
                    </div>
                </div>

                {/* MAU Card */}
                <div style={metricCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={iconContainerStyle('#06B6D4')}>
                            <Activity size={24} color="#06B6D4" />
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.05em',
                        }}>
                            This Month
                        </span>
                    </div>
                    <div>
                        <div style={metricValueStyle}>{metrics?.mau?.count || 0}</div>
                        <div style={metricLabelStyle}>Monthly Active Users</div>
                    </div>
                </div>

                {/* Stickiness Card */}
                <div style={metricCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={iconContainerStyle('#10B981')}>
                            <TrendingUp size={24} color="#10B981" />
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.05em',
                        }}>
                            DAU/MAU
                        </span>
                    </div>
                    <div>
                        <div style={metricValueStyle}>{metrics?.stickiness?.percentage || '0%'}</div>
                        <div style={metricLabelStyle}>Stickiness Ratio</div>
                    </div>
                </div>

                {/* Completion Rate Card */}
                <div style={metricCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={iconContainerStyle('#F59E0B')}>
                            <CheckCircle size={24} color="#F59E0B" />
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.05em',
                        }}>
                            All Time
                        </span>
                    </div>
                    <div>
                        <div style={metricValueStyle}>{metrics?.completionRate?.rate || '0%'}</div>
                        <div style={metricLabelStyle}>Assessment Completion Rate</div>
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-light)',
                        fontSize: '0.85rem',
                    }}>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>Started: </span>
                            <strong style={{ color: 'var(--text-main)' }}>{metrics?.completionRate?.started || 0}</strong>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>Completed: </span>
                            <strong style={{ color: '#10B981' }}>{metrics?.completionRate?.completed || 0}</strong>
                        </div>
                    </div>
                </div>

                {/* Avg Completion Time Card */}
                <div style={metricCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={iconContainerStyle('#EC4899')}>
                            <Clock size={24} color="#EC4899" />
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.05em',
                        }}>
                            Average
                        </span>
                    </div>
                    <div>
                        <div style={metricValueStyle}>
                            {metrics?.avgTime?.averageMinutes || 0}
                            <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-secondary)' }}> min</span>
                        </div>
                        <div style={metricLabelStyle}>Time to Complete Assessment</div>
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-light)',
                        fontSize: '0.85rem',
                    }}>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>Min: </span>
                            <strong style={{ color: 'var(--text-main)' }}>
                                {metrics?.avgTime?.minTime ? Math.round(metrics.avgTime.minTime / 60) : 0}m
                            </strong>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>Max: </span>
                            <strong style={{ color: 'var(--text-main)' }}>
                                {metrics?.avgTime?.maxTime ? Math.round(metrics.avgTime.maxTime / 60) : 0}m
                            </strong>
                        </div>
                    </div>
                </div>

                {/* Total Assessments Card */}
                <div style={metricCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={iconContainerStyle('#6366F1')}>
                            <Target size={24} color="#6366F1" />
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.05em',
                        }}>
                            Total
                        </span>
                    </div>
                    <div>
                        <div style={metricValueStyle}>{metrics?.avgTime?.totalAssessments || 0}</div>
                        <div style={metricLabelStyle}>Completed Assessments</div>
                    </div>
                </div>
            </div>

            {/* Second Row - Top Careers & Category Distribution */}
            <div style={{ ...gridStyle, marginTop: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                {/* Top Careers */}
                <div style={{ ...cardStyle, gridColumn: 'span 1' }}>
                    <h3 style={sectionTitleStyle}>
                        <Award size={22} color="var(--primary)" />
                        Top Recommended Careers
                    </h3>
                    {metrics?.topCareers?.careers?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {metrics.topCareers.careers.map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '16px',
                                        background: 'var(--bg-subtle)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-light)',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            background: idx === 0 ? 'var(--primary)' : 'var(--border-light)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: '700',
                                            color: idx === 0 ? 'white' : 'var(--text-secondary)',
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                                {item.career}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '6px 14px',
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        borderRadius: '20px',
                                        fontWeight: '700',
                                        color: 'var(--primary)',
                                        fontSize: '0.9rem',
                                    }}>
                                        {item.count}x
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                            <Briefcase size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                            <p>No career data yet. Complete some assessments to see trends.</p>
                        </div>
                    )}
                </div>

                {/* Category Distribution */}
                <div style={{ ...cardStyle, gridColumn: 'span 1' }}>
                    <h3 style={sectionTitleStyle}>
                        <PieChart size={22} color="var(--primary)" />
                        Career Category Distribution
                    </h3>
                    {metrics?.categoryDist?.distribution && Object.keys(metrics.categoryDist.distribution).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {Object.entries(metrics.categoryDist.distribution)
                                .sort((a, b) => b[1] - a[1])
                                .map(([category, count], idx) => {
                                    const total = Object.values(metrics.categoryDist.distribution).reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((count / total) * 100);
                                    const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#EF4444', '#14B8A6', '#F97316'];
                                    const color = colors[idx % colors.length];

                                    return (
                                        <div key={category}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{
                                                    fontWeight: '600',
                                                    color: 'var(--text-main)',
                                                    textTransform: 'capitalize',
                                                }}>
                                                    {category}
                                                </span>
                                                <span style={{ fontWeight: '700', color }}>
                                                    {percentage}%
                                                </span>
                                            </div>
                                            <div style={{
                                                height: '8px',
                                                background: 'var(--border-light)',
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                            }}>
                                                <div style={{
                                                    width: `${percentage}%`,
                                                    height: '100%',
                                                    background: color,
                                                    borderRadius: '10px',
                                                    transition: 'width 0.5s ease',
                                                }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                            <PieChart size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                            <p>No category distribution data yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Metrics Summary */}
            <div style={{ maxWidth: '1200px', margin: '40px auto 0' }}>
                <div style={{
                    ...cardStyle,
                    background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-subtle) 100%)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '24px',
                    textAlign: 'center',
                }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
                            Abandoned
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#EF4444' }}>
                            {metrics?.completionRate?.abandoned || 0}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
                            Unique Careers
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                            {metrics?.topCareers?.careers?.length || 0}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
                            Categories
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#06B6D4' }}>
                            {Object.keys(metrics?.categoryDist?.distribution || {}).length}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
                            Data Points
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10B981' }}>
                            {(metrics?.completionRate?.started || 0) + (metrics?.mau?.count || 0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                maxWidth: '1200px',
                margin: '48px auto 0',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
            }}>
                <p>📊 Analytics are tracked automatically across the platform</p>
                <p style={{ marginTop: '8px' }}>
                    Last updated: {new Date().toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    })}
                </p>
            </div>

            {/* CSS for spinner animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AnalyticsDashboard;
