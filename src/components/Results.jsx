import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw, Book, Award, Map, LogOut, Home, Star, Briefcase, ExternalLink, Target, ChevronDown, ChevronUp, Zap, TrendingUp, PlusCircle, Loader } from 'lucide-react';
import { auth } from '../firebase';
import { getAssessments } from '../services/supabase';
import { useState, useEffect } from 'react';

const Results = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [expandedCareer, setExpandedCareer] = useState(0);
    const [loading, setLoading] = useState(true);

    // FIXED: Result Persistence Logic (Firestore Only - No LocalStorage)
    useEffect(() => {
        if (location.state?.result) {
            // New result came in -> Set it immediately
            setResult(location.state.result);
            setLoading(false);
        } else {
            // Page refresh or direct access -> Fetch latest from DB
            const fetchLatestResult = async (user) => {
                setLoading(true);

                setLoading(true);

                try {
                    console.log("🔄 Fetching latest assessment from Supabase...");
                    const response = await getAssessments(user.uid);

                    if (response.success && response.data && response.data.length > 0) {
                        // getAssessments already returns formatted camelCase data, sorted desc
                        const latest = response.data[0];
                        console.log("✅ Found assessment:", latest.id);

                        setResult({
                            ...latest.result,
                            id: latest.id,
                            retakeCount: latest.retakeCount || 0,
                            answers: latest.answers,
                            profileUsed: latest.profileUsed
                        });
                    } else {
                        // User has no assessments, redirect to start
                        console.log("⚠️ No assessments found for user in Supabase");
                        navigate('/assessment');
                    }
                } catch (error) {
                    console.error("❌ Error fetching latest result:", error);
                    // On error, we might want to stay or go back. 
                    // Safest is go to assessment so they can try again.
                    navigate('/assessment');
                } finally {
                    setLoading(false);
                }
            };

            const unsubscribe = auth.onAuthStateChanged((user) => {
                if (user) {
                    fetchLatestResult(user);
                } else {
                    // Not logged in -> cannot fetch DB
                    navigate('/');
                }
            });

            return () => unsubscribe();
        }
    }, [location, navigate]);

    // 显示 Loading UI instead of blank white screen
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <div className="spinner"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Retrieving your career path...</p>
                </div>
            </div>
        );
    }

    if (!result) return null; // Should ideally not be reached if redirect works

    // Helper to safely access new fields with fallbacks
    const archetype = result.archetype || {};
    const careers = result.topCareers || [];

    // Derived state for dynamic content
    const activeIndex = expandedCareer !== -1 ? expandedCareer : 0;
    const activeCareer = careers[activeIndex] || {};

    // Fallback to root-level data if career-specific data isn't present (backward compatibility)
    const roadmap = activeCareer.roadmap || result.roadmap || {};
    const resources = activeCareer.learning_resources || result.learning_resources || [];

    const strengths = result.strengthSpectrum || {};
    const analysis = result.analysis || {};

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'radial-gradient(circle at 50% 10%, rgba(96, 165, 250, 0.1) 0%, transparent 50%)'
    };

    const contentStyle = {
        width: '100%',
        maxWidth: '900px' // Increased width for deep content
    };

    const cardStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
    };

    const flexBetween = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>

                {/* 1. ARCHETYPE HERO */}
                <div style={{ ...cardStyle, textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>
                        Your Career DNA
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px', lineHeight: 1.1 }}>
                        {archetype.title || "The Visionary"}
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto 24px' }}>
                        {archetype.description}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {archetype.traits?.map((trait, i) => (
                            <span key={i} style={{ padding: '8px 20px', background: 'var(--bg-subtle)', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}>
                                {trait}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 2. STRENGTH SPECTRUM & ANALYSIS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                    {/* Strengths */}
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: '700' }}>
                            <Zap size={18} color="var(--primary)" /> Strength Profile
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {Object.entries(strengths).map(([key, value]) => (
                                <div key={key}>
                                    <div style={{ ...flexBetween, fontSize: '0.9rem', marginBottom: '6px', textTransform: 'capitalize' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                                        <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{value}/100</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'var(--border-light)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ width: `${value}%`, height: '100%', background: 'var(--primary)', borderRadius: '10px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Insights */}
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: '700' }}>
                            <Target size={18} color="var(--primary)" /> Core Analysis
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {Object.entries(analysis).map(([key, value]) => (
                                <div key={key}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>
                                        {key.replace('_', ' ')}
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. TOP CAREER OPTIONS */}
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Star size={24} color="var(--primary)" /> Recommended Paths
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
                    {careers.map((career, idx) => (
                        <div
                            key={idx}
                            style={{
                                ...cardStyle,
                                marginBottom: 0,
                                padding: 0,
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                border: idx === expandedCareer ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                                boxShadow: idx === expandedCareer ? 'var(--shadow-glow)' : 'var(--shadow-sm)'
                            }}
                        >
                            <div
                                onClick={() => setExpandedCareer(expandedCareer === idx ? -1 : idx)}
                                style={{ padding: '24px', cursor: 'pointer', background: idx === expandedCareer ? 'var(--bg-subtle)' : 'transparent' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{
                                            width: '50px', height: '50px', borderRadius: '12px',
                                            background: idx === 0 ? 'var(--primary)' : 'var(--border-light)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.25rem', fontWeight: '800', color: idx === 0 ? '#fff' : 'var(--text-secondary)'
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                                                {career.pathName || career.title}
                                            </h3>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                {career.reason}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>{career.matchPercentage || career.match}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Match</div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedCareer === idx && (
                                <div style={{ padding: '0 24px 24px 24px', background: 'var(--bg-subtle)' }}>
                                    <div style={{ borderTop: '1px solid var(--border-light)', marginBottom: '24px' }}></div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                                {career.description}
                                            </p>
                                        </div>

                                        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <TrendingUp size={14} /> Future Relevance
                                            </div>
                                            <div style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '1rem' }}>{career.relevance}</div>
                                        </div>

                                        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Book size={14} /> Salary Expectations
                                            </div>
                                            <div style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '1rem' }}>{career.salary || career.salaryRange}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 4. DETAILED ROADMAP */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '32px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Map size={24} color="var(--primary)" /> Strategic Roadmap
                    </h2>

                    <div style={{ position: 'relative', paddingLeft: '20px' }}>
                        <div style={{ position: 'absolute', top: '15px', bottom: '30px', left: '29px', width: '2px', background: 'var(--border-light)' }}></div>

                        {/* Step 1: Class 11/12 */}
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', zIndex: 2, marginTop: '6px', flexShrink: 0, boxShadow: '0 0 0 4px var(--primary-dim)' }}></div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>Class 11 & 12 Foundation</h3>
                                <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px' }}>
                                    <div style={{ marginBottom: '12px' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Recommended Stream</span>
                                        <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{roadmap.class11_12_stream || roadmap.class11_12}</div>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Key Focus Areas</span>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{roadmap.focus_areas || "Build core concepts."}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Entrance Exams */}
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-card)', border: '4px solid var(--text-muted)', zIndex: 2, marginTop: '6px', flexShrink: 0 }}></div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Target Entrance Exams</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                    {Array.isArray(roadmap.entrance_exams) ? roadmap.entrance_exams.map((exam, i) => (
                                        <div key={i} style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--primary)', border: '1px solid var(--border-light)', borderLeftWidth: '3px' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{exam.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{exam.desc}</div>
                                        </div>
                                    )) : (
                                        <p style={{ color: 'var(--text-muted)' }}>{roadmap.entranceExams}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Step 3: College Degree */}
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-card)', border: '4px solid var(--text-muted)', zIndex: 2, marginTop: '6px', flexShrink: 0 }}></div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>College & Degree</h3>
                                <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <GraduationCapCustom size={24} color="var(--primary)" />
                                    <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                        {roadmap.college_degree || roadmap.after12th}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4: Skills to Build */}
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-card)', border: '4px solid var(--text-muted)', zIndex: 2, marginTop: '6px', flexShrink: 0 }}></div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Key Skills to Master</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    {roadmap.skills_to_learn?.map((skill, i) => (
                                        <div key={i} style={{ padding: '8px 16px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>{skill.skill}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{skill.desc || skill.why}</div>
                                        </div>
                                    ))}
                                    {(!roadmap.skills_to_learn && roadmap.skillsToBuild) && roadmap.skillsToBuild.map((skill, i) => (
                                        <div key={i} style={{ padding: '8px 16px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>{skill.skill}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{skill.why}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>


                {/* 5. CURATED RESOURCES */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Book size={24} color="var(--primary)" /> Resources for {activeCareer.pathName || "your path"}
                    </h2>

                    {resources && resources.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                            {resources.map((res, i) => (
                                <a
                                    key={i}
                                    href={res.link && res.link.startsWith('http') ? res.link : `https://www.google.com/search?q=${encodeURIComponent(res.name + " " + res.type)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        textDecoration: 'none',
                                        background: 'var(--bg-subtle)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'var(--border-light)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            color: res.type === 'Video' ? '#f87171' : res.type === 'Course' ? '#60a5fa' : '#34d399',
                                            textTransform: 'uppercase',
                                            marginBottom: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            {res.type === 'Video' ? <Zap size={12} /> : res.type === 'Course' ? <Award size={12} /> : <Book size={12} />}
                                            {res.type}
                                        </div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                                            {res.name}
                                        </h4>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                                        Open Link <ExternalLink size={14} />
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>No specific resources generated for this path.</p>
                    )}
                </div>
                {/* FOOTER CTA */}
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', paddingTop: '40px', paddingBottom: '40px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-primary"
                        style={{
                            padding: '16px 32px',
                            fontSize: '1rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--glass-border)'
                        }}
                    >
                        <Home size={18} /> Home
                    </button>

                    {/* RETAKE BUTTON (Limit 1) */}
                    {result.id && (
                        (result.retakeCount || 0) < 1 ? (
                            <button
                                onClick={() => navigate('/assessment', {
                                    state: {
                                        isRetake: true,
                                        assessmentId: result.id,
                                        previousAnswers: result.answers, // Need these passed from Assessment/App
                                        currentRetakeCount: result.retakeCount || 0,
                                        profileUsed: result.profileUsed
                                    }
                                })}
                                className="btn-primary"
                                style={{ padding: '16px 32px', fontSize: '1rem', display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(248, 113, 113, 0.15)', border: '1px solid rgba(248, 113, 113, 0.3)', color: '#fca5a5' }}
                            >
                                <RefreshCw size={18} /> Re-Take Assessment (1 Left)
                            </button>
                        ) : (
                            <button
                                disabled
                                className="btn-primary"
                                style={{ padding: '16px 32px', fontSize: '1rem', display: 'flex', gap: '10px', alignItems: 'center', opacity: 0.5, cursor: 'not-allowed', background: 'rgba(255,255,255,0.05)' }}
                            >
                                <RefreshCw size={18} /> Retake Limit Reached
                            </button>
                        )
                    )}

                    <button
                        onClick={() => navigate('/assessment')}
                        className="btn-primary"
                        style={{ padding: '16px 32px', fontSize: '1rem', display: 'flex', gap: '10px', alignItems: 'center' }}
                    >
                        <PlusCircle size={18} /> Take New Assessment
                    </button>
                </div>

            </div>
        </div>
    );
};

// Renamed to avoid overlap with Lucide import if it existed, though Lucide has 'GraduationCap'
const GraduationCapCustom = ({ size, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
);

export default Results;
