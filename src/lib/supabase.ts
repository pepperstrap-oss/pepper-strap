// =============================================
// src/lib/supabase.ts
// Client Supabase untuk digunakan di seluruh app
// =============================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client untuk browser (komponen client-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
