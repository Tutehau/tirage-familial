import { LegalPage } from '@/components/legal-page'
import { siteConfig } from '@/lib/site-config'

export default function ConfidentialitePage() {
  const { owner, site } = siteConfig

  return (
    <LegalPage title="Politique de confidentialité">
      <p>
        {site.name} accorde une grande importance à la protection de vos données personnelles.
        Cette page décrit les données collectées et leur usage.
      </p>

      <h2>Données collectées</h2>
      <p>
        Lors de votre première visite, nous vous demandons votre nom complet, votre adresse email et
        votre numéro de téléphone. Lors de la création d&apos;un tirage, l&apos;email de
        l&apos;organisateur et les prénoms des participants sont également collectés.
      </p>

      <h2>Finalité</h2>
      <p>
        Ces informations sont utilisées uniquement pour vous contacter au sujet de vos tirages et pour
        vous envoyer par email le résultat qui vous concerne. Elles ne sont ni vendues, ni cédées à des
        tiers.
      </p>

      <h2>Destinataire</h2>
      <p>
        Les coordonnées saisies à l&apos;accueil sont transmises par email à l&apos;éditeur du site (
        {owner.email}) à des fins de suivi.
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Les données sont conservées le temps nécessaire à la gestion de votre demande, puis supprimées.
      </p>

      <h2>Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de
        suppression de vos données. Pour l&apos;exercer, contactez-nous à {owner.email}.
      </p>
    </LegalPage>
  )
}
