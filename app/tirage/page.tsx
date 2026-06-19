import { Suspense } from 'react'
import { TiragePage } from './tirage-page'

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-400">Chargement...</p>
        </div>
      }
    >
      <TiragePage />
    </Suspense>
  )
}
