import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    // Check if we have a valid session (user clicked reset link)
    useEffect(() => {
        const checkSession = async () => {
            if (!supabase) {
                setError("Authentication service not available.");
                return;
            }

            // Supabase automatically handles the token from the URL
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // No valid session - maybe link expired or invalid
                setError("Invalid or expired reset link. Please request a new one.");
            }
        };

        checkSession();
    }, []);

    const validatePassword = (pwd) => {
        if (pwd.length < 8) return "Password must be at least 8 characters.";
        if (!/[0-9!@#$%^&*]/.test(pwd)) return "Password must contain at least one number or special character.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate passwords
        const pwdError = validatePassword(password);
        if (pwdError) {
            setError(pwdError);
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            if (!supabase) {
                throw new Error("Authentication service not available.");
            }

            // Update the user's password
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                throw updateError;
            }

            // Sign out after password reset (user should login with new password)
            await supabase.auth.signOut();

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            console.error("Password reset error:", err);
            setError(err.message || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="card" style={{ maxWidth: '400px', textAlign: 'center' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(34, 197, 94, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <CheckCircle size={40} color="#22c55e" />
                    </div>
                    <h2 style={{ marginBottom: '12px', color: 'var(--text-main)' }}>Password Updated!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Your password has been successfully reset. Redirecting to login...
                    </p>
                    <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="card" style={{ maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Set New Password</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Enter your new password below
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <div className="input-group" style={{ position: 'relative', marginBottom: '16px' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password"
                            className="input-field"
                            style={{ paddingRight: '50px' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
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
                                display: 'flex'
                            }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="input-group" style={{ position: 'relative', marginBottom: '24px' }}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm New Password"
                            className="input-field"
                            style={{ paddingRight: '50px' }}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        <Lock className="input-icon" size={18} />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                display: 'flex'
                            }}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <button
                    onClick={() => navigate('/login')}
                    className="btn-text"
                    style={{ margin: '24px auto 0', fontSize: '0.85rem', opacity: 0.8 }}
                >
                    ← Back to Login
                </button>
            </div>
        </div>
    );
};

export default ResetPassword;
