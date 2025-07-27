import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ✅ Quick debug logs (only run in browser)
if (typeof window !== 'undefined') {
  console.log("✅ Supabase URL:", supabaseUrl)
  console.log("✅ Supabase Anon Key:", supabaseAnonKey ? '[Present ✅]' : '[Missing ❌]')
}

// Check if environment variables are set
if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL environment variable. Please check your .env or Vercel settings.')
}

if (!supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY environment variable. Please check your .env or Vercel settings.')
}

// Create Supabase client with fallback for development
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// ...rest of your code (unchanged)
// [All your type definitions and Supabase functions below remain the same]
