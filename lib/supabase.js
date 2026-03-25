// lib/supabase.js
// Two clients: one for the browser, one for server-side (bypasses RLS)

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Browser client — respects Row Level Security
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client — bypasses RLS (use only in API routes / server components)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
