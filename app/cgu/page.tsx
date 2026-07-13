import { LegalPage } from '@/components/legal-page'
import { siteConfig } from '@/lib/site-config'

export default function CguPage() {
  const { site, owner } = siteConfig

  return (
    <LegalPage title="Conditions générales d'utilisation">
      <h2>Objet</h2>
      <p>
        Les présentes CGU régissent l&apos;utilisation du site {site.name}, permettant d&apos;organiser
        un tirage au sort de type « Secret Santa » en famille.
      </p>

      <h2>Accès au service</h2>
      <p>
        Le service est accessible gratuitement à tout visiteur ayant renseigné ses coordonnées lors de
        l&apos;accueil. L&apos;éditeur se réserve le droit de suspendre l&apos;accès en cas d&apos;usage
        abusif.
      </p>

      <h2>Responsabilité</h2>
      <p>
        L&apos;éditeur ne saurait être tenu responsable des erreurs de saisie (emails invalides, doublons
        de participants) ni de la mauvaise réception des emails de résultat, notamment en cas de filtrage
        anti-spam.
      </p>

      <h2>Modification des CGU</h2>
      <p>
        L&apos;éditeur se réserve le droit de modifier les présentes conditions à tout moment. Contact :{' '}
        {owner.email}.
      </p>
    </LegalPage>
  )
}
