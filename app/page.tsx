import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Gift } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
        <Gift className="h-12 w-12 text-red-500" />
      </div>

      <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900">
        Tirage au Sort
      </h1>
      <p className="mb-2 text-xl text-gray-600">Familial</p>
      <p className="mb-10 max-w-sm text-gray-500">
        Organisez votre échange de cadeaux en famille. Chacun tire un nom,
        personne ne le sait à l&apos;avance.
      </p>

      <Link href="/nouveau">
        <Button size="lg" className="bg-red-500 px-8 text-lg hover:bg-red-600">
          Créer un tirage
        </Button>
      </Link>
    </main>
  )
}
