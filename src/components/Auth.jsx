import { useState } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, sendEmailVerification, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, BookOpen, GraduationCap, ArrowRight, PlayCircle } from 'lucide-react';

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
    const [debugLogs, setDebugLogs] = useState([]); // Restore missing state
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

    const handleGoogleSignIn = async () => {
        // SANITY CHECK
        // alert("Starting Google Login..."); 

        setLoading(true);
        setError('');
        // setDebugLogs(["Attempting Google Sign-In..."]); // Assuming debugLogs is defined elsewhere

        // 1. Check if Firebase is ready
        if (!auth || !auth.app) {
            console.error("Firebase Auth not initialized.");
            alert("System Error: Google Login service is not active. Switching to Demo Mode automatically.");
            startDemoMode();
            return;
        }

        try {
            console.log("Creating popup...");
            // 2. Direct Popup Call
            const result = await signInWithPopup(auth, googleProvider);

            console.log("Popup success", result.user.email);
            const user = result.user;

            // 3. User Success - Background Sync
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) {
                    await setDoc(doc(db, "users", user.uid), {
                        uid: user.uid,
                        name: user.displayName,
                        email: user.email,
                        board: 'CBSE',
                        grade: '10',
                        createdAt: new Date()
                    }, { merge: true });
                }
            } catch (ignored) {
                console.warn("Profile sync skipped", ignored);
            }

            // 4. Navigate
            navigate('/');

        } catch (err) {
            console.error("Google Sign-In FATAL:", err);

            let msg = "Sign-in failed. Please try again.";
            if (err.code === 'auth/popup-closed-by-user') msg = "Sign-in cancelled.";
            else if (err.code === 'auth/popup-blocked') msg = "Popup blocked. Please allow popups.";
            else if (err.code === 'auth/network-request-failed') msg = "Network error. Check your connection.";

            setError(msg);
            setLoading(false);

            // Auto-fallback for critical errors
            if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/operation-not-allowed') {
                alert(`Configuration Error: ${err.message}. Enabling Demo Mode.`);
                startDemoMode();
            }
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
                                {isLogin ? 'Welcome Back' : 'Join Career Compass'}
                            </h2>
                            <p>
                                {isLogin ? 'Sign in to continue your journey' : 'Start your personalized career discovery'}
                            </p>
                        </div>

                        <button onClick={handleGoogleSignIn} className="btn-google">
                            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Continue with Google
                        </button>



                        <div className="divider" style={{ margin: '24px 0', color: '#9ca3af', fontSize: '0.8rem', fontWeight: '600' }}>
                            <span style={{ background: 'white', padding: '0 10px', position: 'relative', zIndex: 1 }}>OR EMAIL</span>
                        </div>

                        {error && (
                            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold' }}>{error}</span>

                                {showResend && (
                                    <button
                                        onClick={handleResendVerification}
                                        className="btn-primary"
                                        style={{ background: '#2563eb', border: 'none', padding: '8px 16px', fontSize: '0.85rem' }}
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
                                        <select
                                            className="input-field"
                                            style={{ padding: '0.875rem 1rem' }}
                                            value={grade}
                                            onChange={(e) => setGrade(e.target.value)}
                                        >
                                            <option value="11">Class 11</option>
                                            <option value="12">Class 12</option>
                                        </select>
                                        <select
                                            className="input-field"
                                            style={{ padding: '0.875rem 1rem' }}
                                            value={board}
                                            onChange={(e) => setBoard(e.target.value)}
                                        >
                                            <option value="CBSE">CBSE</option>
                                            <option value="ICSE">ICSE</option>
                                            <option value="State">State</option>
                                        </select>
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

                            <div className="input-group">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="input-field"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                />
                                <Lock className="input-icon" size={18} />
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

                        {/* DEBUG CONSOLE */}
                        {debugLogs.length > 0 && (
                            <div style={{
                                marginTop: '30px', padding: '10px', background: '#111827', color: '#22c55e',
                                fontFamily: 'monospace', fontSize: '0.75rem', borderRadius: '8px', width: '100%',
                                maxHeight: '200px', overflowY: 'auto'
                            }}>
                                <div style={{ color: 'white', fontWeight: 'bold', borderBottom: '1px solid #374151', paddingBottom: '4px', marginBottom: '8px' }}>DEBUG CONSOLE</div>
                                {debugLogs.map((log, i) => (
                                    <div key={i}>{log}</div>
                                ))}
                            </div>
                        )}

                    </>
                )}
            </div>
        </div>
    );
};

export default Auth;
