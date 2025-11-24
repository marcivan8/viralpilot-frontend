
import { createClient } from '@supabase/supabase-js';

// Validation des variables d'environnement
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables');
}

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);
