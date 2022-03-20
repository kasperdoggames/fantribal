import { createClient } from '@supabase/supabase-js'

// https://supabase.com/docs/guides/with-nextjs
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw Error('No keys provided')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
