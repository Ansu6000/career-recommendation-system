import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw, Book, Award, Map, LogOut, Home, Star, Briefcase, ExternalLink, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { auth } from '../firebase';
import { useState, useEffect } from 'react';

const Results = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [expandedCareer, setExpandedCareer] = useState(0);

    useEffect(() => {
        if (location.state?.result) {
            setResult(location.state.result);
        } else {
            navigate('/assessment');
        }
    }, [location, navigate]);

    if (!result) return null;

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    };

    const contentStyle = {
        width: '100%',
        maxWidth: '720px'
    };

    const cardStyle = {
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
    };

    const sectionTitleStyle = {
        fontSize: '0.7rem',
        fontWeight: '700',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '16px'
    };

    const headingStyle = {
        fontSize: '1.1rem',
        fontWeight: '700',
        color: 'var(--text-main)',
        margin: '0 0 4px 0'
    };

    const textStyle = {
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        margin: 0
    };

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>

                {/* HEADER */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '6px 16px',
                        background: 'rgba(96, 165, 250, 0.1)',
                        border: '1px solid rgba(96, 165, 250, 0.2)',
                        borderRadius: '50px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '16px'
                    }}>
                        <Award size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Career Blueprint
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0' }}>
                        Your <span className="text-gradient">Career Path</span>
                    </h1>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
                        Personalized recommendations based on your assessment
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/')} className="btn-text" style={{ fontSize: '0.85rem' }}><Home size={14} /> Home</button>
                        <button onClick={() => navigate('/assessment')} className="btn-text" style={{ fontSize: '0.85rem' }}><RefreshCw size={14} /> Retake</button>
                        <button onClick={() => { auth.signOut(); navigate('/'); }} className="btn-text" style={{ fontSize: '0.85rem', color: '#f87171' }}><LogOut size={14} /> Logout</button>
                    </div>
                </div>

                {/* MOTIVATION */}
                {result.motivation && (
                    <div style={{ ...cardStyle, textAlign: 'center', background: 'rgba(96, 165, 250, 0.05)', borderColor: 'rgba(96, 165, 250, 0.15)' }}>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.7', fontStyle: 'italic', margin: 0 }}>
                            "{result.motivation}"
                        </p>
                    </div>
                )}

                {/* CAREERS SECTION */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={sectionTitleStyle}>
                        <Star size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Recommended Careers
                    </div>

                    {result.topCareers?.map((career, idx) => (
                        <div
                            key={idx}
                            style={{
                                ...cardStyle,
                                padding: 0,
                                marginBottom: '12px',
                                borderColor: idx === 0 ? 'var(--primary)' : 'var(--glass-border)',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Career Header */}
                            <div
                                onClick={() => setExpandedCareer(expandedCareer === idx ? -1 : idx)}
                                style={{
                                    padding: '16px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    background: idx === 0 ? 'rgba(96, 165, 250, 0.05)' : 'transparent'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        background: idx === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {idx === 0 ? <Star size={16} fill="black" color="black" /> : <Briefcase size={14} color="var(--text-main)" />}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>{career.title}</span>
                                            {idx === 0 && (
                                                <span style={{
                                                    fontSize: '0.55rem',
                                                    fontWeight: '700',
                                                    background: 'var(--primary)',
                                                    color: 'black',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Top Match
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>{career.reason}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '1rem', fontWeight: '800', color: idx === 0 ? 'var(--primary)' : 'var(--text-main)' }}>{career.matchPercentage}</span>
                                    {expandedCareer === idx ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                                </div>
                            </div>

                            {/* Career Details (Expanded) */}
                            {expandedCareer === idx && (
                                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                                    {career.description && (
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>What is this career?</div>
                                            <p style={{ ...textStyle }}>{career.description}</p>
                                        </div>
                                    )}
                                    {career.salaryRange && (
                                        <div style={{ marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Salary: </span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{career.salaryRange}</span>
                                        </div>
                                    )}
                                    {career.workEnvironment && (
                                        <div style={{ marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Work: </span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{career.workEnvironment}</span>
                                        </div>
                                    )}
                                    {career.famousExample && (
                                        <div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Example: </span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{career.famousExample}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* ROADMAP SECTION */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <Map size={16} color="var(--primary)" />
                        <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>Your Roadmap</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                            { num: 1, title: 'Start This Week', content: result.roadmap?.immediateAction },
                            { num: 2, title: 'Class 11 and 12', content: result.roadmap?.class11_12 },
                            { num: 3, title: 'Entrance Exams', content: result.roadmap?.entranceExams },
                            { num: 4, title: 'College and Degree', content: result.roadmap?.after12th },
                            { num: 5, title: 'Higher Education', content: result.roadmap?.higherEducation }
                        ].filter(step => step.content).map((step, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: i === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                    border: i === 0 ? 'none' : '1px solid var(--glass-border)',
                                    color: i === 0 ? 'black' : 'var(--text-main)',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '2px'
                                }}>
                                    {i + 1}
                                </div>
                                <div>
                                    <div style={headingStyle}>{step.title}</div>
                                    <p style={textStyle}>{step.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SKILLS SECTION */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Target size={16} color="var(--primary)" />
                        <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>Skills to Develop</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {result.roadmap?.skillsToBuild?.map((skillItem, i) => {
                            const skillName = typeof skillItem === 'string' ? skillItem : skillItem.skill;
                            const skillWhy = typeof skillItem === 'object' ? skillItem.why : null;
                            return (
                                <div key={i} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>{skillName}</div>
                                    {skillWhy && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{skillWhy}</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RESOURCES SECTION */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Book size={16} color="var(--primary)" />
                        <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>Learning Resources</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {result.resources?.map((res, i) => (
                            <a
                                key={i}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 14px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                            >
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>{res.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '2px' }}>{res.type}</div>
                                    {res.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{res.description}</div>}
                                </div>
                                <ExternalLink size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: '12px' }} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* FOOTER CTA */}
                <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                    <button onClick={() => navigate('/assessment')} className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.9rem' }}>
                        <RefreshCw size={14} /> Retake Assessment
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Results;
