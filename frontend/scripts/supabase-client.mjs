import { createClient } from '@supabase/supabase-js';
import { resolve } from 'node:path';

try {
  process.loadEnvFile(resolve(process.cwd(), '.env.local'));
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

export function supabaseAdmin() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in frontend/.env.local.');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
