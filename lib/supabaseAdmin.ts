import { createClient } from '@supabase/supabase-js'

let supabaseAdminInstance: any = null;

export const getSupabaseAdmin = () => {
    if (supabaseAdminInstance) return supabaseAdminInstance;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        // Safe placeholder for build-time evaluation
        return createClient(
            'https://placeholder.supabase.co',
            'dummy_key',
            { auth: { autoRefreshToken: false, persistSession: false } }
        );
    }

    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    return supabaseAdminInstance;
};

export const supabaseAdmin = getSupabaseAdmin();
