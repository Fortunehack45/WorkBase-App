import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xniajjtsmcfwbtjnfmck.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AR3j4TD2FtInE92vZ0j7rg_bF5fxs5v';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // Turn off auth storage persistence since we are using anonymous access for the database client demo
  }
});
