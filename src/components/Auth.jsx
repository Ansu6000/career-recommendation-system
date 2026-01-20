import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    signUp,
    signIn,
    resetPassword,
    resendVerification,
    saveUserProfile
} from '../services/supabase';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { trackEvent, startSession, ANALYTICS_EVENTS } from '../services/analytics';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isResetting, setIsResetting] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [board, setBoard] = useState('CBSE');
    const [grade, setGrade] = useState('11');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const startDemoMode = () => {
        setLoading(true);
        setTimeout(() => {
            const mockUser = { id: "mock-guest", email: "guest@example.com", user_metadata: { name: name || "Guest Student" } };
            localStorage.setItem("mockUser", JSON.stringify(mockUser));
            localStorage.setItem("userProfile", JSON.stringify({ name: name || "Guest", board, grade }));
            setLoading(false);
            navigate('/');
        }, 800);
    };

    const validatePassword = (pwd) => {
        if (pwd.length < 8) return "Password must be at least 8 characters.";
        if (!/[0-9!@#$%^&*]/.test(pwd)) return "Password must contain at least one number or special character.";
        return null;
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setShowResend(false);

        if (!isLogin) {
            const pwdError = validatePassword(password);
            if (pwdError) {
                setError(pwdError);
                setLoading(false);
                return;
            }
        }

        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl || supabaseUrl === "your_supabase_url") {
            startDemoMode();
            return;
        }

        try {
            if (isLogin) {
                // SIGN IN
                const result = await signIn(email, password);

                if (!result.success) {
                    // Handle specific error cases
                    if (result.error.includes('Invalid login credentials')) {
                        setError("Invalid email or password. Please try again.");
                    } else if (result.error.includes('Email not confirmed')) {
                        setError("Email not verified. Check your inbox (and Spam).");
                        setShowResend(true);
                    } else {
                        setError(result.error);
                    }
                    return;
                }

                // Track successful login
                await startSession(result.data.user.id);
                trackEvent(ANALYTICS_EVENTS.USER_LOGIN, result.data.user.id, {
                    method: 'email',
                    email: result.data.user.email,
                });

                navigate('/');
            } else {
                // SIGN UP
                const result = await signUp(email, password, {
                    name,
                    grade,
                    board
                });

                if (!result.success) {
                    if (result.error.includes('already registered')) {
                        setError("Email already in use. Please login instead.");
                    } else {
                        setError(result.error);
                    }
                    return;
                }

                // Save profile to profiles table (fire-and-forget)
                saveUserProfile(result.data.user.id, {
                    name,
                    email,
                    grade,
                    board
                }).catch(err => console.warn("Profile save failed:", err));

                // Track new signup
                await startSession(result.data.user.id);
                trackEvent(ANALYTICS_EVENTS.USER_SIGNUP, result.data.user.id, {
                    method: 'email',
                    email: email,
                    grade,
                    board,
                });

                // Auto-login after signup (no email verification needed)
                navigate('/');
                return;
            }
        } catch (err) {
            console.error("Auth Error:", err);
            setError(err.message || "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setLoading(true);
        try {
            const result = await resendVerification(email);

            if (result.success) {
                alert("Verification link sent! 📧\n\nPlease check your inbox and Spam folder.");
                setError("Verification email sent. Please verify and login.");
                setShowResend(false);
            } else {
                alert("Failed to resend: " + result.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to resend. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await resetPassword(email);

            if (result.success) {
                alert("Password reset link sent to " + email + ".\n\nCheck your inbox.");
                setIsResetting(false);
                setIsLogin(true);
            } else {
                alert("Error: " + result.error);
            }
        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card" style={{ maxWidth: '400px' }}>

                {isResetting ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <h2 style={{ marginBottom: '8px' }}>Reset Password</h2>
                            <p>Enter your email to receive a reset link</p>
                        </div>

                        <form onSubmit={handlePasswordReset}>
                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="input-field"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Mail className="input-icon" size={18} />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <button
                            onClick={() => setIsResetting(false)}
                            className="btn-text"
                            style={{ width: '100%', marginTop: '16px', color: '#6b7280' }}
                        >
                            Back to Login
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h2 style={{ marginBottom: '8px' }}>
                                {isLogin ? 'Welcome Back' : 'Join Pathwise'}
                            </h2>
                            <p>
                                {isLogin ? 'Sign in to continue your journey' : 'Start your personalized career discovery'}
                            </p>
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                                <span style={{ fontWeight: '600' }}>{error}</span>

                                {showResend && (
                                    <button
                                        onClick={handleResendVerification}
                                        className="btn-primary"
                                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '8px 16px', fontSize: '0.85rem' }}
                                    >
                                        <Mail size={14} style={{ marginRight: '6px' }} /> Resend Verification Link
                                    </button>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleAuth} style={{ width: '100%' }}>
                            {!isLogin && (
                                <>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            className="input-field"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required={!isLogin}
                                        />
                                        <User className="input-icon" size={18} />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                        <CustomDropdown
                                            value={grade}
                                            onChange={(value) => setGrade(value)}
                                            options={[
                                                { value: '11', label: 'Class 11' },
                                                { value: '12', label: 'Class 12' }
                                            ]}
                                            placeholder="Select Class"
                                        />
                                        <CustomDropdown
                                            value={board}
                                            onChange={(value) => setBoard(value)}
                                            options={[
                                                { value: 'CBSE', label: 'CBSE' },
                                                { value: 'ICSE', label: 'ICSE' },
                                                { value: 'State', label: 'State Board' }
                                            ]}
                                            placeholder="Select Board"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="input-field"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Mail className="input-icon" size={18} />
                            </div>

                            <div className="input-group" style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="input-field"
                                    style={{ paddingRight: '80px' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                />
                                <Lock className="input-icon" size={18} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-muted)',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'color 0.2s ease'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {isLogin && (
                                <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '16px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsResetting(true)}
                                        className="btn-text"
                                        style={{ fontSize: '0.85rem', marginLeft: 'auto', padding: 0 }}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
                                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <p style={{ marginTop: '24px', fontSize: '0.9rem', textAlign: 'center' }}>
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(''); setShowResend(false); }}
                                className="btn-text"
                                style={{ display: 'inline', padding: 0, color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}
                            >
                                {isLogin ? 'Sign up' : 'Log in'}
                            </button>
                        </p>

                        <button
                            onClick={() => navigate('/')}
                            className="btn-text"
                            style={{ margin: '16px auto 0', fontSize: '0.85rem', opacity: 0.8 }}
                        >
                            ← Back to Home
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Auth;
