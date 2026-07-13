'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const DISMISS_KEY = 'tf_pwa_install_dismissed'
const DISMISS_DAYS = 7

type BeforeInstallPromptEvent = Event & {
  prompt: () => void
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  )
}

function isIOS() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function dismissedRecently() {
  try {
    const t = localStorage.getItem(DISMISS_KEY)
    return !!t && Date.now() - Number(t) < DISMISS_DAYS * 24 * 3600 * 1000
  } catch {
    return false
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  } catch {
    // localStorage indisponible (navigation privée...) : tant pis, on redemandera plus tard
  }
}

export function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [ios] = useState(() => typeof navigator !== 'undefined' && isIOS())
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    if (isStandalone() || dismissedRecently()) return

    function handlePrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', () => setVisible(false))

    if (ios) {
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }

    return () => window.removeEventListener('beforeinstallprompt', handlePrompt)
  }, [ios])

  if (!visible) return null

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }

  function handleClose() {
    markDismissed()
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Installer l'application"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100">
        <Download className="h-5 w-5 text-red-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">Installer l&apos;application</p>
        <p className="text-xs text-gray-500">
          {ios
            ? 'Appuyez sur Partager, puis « Sur l\'écran d\'accueil ».'
            : 'Accès rapide, sur votre écran d\'accueil.'}
        </p>
      </div>
      {!ios && (
        <Button size="sm" onClick={handleInstall} className="bg-red-500 hover:bg-red-600">
          Installer
        </Button>
      )}
      <button
        onClick={handleClose}
        aria-label="Fermer"
        className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
