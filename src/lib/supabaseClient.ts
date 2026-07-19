import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Vite injects these at build time from .env.local (gitignored via *.local).
// See .env.example for the shape; values live in the Supabase dashboard under
// Project Settings → API (project: icebrk).
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Null when the env vars aren't set, so the app (and every game) keeps working
 * without a Supabase project. Auth UI shows a friendly "not configured" note
 * instead of crashing.
 */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null
