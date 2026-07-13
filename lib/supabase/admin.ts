import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Client service-role : contourne RLS. Ne jamais importer depuis un composant client
// ni exposer sa clé au navigateur — réservé aux routes serveur qui ont déjà vérifié
// l'identité de l'appelant (session utilisateur) avant de l'utiliser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
