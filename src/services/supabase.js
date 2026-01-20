import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("✅ Supabase initialized");
} else {
    console.warn("⚠️ Supabase credentials missing - using localStorage only");
}

// ============================================================================
// AUTHENTICATION OPERATIONS
// ============================================================================

/**
 * Sign up with email and password
 */
export const signUp = async (email, password, metadata = {}) => {
    if (!supabase) return { success: false, error: "Supabase not initialized" };

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata, // { name, grade, board }
                emailRedirectTo: `${window.location.origin}/login`
            }
        });

        if (error) throw error;

        return { success: true, data, needsVerification: !data.user?.email_confirmed_at };
    } catch (error) {
        console.error("❌ Signup error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Sign in with email and password
 */
export const signIn = async (email, password) => {
    if (!supabase) return { success: false, error: "Supabase not initialized" };

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error("❌ Sign in error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Sign out user
 */
export const signOut = async () => {
    if (!supabase) return { success: false, error: "Supabase not initialized" };

    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("❌ Sign out error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Get current session
 */
export const getSession = async () => {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

/**
 * Reset password (send reset email)
 */
export const resetPassword = async (email) => {
    if (!supabase) return { success: false, error: "Supabase not initialized" };

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("❌ Password reset error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Resend verification email
 */
export const resendVerification = async (email) => {
    if (!supabase) return { success: false, error: "Supabase not initialized" };

    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/login`
            }
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("❌ Resend verification error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Update user profile/metadata
 */
export const updateUserProfile = async (updates) => {
    if (!supabase) return { success: false, error: "Supabase not initialized" };

    try {
        const { data, error } = await supabase.auth.updateUser({
            data: updates
        });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("❌ Update profile error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (callback) => {
    if (!supabase) {
        console.warn("Supabase not initialized");
        return { data: { subscription: { unsubscribe: () => { } } } };
    }

    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
};

// ============================================================================
// ASSESSMENT DATA OPERATIONS
// ============================================================================

/**
 * Save a new assessment or update an existing one
 */
export const saveAssessment = async (userId, assessmentData) => {
    if (!supabase) {
        console.warn("Supabase not available");
        return { success: false, error: "Supabase not initialized" };
    }

    try {
        const { data, error } = await supabase
            .from('assessments')
            .upsert({
                id: assessmentData.id,
                user_id: userId,
                title: assessmentData.title,
                result: assessmentData.result,
                answers: assessmentData.answers,
                profile_used: assessmentData.profileUsed,
                retake_count: assessmentData.retakeCount || 0,
                created_at: assessmentData.createdAt || new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'id'
            })
            .select();

        if (error) throw error;

        console.log("✅ Saved to Supabase:", data);
        return { success: true, data };
    } catch (error) {
        console.error("❌ Supabase save error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all assessments for a user
 */
export const getAssessments = async (userId) => {
    if (!supabase) {
        return { success: false, data: [], error: "Supabase not initialized" };
    }

    try {
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Convert snake_case to camelCase for frontend compatibility
        const formattedData = data.map(item => ({
            id: item.id,
            title: item.title,
            result: item.result,
            answers: item.answers,
            profileUsed: item.profile_used,
            retakeCount: item.retake_count,
            createdAt: item.created_at,
            updatedAt: item.updated_at
        }));

        console.log("✅ Loaded", formattedData.length, "assessments from Supabase");
        return { success: true, data: formattedData };
    } catch (error) {
        console.error("❌ Supabase fetch error:", error);
        return { success: false, data: [], error: error.message };
    }
};

/**
 * Update an existing assessment
 */
export const updateAssessment = async (assessmentId, updateData) => {
    if (!supabase) {
        return { success: false, error: "Supabase not initialized" };
    }

    try {
        const { data, error } = await supabase
            .from('assessments')
            .update({
                result: updateData.result,
                answers: updateData.answers,
                retake_count: updateData.retakeCount,
                updated_at: new Date().toISOString()
            })
            .eq('id', assessmentId)
            .select();

        if (error) throw error;

        console.log("✅ Updated in Supabase:", data);
        return { success: true, data };
    } catch (error) {
        console.error("❌ Supabase update error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete an assessment
 */
export const deleteAssessment = async (assessmentId) => {
    if (!supabase) {
        return { success: false, error: "Supabase not initialized" };
    }

    try {
        const { error } = await supabase
            .from('assessments')
            .delete()
            .eq('id', assessmentId);

        if (error) throw error;

        console.log("✅ Deleted from Supabase:", assessmentId);
        return { success: true };
    } catch (error) {
        console.error("❌ Supabase delete error:", error);
        return { success: false, error: error.message };
    }
};

// ============================================================================
// USER PROFILE (separate table for extended profile data)
// ============================================================================

/**
 * Save user profile to profiles table
 */
export const saveUserProfile = async (userId, profileData) => {
    if (!supabase) return { success: false, error: "Supabase not initialized" };

    try {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                name: profileData.name,
                email: profileData.email,
                grade: profileData.grade,
                board: profileData.board,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("❌ Save profile error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Get user profile from profiles table
 */
export const getUserProfile = async (userId) => {
    if (!supabase) return { success: false, error: "Supabase not initialized" };

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
        return { success: true, data };
    } catch (error) {
        console.error("❌ Get profile error:", error);
        return { success: false, error: error.message };
    }
};

export { supabase };
