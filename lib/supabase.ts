// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// These must be set in Vercel & .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Named export so `import { supabase } from "../lib/supabase"` works
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
