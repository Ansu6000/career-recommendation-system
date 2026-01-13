import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';
import { generateCareerPath, getSmartFallback } from '../services/gemini';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

const Assessment = () => {
    const navigate = useNavigate();

    // 1. STATE DEFINITIONS
    const [currentPage, setCurrentPage] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState("Initializing AI Analysis...");
    const [activeDropdownId, setActiveDropdownId] = useState(null); // Fix overlap issues

    const questionsPerPage = 5;

    // 2. USE EFFECTS
    // Reset state on mount to ensure fresh start
    useEffect(() => {
        setAnswers({});
        setCurrentPage(0);
        setLoading(false);
        console.log("Assessment Component Mounted - State Reset");
    }, []);

    // Loading Message Cycle
    useEffect(() => {
        if (!loading) return;
        const messages = [
            "Analyzing your unique profile...",
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
    }, [loading]);

    // 3. FAIL SAFE RETURN (After hooks, before logic)
    if (!questions || questions.length === 0) {
        return (
            <div className="page-container" style={{ justifyContent: 'center' }}>
                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--text-main)' }}>Unable to load questions</h2>
                    <p style={{ marginBottom: '20px' }}>Please refresh the page.</p>
                    <button onClick={() => window.location.reload()} className="btn-primary">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // 4. LOGIC
    const totalPages = Math.ceil(questions.length / questionsPerPage);
    const currentQuestions = questions.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);

    const handleSelect = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleNext = () => {
        const pageQuestionIds = currentQuestions.map(q => q.id);
        const allAnswered = pageQuestionIds.every(id => answers[id]);

        if (!allAnswered) {
            alert("Please answer all questions on this page.");
            return;
        }

        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            submitAssessment();
        }
    };

    const submitAssessment = async () => {
        setLoading(true);
        let hasNavigated = false;

        // Timeout Protection
        const safetyTimeout = setTimeout(() => {
            if (!hasNavigated) {
                console.warn("Forcing navigation due to timeout");
                hasNavigated = true;
                setLoading(false);
                navigate('/results', { state: { result: getSmartFallback(answers) } });
            }
        }, 12000);

        try {
            let userProfile = { name: "Student", board: "CBSE", grade: "10" };
            const user = auth ? auth.currentUser : null;

            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) userProfile = userDoc.data();
                } catch (e) { console.warn("Profile load error", e); }
            }

            const careerData = await generateCareerPath(userProfile, answers);

            if (!hasNavigated) {
                clearTimeout(safetyTimeout);
                hasNavigated = true;

                // Fire & Forget Save
                if (user) {
                    setDoc(doc(db, "users", user.uid, "assessments", new Date().toISOString()), {
                        answers, result: careerData, createdAt: new Date()
                    }).catch(e => console.error("Save failed", e));
                    setDoc(doc(db, "users", user.uid), { latestResult: careerData }, { merge: true })
                        .catch(e => console.error("Update failed", e));
                }

                setLoading(false);
                navigate('/results', { state: { result: careerData } });
            }

        } catch (error) {
            console.error("Submission Error:", error);
            if (!hasNavigated) {
                clearTimeout(safetyTimeout);
                hasNavigated = true;
                setLoading(false);
                navigate('/results', { state: { result: getSmartFallback(answers) } });
            }
        }
    };

    // 5. RENDERS
    if (loading) {
        return (
            <div className="auth-container" style={{ textAlign: 'center' }}>
                <div className="flex-column" style={{ alignItems: 'center', gap: '20px' }}>
                    <div className="spinner" style={{ width: '60px', height: '60px', borderWidth: '6px' }}></div>
                    <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>
                        Designing Your Future
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

    return (
        <div className="page-container">
            <div className="card animate-enter">

                {/* Progress Header */}
                <div className="flex-column mb-6">
                    <div className="progress-container">
                        {Array.from({ length: totalPages }).map((_, idx) => (
                            <div
                                key={idx}
                                onClick={() => setCurrentPage(idx)}
                                className={`dot ${idx === currentPage ? 'active' : idx < currentPage ? 'completed' : ''}`}
                                title={`Step ${idx + 1}`}
                            />
                        ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Step {currentPage + 1} of {totalPages}
                    </span>
                </div>

                {/* Question List */}
                <div style={{ width: '100%' }}>
                    {currentQuestions.map((q, index) => {
                        const isDropdownOpen = activeDropdownId === q.id;
                        return (
                            <div
                                key={q.id || index}
                                className="animate-fade-in flex-column mb-8"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    zIndex: isDropdownOpen ? 1000 : 1, // Fix stacking context
                                    position: 'relative'
                                }}
                            >
                                <h3>{q.question}</h3>

                                <CustomDropdown
                                    value={answers[q.id] || ""}
                                    onChange={(value) => handleSelect(q.id, value)}
                                    options={q.options}
                                    placeholder="Select your answer..."
                                    isOpen={isDropdownOpen}
                                    onToggle={(val) => setActiveDropdownId(val ? q.id : null)}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Footer Controls */}
                <div className="footer-nav">
                    <button
                        onClick={() => {
                            if (currentPage === 0) navigate('/');
                            else setCurrentPage(prev => Math.max(0, prev - 1));
                        }}
                        className="btn-text"
                    >
                        <ArrowLeft size={16} /> {currentPage === 0 ? 'Back to Home' : 'Previous'}
                    </button>

                    <button
                        onClick={handleNext}
                        className="btn-primary"
                    >
                        {currentPage === totalPages - 1 ? 'Reveal Path' : 'Continue'}
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
