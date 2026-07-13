import { LegalPage } from '@/components/legal-page'
import { siteConfig } from '@/lib/site-config'

export default function MentionsLegalesPage() {
  const { owner, legal } = siteConfig

  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        {owner.businessName} ({owner.fullName})<br />
        Adresse : {owner.address}
        <br />
        SIRET : {owner.siret}
        <br />
        Email : {owner.email}
        <br />
        Téléphone : {owner.phone}
      </p>

      <h2>Directeur de la publication</h2>
      <p>{legal.directeurPublication}</p>

      <h2>Hébergement</h2>
      <p>
        {legal.hebergeur.nom}
        <br />
        {legal.hebergeur.adresse}
        <br />
        {legal.hebergeur.site}
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus de ce site (textes, structure, code) est la propriété de l&apos;éditeur,
        sauf mention contraire. Toute reproduction non autorisée est interdite.
      </p>
    </LegalPage>
  )
}
