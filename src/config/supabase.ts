import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// -----------------------------------------------------------
// 🔧 SETUP: Replace these two values with your Supabase project
// credentials from: https://supabase.com/dashboard → Settings → API
// -----------------------------------------------------------
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
// -----------------------------------------------------------

if (
  SUPABASE_URL === 'https://YOUR_PROJECT_ID.supabase.co' ||
  SUPABASE_ANON_KEY === 'YOUR_ANON_KEY'
) {
  console.warn(
    '[Supabase] ⚠️  Credentials not set. Edit src/config/supabase.ts before using auth or cloud features.'
  );
}

/**
 * The Supabase client.
 *
 * NOTE: We use the untyped client here because the Database type definitions
 * in src/types/supabase.ts are manually written (not auto-generated).
 * Once you run `supabase gen types typescript --project-id YOUR_ID > src/types/supabase.ts`
 * you can replace `createClient` with `createClient<Database>` and import Database.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
