import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

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
            const mockUser = { uid: "mock-guest", email: "guest@example.com", displayName: name || "Guest Student" };
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

        if (!isLogin) {
            const pwdError = validatePassword(password);
            if (pwdError) {
                setError(pwdError);
                setLoading(false);
                return;
            }
        }

        const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
        const isInvalidKey = !apiKey || apiKey === "your_api_key" || !apiKey.startsWith("AIza");

        if (isInvalidKey) {
            startDemoMode();
            return;
        }

        // Timeout Promise (10s limit)
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Network timeout. Check connection.")), 10000)
        );

        try {
            if (isLogin) {
                const userCredential = await Promise.race([
                    signInWithEmailAndPassword(auth, email, password),
                    timeoutPromise
                ]);

                if (!userCredential.user.emailVerified) {
                    await signOut(auth);
                    setError("Email not verified. Check your inbox (and Spam).");
                    setShowResend(true);
                    return;
                }

                navigate('/');
            } else {
                const userCredential = await Promise.race([
                    createUserWithEmailAndPassword(auth, email, password),
                    timeoutPromise
                ]);
                const user = userCredential.user;

                // Update Display Name
                try {
                    await updateProfile(user, { displayName: name });
                    await user.reload(); // Force refresh to ensure name persists
                } catch (error) {
                    console.error("Failed to set display name:", error);
                }

                // Send Verification Email
                await sendEmailVerification(user);

                // NON-BLOCKING: Save profile in background
                setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    name,
                    email,
                    board,
                    grade,
                    createdAt: new Date()
                }).catch(err => console.warn("Background profile save failed:", err));

                // Sign out immediately so they can't access the app
                await signOut(auth);

                // Clear form data so it doesn't "autofill" the login screen
                setEmail('');
                setPassword('');
                setName('');
                // Keep board/grade as defaults or clear them if desired

                // Unlock UI immediately
                setLoading(false);
                alert("Account created! We have sent a verification LINK to " + email + ".\n\nPlease check your inbox and SPAM folder. You must verify before logging in.");
                setIsLogin(true);
                return;
            }
        } catch (err) {
            console.error("Auth Error:", err);

            if (err.message.includes('timeout')) {
                setError("Connection timed out. Please try again or check your internet.");
            } else if (err.message.includes('api-key')) {
                startDemoMode();
                return;
            } else if (err.code === 'auth/configuration-not-found') {
                setError("Sign-in not enabled in Firebase Console.");
            } else if (err.code === 'auth/email-already-in-use') {
                setError("Email already in use. Please login.");
            } else {
                setError(err.message.replace('Firebase: ', ''));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            await signOut(auth);
            alert("Verification link resent! Please check your Spam/Junk folder.");
            setError("Link sent. Please verify and login.");
            setShowResend(false);
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/too-many-requests') {
                alert("Too many requests. Please wait a moment.");
            } else {
                alert("Failed to resend. Please try logging in again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password Reset URL sent to " + email + ". Check your inbox.");
            setIsResetting(false);
            setIsLogin(true);
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/user-not-found') alert("No user found with this email.");
            else alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card" style={{ maxWidth: '400px' }}> {/* Forced width for login card */}

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
                                onClick={() => setIsLogin(!isLogin)}
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

