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

export { supabase };
