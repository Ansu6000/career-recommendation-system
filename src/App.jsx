import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { auth } from './firebase';
import { getAssessments } from './services/supabase';
import Auth from './components/Auth';
import Assessment from './components/Assessment';
import Results from './components/Results';

import { Zap, Target, GraduationCap, Lightbulb, LogOut, ArrowRight, ArrowDown, History, Eye, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible];
};

const AnimatedSection = ({ children, delay = 0, style = {} }) => {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`
      }}
    >
      {children}
    </div>
  );
};

const Welcome = () => {
  const [user, setUser] = useState(null);
  const [pastAssessments, setPastAssessments] = useState([]); // State for history
  const [initializing, setInitializing] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (u) => {
      setInitializing(false);

      if (u) {
        setUser(u);
        setHistoryLoading(true);

        const storageKey = `assessments_${u.uid}`;

        // STEP 1: Load from localStorage FIRST (instant)
        try {
          const localData = localStorage.getItem(storageKey);
          if (localData) {
            const localAssessments = JSON.parse(localData);
            setPastAssessments(localAssessments);
            console.log("✅ Loaded", localAssessments.length, "from localStorage");
          }
        } catch (e) {
          console.warn("localStorage error:", e);
        }
        setHistoryLoading(false);

        // STEP 2: Fetch from Supabase (cross-device sync)
        try {
          const result = await getAssessments(u.uid);
          if (result.success && result.data.length > 0) {
            // Merge Supabase data with local data
            const localData = localStorage.getItem(storageKey);
            const localAssessments = localData ? JSON.parse(localData) : [];

            const supabaseIds = new Set(result.data.map(a => a.id));
            const localOnlyItems = localAssessments.filter(a =>
              a.id?.startsWith('local_') && !supabaseIds.has(a.id)
            );

            const merged = [...result.data, ...localOnlyItems];
            merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Update localStorage with merged data
            localStorage.setItem(storageKey, JSON.stringify(merged));
            setPastAssessments(merged);
            console.log("✅ Synced", result.data.length, "from Supabase +", localOnlyItems.length, "local");
          }
        } catch (err) {
          console.warn("Supabase fetch error (using local):", err.message);
        }

      } else {
        setUser(null);
        // Load guest assessments from localStorage only
        try {
          const guestData = localStorage.getItem('assessments_guest');
          setPastAssessments(guestData ? JSON.parse(guestData) : []);
        } catch (e) {
          setPastAssessments([]);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogout = () => {
    if (auth) auth.signOut();
    // DON'T clear localStorage - keep assessment data intact!
    // localStorage.clear(); // REMOVED - this was wiping all user data
    setUser(null);
    setPastAssessments([]);
  };



  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  if (initializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafa' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>

      {/* ============ HERO SECTION (FULL SCREEN) ============ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>

        {/* Navigation */}
        <nav className="nav-bar">
          <div className="nav-brand">
            <Zap size={24} />
            <span>Pathwise</span>
          </div>
          <div className="nav-actions">
            {user ? (
              <>
                <span className="nav-user">Hi, <strong>{user.displayName || user.email?.split('@')[0] || 'Student'}</strong></span>
                <button onClick={handleLogout} className="nav-logout">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
                Sign In <ArrowRight size={16} />
              </button>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 16px',
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}>

          <h1 className="animate-enter" style={{
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '28px',
            letterSpacing: '-0.04em',
            color: 'var(--text-main)',
            width: '100%'
          }}>
            Confused About <br />
            <span className="text-gradient">Your Career?</span>
          </h1>

          <p className="animate-enter delay-100" style={{
            fontSize: 'clamp(1.15rem, 2.5vw, 1.4rem)',
            color: 'var(--text-secondary)',
            lineHeight: '1.75',
            marginBottom: '48px',
            width: '100%',
            maxWidth: '620px',
            padding: '0 12px',
            boxSizing: 'border-box'
          }}>
            Take a 5-minute assessment. Get matched careers across Tech, Medicine,
            Defense, Aviation & more—with entrance exams, colleges, and salary insights.
          </p>

          <div className="animate-enter delay-200">
            <button
              onClick={() => navigate(user ? '/assessment' : '/login')}
              className="btn-primary"
              style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '50px' }}
            >
              {user ? 'Start Assessment' : 'Get Started Free'} <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          onClick={scrollToFeatures}
          className="animate-enter delay-300"
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            cursor: 'pointer',
            animation: 'bounce 2s ease-in-out infinite'
          }}
        >
          <ArrowDown size={24} color="var(--text-muted)" />
        </div>
      </section>

      {/* ============ CAREERS GENERATED DASHBOARD ============ */}
      {/* ============ CAREERS GENERATED DASHBOARD ============ */}
      {user && (
        <section style={{
          padding: '40px 24px 80px',
          display: 'flex',
          justifyContent: 'center',
          width: '100%'
        }}>
          <AnimatedSection style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-md)',
              padding: '32px',
              width: '100%',
              margin: '0 auto'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '32px',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <History size={26} color="var(--primary)" /> Careers Generated
              </h3>

              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  <div className="spinner" style={{ width: '30px', height: '30px', margin: '0 auto 10px' }}></div>
                  <p>Loading your history...</p>
                </div>
              ) : pastAssessments.length > 0 ? (
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>Sl No</th>
                        <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>Career Generated</th>
                        <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>Generated Date</th>
                        <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>Candidate</th>
                        <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastAssessments.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>{index + 1}</td>
                          <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-main)', textAlign: 'center' }}>{item.result?.topCareers?.[0]?.pathName || item.title || "Career Path"}</td>
                          <td style={{ padding: '16px', color: 'var(--text-secondary)', textAlign: 'center' }}>{formatDate(item.createdAt)}</td>
                          <td style={{ padding: '16px', color: 'var(--text-secondary)', textAlign: 'center' }}>{item.profileUsed?.name || user.displayName || user.email?.split('@')[0]}</td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <button
                              onClick={() => navigate('/results', { state: { result: { ...item.result, id: item.id, retakeCount: item.retakeCount || 0, answers: item.answers, profileUsed: item.profileUsed } } })}
                              className="view-btn"
                              style={{ margin: '0 auto' }}
                            >
                              <Eye size={16} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  <p>You haven't generated any career paths yet.</p>
                  <button
                    onClick={() => navigate('/assessment')}
                    className="btn-text"
                    style={{
                      color: 'var(--primary)',
                      marginTop: '16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      margin: '16px auto 0'
                    }}
                  >
                    Start your first assessment <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </AnimatedSection>
        </section>
      )}


      {/* ============ FEATURES SECTION ============ */}
      <section id="features" style={{
        padding: '100px 24px',
        background: 'var(--bg-subtle)',
        width: '100%'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <AnimatedSection style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '2.2rem',
              fontWeight: '800',
              marginBottom: '16px',
              color: 'var(--text-main)',
              letterSpacing: '-0.03em'
            }}>
              What You'll <span className="text-gradient">Get</span>
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              Not generic advice. A complete blueprint personalized for you.
            </p>
          </AnimatedSection>

          {/* Features Grid */}
          <div className="features-grid">

            {/* Feature 1 */}
            <AnimatedSection delay={0.1}>
              <div className="feature-card">
                <div className="feature-icon">
                  <Target size={28} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)' }}>
                  Tailored Career Matches
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  Get 3 career recommendations based on your unique profile, with salary expectations and growth potential.
                </p>
              </div>
            </AnimatedSection>

            {/* Feature 2 */}
            <AnimatedSection delay={0.2}>
              <div className="feature-card">
                <div className="feature-icon">
                  <GraduationCap size={28} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)' }}>
                  Step-by-Step Roadmap
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  Know exactly which stream, exams, and degrees to pursue from Class 11 onwards.
                </p>
              </div>
            </AnimatedSection>

            {/* Feature 3 */}
            <AnimatedSection delay={0.3}>
              <div className="feature-card">
                <div className="feature-icon">
                  <Lightbulb size={28} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)' }}>
                  Curated Resources
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  Access hand-picked courses, books, and channels to start your preparation today.
                </p>
              </div>
            </AnimatedSection>

          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section style={{ padding: '80px 24px 60px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          <AnimatedSection style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '800',
              marginBottom: '16px',
              color: 'var(--text-main)',
              letterSpacing: '-0.02em'
            }}>
              How It Works
            </h2>
          </AnimatedSection>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { num: 1, title: 'Complete the Assessment', desc: 'Answer 15 situational questions designed to understand your strengths and preferences.' },
              { num: 2, title: 'Get AI-Powered Analysis', desc: 'Our system evaluates your responses across multiple career dimensions.' },
              { num: 3, title: 'Receive Your Roadmap', desc: 'Get personalized career recommendations with actionable next steps.' }
            ].map((step, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <div className="step-card">
                  <div className="step-number">
                    {step.num}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-main)' }}>{step.title}</h4>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>{step.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section style={{ padding: '60px 24px 100px', textAlign: 'center' }}>
        <AnimatedSection>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '48px 40px',
            background: 'linear-gradient(135deg, var(--primary-dim) 0%, rgba(6, 182, 212, 0.08) 100%)',
            border: '2px solid var(--primary-lighter)',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
              Ready to Find Your <span className="text-gradient">Path</span>?
            </h3>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              5 minutes. Completely free. No credit card.
            </p>
            <button
              onClick={() => navigate(user ? '/assessment' : '/login')}
              className="btn-primary"
              style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '50px' }}
            >
              {user ? 'Start Assessment' : 'Get Started'} <ArrowRight size={18} />
            </button>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        borderTop: '1px solid var(--border-light)',
        background: 'var(--bg-card)'
      }}>
        <p style={{ margin: 0 }}>Pathwise - AI Career Guidance for Students</p>
      </footer>
    </div>
  );
};


function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
