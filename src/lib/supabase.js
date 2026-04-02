/**
 * Supabase Client Configuration
 * Security Best Practices:
 * - Uses anon key (public by design) - RLS handles security
 * - No service role or secret keys exposed
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CONFIG } from '../config/config.js';

const SUPABASE_URL = CONFIG.SUPABASE.URL;
const SUPABASE_ANON_KEY = CONFIG.SUPABASE.ANON_KEY;

let supabaseClient = null;

export const getSupabaseClient = () => {
    if (!supabaseClient) {
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                storage: window.localStorage,
                storageKey: 'ufg_marketplace_auth'
            },
            global: {
                headers: {
                    'x-client-info': 'marketplace-ufg-v1'
                }
            }
        });
    }
    return supabaseClient;
};

export const supabase = getSupabaseClient();

export default supabase;
