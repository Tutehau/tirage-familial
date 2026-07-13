import Link from 'next/link'
import { siteConfig } from '@/lib/site-config'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 px-4 py-6">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-2 text-center text-xs text-gray-400">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/mentions-legales" className="hover:text-gray-600">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="hover:text-gray-600">
            Politique de confidentialité
          </Link>
          <Link href="/cgu" className="hover:text-gray-600">
            CGU
          </Link>
        </nav>
        <p>
          © {new Date().getFullYear()} {siteConfig.site.name}
        </p>
      </div>
    </footer>
  )
}
