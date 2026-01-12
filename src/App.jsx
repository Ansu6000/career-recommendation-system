import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { auth } from './firebase';
import Auth from './components/Auth';
import Assessment from './components/Assessment';
import Results from './components/Results';

import { Zap, Target, GraduationCap, Lightbulb, LogOut, ArrowRight, ArrowDown } from 'lucide-react';
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
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      if (u && u.emailVerified) {
        setUser(u);
      } else {
        setUser(JSON.parse(localStorage.getItem('mockUser')));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    localStorage.clear();
    setUser(null);
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

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
        <nav className="nav-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-main)' }}>
            <Zap size={24} color="var(--primary)" />
            <span>Pathwise</span>
          </div>
          <div>
            {user ? (
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hi, {user.displayName || 'Student'}</span>
                <button onClick={handleLogout} className="btn-text" style={{ color: '#f87171' }}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
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
          padding: '0 24px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>

          <h1 className="animate-enter" style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '24px',
            letterSpacing: '-0.04em',
            color: 'var(--text-main)'
          }}>
            Confused About <br />
            <span className="text-gradient">Your Career?</span>
          </h1>

          <p className="animate-enter delay-100" style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.7',
            marginBottom: '40px',
            maxWidth: '550px'
          }}>
            Answer 20 quick questions and get a personalized career roadmap
            with specific courses, exams, and resources for Indian students.
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

      {/* ============ FEATURES SECTION ============ */}
      <section id="features" style={{
        padding: '100px 24px',
        background: 'rgba(0,0,0,0.3)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <AnimatedSection style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '800',
              marginBottom: '16px',
              color: 'var(--text-main)',
              letterSpacing: '-0.02em'
            }}>
              What You'll Get
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
              Not generic advice. A complete blueprint personalized for you.
            </p>
          </AnimatedSection>

          {/* Features Grid */}
          <div className="features-grid">

            {/* Feature 1 */}
            <AnimatedSection delay={0.1}>
              <div className="card" style={{ padding: '32px', textAlign: 'center', height: '100%' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(96, 165, 250, 0.1)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <Target size={24} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)' }}>
                  Career Matches
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  3 career recommendations with salary ranges, work environment, and real examples.
                </p>
              </div>
            </AnimatedSection>

            {/* Feature 2 */}
            <AnimatedSection delay={0.2}>
              <div className="card" style={{ padding: '32px', textAlign: 'center', height: '100%' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(96, 165, 250, 0.1)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <GraduationCap size={24} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)' }}>
                  Complete Roadmap
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  Which stream, entrance exams (JEE, NEET, CLAT), and degrees - step by step.
                </p>
              </div>
            </AnimatedSection>

            {/* Feature 3 */}
            <AnimatedSection delay={0.3}>
              <div className="card" style={{ padding: '32px', textAlign: 'center', height: '100%' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(96, 165, 250, 0.1)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <Lightbulb size={24} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)' }}>
                  Real Resources
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  YouTube channels, courses, and books you can start with today.
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {[
              { num: 1, title: 'Take the Assessment', desc: '20 questions about your interests, personality, and goals. Takes 5 minutes.' },
              { num: 2, title: 'AI Analyzes Your Profile', desc: 'Our AI understands your unique combination of traits and preferences.' },
              { num: 3, title: 'Get Your Blueprint', desc: 'Receive detailed career matches, a step-by-step roadmap, and curated resources.' }
            ].map((step, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: 'black',
                    fontSize: '1.1rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {step.num}
                  </div>
                  <div style={{ paddingTop: '4px' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-main)' }}>{step.title}</h4>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>{step.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section style={{ padding: '40px 24px 80px', textAlign: 'center' }}>
        <AnimatedSection>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '48px 40px',
            background: 'rgba(96, 165, 250, 0.05)',
            border: '1px solid rgba(96, 165, 250, 0.15)',
            borderRadius: '24px'
          }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
              Ready to Find Your Path?
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
        borderTop: '1px solid var(--glass-border)'
      }}>
        <p style={{ margin: 0 }}>Pathwise - AI Career Guidance for Indian Students</p>
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
