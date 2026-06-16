import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Isolated portal clients to allow multiple simultaneous sessions in different tabs!
const portalClients: Record<string, any> = {};

export function getPortalSupabase(portal: 'admin' | 'rider' | 'warehouse' | 'customer' | 'kitchen' | 'vendor') {
  if (typeof window === 'undefined') {
    return supabase; // SSR safety
  }
  
  if (!portalClients[portal]) {
    portalClients[portal] = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: `sb-velto-${portal}-token`,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return portalClients[portal];
}
