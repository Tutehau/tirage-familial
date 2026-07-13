import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <Link href="/" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" />
        Accueil
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">{title}</h1>

      <div className="space-y-4 text-sm leading-relaxed text-gray-600 [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-gray-900">
        {children}
      </div>
    </main>
  )
}
