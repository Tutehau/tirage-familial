import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'

export async function UserBar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const fullName = (user.user_metadata?.full_name as string | undefined) || user.email

  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2 text-sm">
      <span className="truncate text-gray-600">Bonjour, {fullName}</span>
      <LogoutButton />
    </div>
  )
}
