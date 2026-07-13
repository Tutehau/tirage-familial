import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Footer } from '@/components/footer'
import { PwaInstall } from '@/components/pwa-install'
import { UserBar } from '@/components/user-bar'
import { siteConfig } from '@/lib/site-config'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: siteConfig.site.name,
  description: siteConfig.site.description,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.site.shortName,
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: siteConfig.site.themeColor,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col bg-gradient-to-br from-red-50 via-white to-green-50">
        <UserBar />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
        <PwaInstall />
      </body>
    </html>
  )
}
