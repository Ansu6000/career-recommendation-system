import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { questions, sections } from '../data/questions';
import { generateCareerPath, calculateWeightedScores, getTopCategories } from '../services/gemini';
import { auth } from '../firebase';
import { saveAssessment, getAssessments } from '../services/supabase';
import { ArrowRight, ArrowLeft, CheckCircle, User, Users, Lock, RefreshCw } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import {
    trackEvent,
    trackAssessmentStart,
    trackAssessmentComplete,
    trackQuestionAnswer,
    trackAssessmentAbandoned,
    ANALYTICS_EVENTS
} from '../services/analytics';

const Assessment = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // RETAKE CONTEXT
    // Passed from Results page: { isRetake: true, assessmentId: "...", previousAnswers: {...}, currentRetakeCount: 0 }
    const { isRetake, assessmentId, previousAnswers, currentRetakeCount } = location.state || {};

    // MODES: 'checking' -> 'config' -> 'questions' -> 'analyzing'
    const [mode, setMode] = useState('checking');

    // STATE
    const [currentPage, setCurrentPage] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loadingMsg, setLoadingMsg] = useState("Initializing AI Analysis...");
    const [assessmentCount, setAssessmentCount] = useState(0);
    const [userProfile, setUserProfile] = useState({ name: '', grade: '', board: '' });

    // CONFIG FORM
    const [configType, setConfigType] = useState(null); // 'self' or 'other'
    const [tempProfile, setTempProfile] = useState({ name: '', grade: '', board: '' });

    // Analytics timing
    const questionStartTime = useRef(Date.now());
    const currentQuestionId = useRef(null);

    const questionsPerPage = 5;

    // 1. INITIAL CHECKS
    useEffect(() => {
        let isMounted = true;

        const initializeAssessment = async (user) => {
            if (!user) {
                if (isMounted) setMode('config');
                return;
            }

            try {
                // Pre-fill if retake
                if (isRetake && previousAnswers) {
                    setAnswers(previousAnswers);
                    setMode('questions'); // Skip config for retake, go straight to questions to edit
                }

                // RACE CONDITION: Database Check vs 4s Timeout
                const checkDataPromise = async () => {
                    // Check Supabase for accurate assessment count and potential previous profile
                    const assessmentsResult = await getAssessments(user.uid);

                    const count = assessmentsResult.success ? assessmentsResult.data.length : 0;

                    // Since getAssessments sorts by created_at desc, [0] is latest
                    const latestProfile = (assessmentsResult.success && assessmentsResult.data.length > 0)
                        ? assessmentsResult.data[0].profileUsed
                        : null;

                    return { count, latestProfile };
                };

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout")), 4000)
                );

                const data = await Promise.race([checkDataPromise(), timeoutPromise]);

                if (!isMounted) return;

                // Set profile from previous assessment or Auth defaults
                if (data.latestProfile) {
                    setUserProfile(data.latestProfile);
                } else {
                    setUserProfile({
                        name: user.displayName || "Student",
                        grade: "12",
                        board: "CBSE"
                    });
                }

                // If retake, we use the passed profile if available
                if (isRetake && location.state?.profileUsed) {
                    setTempProfile(location.state.profileUsed);
                }

                // If NOT retaking, check limits.

                // If NOT retaking, check limits. Retakes allowed regardless of global limit (assuming limit is on *new* assessments)
                if (!isRetake && data.count >= 3) {
                    setAssessmentCount(data.count);
                    setMode('limited');
                } else if (!isRetake) {
                    setMode('config');
                }

            } catch (error) {
                console.warn("Init fallback:", error);
                if (isMounted) setMode('config');
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            initializeAssessment(user);
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [isRetake, previousAnswers, location.state]);

    // Loading Message Cycle
    useEffect(() => {
        if (mode !== 'analyzing') return;
        const messages = [
            "Re-evaluating your profile..." + (isRetake ? " (Retake Mode)" : ""),
            "Consulting the AI Career Expert...",
            "Mapping highly relevant career paths...",
            "Curating strategic learning resources...",
            "Building your personalized roadmap...",
            "Finalizing your career blueprint..."
        ];
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setLoadingMsg(messages[i]);
        }, 1800);
        return () => clearInterval(interval);
    }, [mode, isRetake]);


    // 2. HANDLERS
    const startAssessment = async (type) => {
        const user = auth.currentUser;

        // Track assessment start
        await trackAssessmentStart(user?.uid || 'guest', type);
        trackEvent(ANALYTICS_EVENTS.ASSESSMENT_STARTED, user?.uid || 'guest', {
            assessmentType: type,
            isRetake: false,
        });

        questionStartTime.current = Date.now();

        if (type === 'self') {
            setTempProfile(userProfile);
            setMode('questions');
        } else {
            setConfigType('other');
        }
    };

    const submitOtherProfile = async () => {
        if (!tempProfile.name || !tempProfile.grade || !tempProfile.board) {
            alert("Please fill in all details.");
            return;
        }

        const user = auth.currentUser;
        await trackAssessmentStart(user?.uid || 'guest', 'other');
        questionStartTime.current = Date.now();

        setMode('questions');
    };

    const handleSelect = async (questionId, option) => {
        const user = auth.currentUser;

        // Track time spent on previous question
        if (currentQuestionId.current !== null && currentQuestionId.current !== questionId) {
            const timeSpent = Date.now() - questionStartTime.current;
            await trackQuestionAnswer(user?.uid || 'guest', currentQuestionId.current, answers[currentQuestionId.current], timeSpent);
        }

        // Update timing for new question
        currentQuestionId.current = questionId;
        questionStartTime.current = Date.now();

        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleNext = () => {
        const currentQuestions = questions.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);
        const pageQuestionIds = currentQuestions.map(q => q.id);
        const allAnswered = pageQuestionIds.every(id => answers[id]);

        if (!allAnswered) {
            alert("Please answer all questions on this page.");
            return;
        }

        const totalPages = Math.ceil(questions.length / questionsPerPage);
        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            submitAssessment();
        }
    };

    // -------------------------------------------------------------------------
    //  SUBMISSION: localStorage PRIMARY + Firebase BACKUP
    // -------------------------------------------------------------------------
    const submitAssessment = async () => {
        setMode('analyzing');

        // Final Profile Resolution
        let finalProfile = userProfile;
        if (isRetake && location.state?.profileUsed) finalProfile = location.state.profileUsed;
        else if (configType === 'other' || tempProfile.name) finalProfile = tempProfile;

        // 1. GET RESULTS (AI or Fallback)
        let careerData = null;
        try {
            console.log("🤖 Starting AI Generation...");
            careerData = await Promise.race([
                generateCareerPath(finalProfile, answers),
                new Promise((_, reject) => setTimeout(() => reject(new Error("AI_TIMEOUT")), 15000))
            ]);
        } catch (error) {
            console.warn("AI Issue, attempting with scoring system:", error.message);
            // The generateCareerPath function handles fallback internally
            try {
                careerData = await generateCareerPath(finalProfile, answers);
            } catch (e) {
                console.error("Fallback also failed:", e.message);
            }
        }

        if (!careerData) {
            // Last resort - generate basic fallback
            console.warn("No career data received, using emergency fallback");
            careerData = await generateCareerPath(finalProfile, answers).catch(() => ({
                archetype: { title: "The Explorer", description: "Still discovering your path", traits: ["Curious", "Open-minded"] },
                strengthSpectrum: { analytical: 50, creative: 50, practical: 50, social: 50, physical: 50, leadership: 50 },
                topCareers: [{ pathName: "Career Exploration", match: "100%", reason: "Continue exploring", relevance: "Important", salary: "Variable", description: "Discover more about yourself" }],
                roadmap: { class11_12_stream: "Any stream suits exploration", focus_areas: "General awareness", entrance_exams: [], college_degree: "Based on interests", skills_to_learn: [] }
            }));
        }

        // Attach Context
        const timestamp = new Date().toISOString();
        const resultTitle = careerData.topCareers?.[0]?.pathName || "Career Path";
        const assessmentIdLocal = isRetake && assessmentId ? assessmentId : `local_${Date.now()}`;

        careerData.profileUsed = finalProfile;
        careerData.answers = answers;
        careerData.id = assessmentIdLocal;
        careerData.retakeCount = isRetake ? (currentRetakeCount || 0) + 1 : 0;

        // 2. SAVE TO LOCALSTORAGE FIRST (100% reliable)
        try {
            const user = auth.currentUser;
            const storageKey = user ? `assessments_${user.uid}` : 'assessments_guest';

            // Get existing assessments
            const existingData = localStorage.getItem(storageKey);
            let assessments = existingData ? JSON.parse(existingData) : [];

            const newAssessment = {
                id: assessmentIdLocal,
                title: resultTitle,
                result: careerData,
                answers,
                profileUsed: finalProfile,
                createdAt: timestamp,
                retakeCount: careerData.retakeCount
            };

            if (isRetake && assessmentId) {
                // Update existing
                const idx = assessments.findIndex(a => a.id === assessmentId);
                if (idx >= 0) {
                    assessments[idx] = { ...assessments[idx], ...newAssessment, updatedAt: timestamp };
                } else {
                    assessments.unshift(newAssessment);
                }
            } else {
                // Add new at beginning
                assessments.unshift(newAssessment);
            }

            localStorage.setItem(storageKey, JSON.stringify(assessments));
            console.log("✅ SAVED TO LOCALSTORAGE:", assessmentIdLocal);

        } catch (localError) {
            console.error("❌ localStorage Error:", localError);
        }

        // 3. SAVE TO SUPABASE (cross-device sync)
        const user = auth.currentUser;
        if (user) {
            // Fire-and-forget - don't block navigation
            (async () => {
                try {
                    const result = await saveAssessment(user.uid, {
                        id: assessmentIdLocal,
                        title: resultTitle,
                        result: careerData,
                        answers,
                        profileUsed: finalProfile,
                        retakeCount: careerData.retakeCount,
                        createdAt: timestamp
                    });
                    if (result.success) {
                        console.log("✅ Saved to Supabase (cross-device sync ready)");
                    } else {
                        console.warn("⚠️ Supabase save failed:", result.error);
                    }
                } catch (err) {
                    console.warn("⚠️ Supabase error:", err.message);
                }
            })();
        }

        // 5. TRACK ANALYTICS
        const topCategory = careerData?.topCareers?.[0]?.pathName || 'unknown';
        await trackAssessmentComplete(user?.uid || 'guest', {
            careers: careerData?.topCareers,
            topCategory,
        });

        // 6. NAVIGATE IMMEDIATELY - data is already saved locally
        console.log("🚀 Navigating to results...");
        navigate('/results', { state: { result: careerData } });
    };


    // 3. RENDERERS
    if (mode === 'checking') {
        return (
            <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (mode === 'limited') {
        return (
            <div className="page-container" style={{ justifyContent: 'center' }}>
                <div className="card" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px' }}>
                    <Lock size={48} color="var(--primary)" style={{ marginBottom: '24px' }} />
                    <h2 style={{ color: 'var(--text-main)', marginBottom: '16px' }}>Assessment Limit Reached</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        You have reached the maximum limit of 3 career assessments for this account.
                        Please contact support or upgrade to generate more.
                    </p>
                    <button onClick={() => navigate('/')} className="btn-primary" style={{ width: '100%' }}>
                        Return Home
                    </button>
                    {/* Allow returning to home to view history and potentially retake old ones */}
                </div>
            </div>
        );
    }

    if (mode === 'config') {
        return (
            <div className="page-container" style={{ justifyContent: 'center' }}>
                <div className="card animate-enter" style={{ maxWidth: '600px', width: '100%', padding: '40px' }}>

                    {!configType ? (
                        <>
                            <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-main)' }}>Who is this for?</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Select the candidate for this career analysis.</p>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                <button
                                    onClick={() => startAssessment('self')}
                                    className="btn-card"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '24px',
                                        background: 'var(--bg-subtle)', // Light background
                                        border: '1px solid var(--border-light)', // Visible border
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease',
                                        width: '100%'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                        e.currentTarget.style.background = '#fff';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-light)';
                                        e.currentTarget.style.background = 'var(--bg-subtle)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ padding: '12px', background: 'var(--primary)', borderRadius: '12px', color: '#fff' }}>
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>For Me ({userProfile.name || 'Current User'})</h3>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Use my existing profile details</p>
                                    </div>
                                    <ArrowRight size={20} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                                </button>

                                <button
                                    onClick={() => setConfigType('other')}
                                    className="btn-card"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '24px',
                                        background: 'var(--bg-subtle)', // Light background
                                        border: '1px solid var(--border-light)', // Visible border
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease',
                                        width: '100%'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                        e.currentTarget.style.background = '#fff';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-light)';
                                        e.currentTarget.style.background = 'var(--bg-subtle)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ padding: '12px', background: '#3b82f6', borderRadius: '12px', color: '#fff' }}>
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>For Someone Else</h3>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>configure a new profile</p>
                                    </div>
                                    <ArrowRight size={20} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setConfigType(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer' }}>
                                <ArrowLeft size={16} /> Back
                            </button>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: 'var(--text-main)' }}>Candidate Profile</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter student's name"
                                        value={tempProfile.name}
                                        onChange={(e) => setTempProfile(p => ({ ...p, name: e.target.value }))}
                                        className="input-field"
                                    />
                                </div>
                                <div style={{ zIndex: 20 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Class / Grade</label>
                                    <CustomDropdown
                                        options={['11', '12']}
                                        value={tempProfile.grade}
                                        onChange={(val) => setTempProfile(p => ({ ...p, grade: val }))}
                                        placeholder="Select Class"
                                    />
                                </div>
                                <div style={{ zIndex: 10 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>School Board</label>
                                    <CustomDropdown
                                        options={['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE']}
                                        value={tempProfile.board}
                                        onChange={(val) => setTempProfile(p => ({ ...p, board: val }))}
                                        placeholder="Select Board"
                                    />
                                </div>

                                <button onClick={submitOtherProfile} className="btn-primary" style={{ marginTop: '16px' }}>
                                    Start Assessment <ArrowRight size={18} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (mode === 'analyzing') {
        return (
            <div className="auth-container" style={{ textAlign: 'center' }}>
                <div className="flex-column" style={{ alignItems: 'center', gap: '20px' }}>
                    <div className="spinner" style={{ width: '60px', height: '60px', borderWidth: '6px' }}></div>
                    <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>
                        {isRetake ? "Re-Calibrating Future" : "Designing Future"}
                    </h2>
                    <p key={loadingMsg} className="animate-enter" style={{
                        fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: '500',
                        marginTop: '0px', minHeight: '30px'
                    }}>
                        {loadingMsg}
                    </p>
                </div>
            </div>
        );
    }

    // QUESTIONS MODE
    const totalPages = Math.ceil(questions.length / questionsPerPage);
    const currentQuestions = questions.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);

    return (
        <div className="page-container">
            <div className="card animate-enter">

                {/* Header Context for Retake */}
                {isRetake && (
                    <div style={{ textAlign: 'center', marginBottom: '20px', padding: '8px', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '8px', border: '1px solid rgba(96, 165, 250, 0.3)', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <RefreshCw size={14} /> Retaking Assessment for {tempProfile.name || userProfile.name}
                    </div>
                )}

                {/* Progress Header */}
                <div className="flex-column mb-6">
                    <div className="progress-container">
                        {Array.from({ length: totalPages }).map((_, idx) => (
                            <div
                                key={idx}
                                onClick={() => setCurrentPage(idx)}
                                className={`dot ${idx === currentPage ? 'active' : idx < currentPage ? 'completed' : ''}`}
                                title={`Section ${idx + 1}`}
                            />
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Section {currentPage + 1} / {totalPages}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>
                            {currentQuestions[0]?.sectionTitle || [
                                "Aptitude & Interests",
                                "Work Style & Personality",
                                "Future Goals & Reality"
                            ][currentPage]}
                        </span>
                    </div>
                </div>

                {/* Question List */}
                <div style={{ width: '100%' }}>
                    {currentQuestions.map((q, index) => {
                        return (
                            <div
                                key={q.id || index}
                                className="animate-fade-in flex-column"
                                style={{
                                    marginBottom: '60px', // Increased spacing to reduce clutter
                                    animationDelay: `${index * 100}ms`,
                                    zIndex: 50 - index, // Static stacking: Earlier questions strictly above later ones
                                    position: 'relative'
                                }}
                            >
                                <h3 style={{ marginBottom: '16px' }}>{q.question}</h3>

                                <CustomDropdown
                                    value={answers[q.id] || ""}
                                    onChange={(value) => handleSelect(q.id, value)}
                                    options={q.options.map(opt => typeof opt === 'object' ? opt.text : opt)}
                                    placeholder="Select your answer..."
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Footer Controls */}
                <div className="footer-nav">
                    <button
                        onClick={() => {
                            if (currentPage === 0) {
                                if (isRetake) navigate(-1); // Go back if retaking
                                else navigate('/'); // Go back to Home
                            }
                            else setCurrentPage(prev => Math.max(0, prev - 1));
                        }}
                        className="btn-text"
                    >
                        <ArrowLeft size={16} /> {currentPage === 0 ? (isRetake ? 'Cancel Retake' : 'Back to Home') : 'Previous'}
                    </button>

                    <button
                        onClick={handleNext}
                        className="btn-primary"
                    >
                        {currentPage === totalPages - 1 ? (isRetake ? 'Update Results' : 'Reveal Path') : 'Continue'}
                        {currentPage === totalPages - 1 ? <CheckCircle size={18} /> : <ArrowRight size={18} />}
                    </button>
                </div>
            </div>

            <p style={{ marginTop: '32px', fontSize: '0.9rem', opacity: 0.7, textAlign: 'center' }}>
                Crafted with AI for your future ✨
            </p>
        </div>
    );
};

export default Assessment;
