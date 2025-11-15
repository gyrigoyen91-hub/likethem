// Server-only Supabase client (service role). Do NOT import this in client code.
import { createClient } from '@supabase/supabase-js';

let supabaseServerInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseServer() {
  if (!supabaseServerInstance) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
    }

    supabaseServerInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY, // server-only
      {
        auth: { persistSession: false },
      }
    );
  }
  return supabaseServerInstance;
}
