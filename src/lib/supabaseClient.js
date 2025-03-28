import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs"

// Note: supabaseBrowserClient is not required when using the Server Client
let supabaseBrowserClient

function getSupabaseBrowserClient() {
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createPagesBrowserClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
  }
  return supabaseBrowserClient
}

export default getSupabaseBrowserClient
