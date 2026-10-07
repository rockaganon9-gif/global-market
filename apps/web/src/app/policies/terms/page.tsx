import { PolicyLayout, PolicySection } from "@/components/PolicyLayout";

export default function TermsPage() {
  return (
    <PolicyLayout title="Conditions d'utilisation" updatedAt="16 septembre 2026">
      <PolicySection title="1. Objet">
        <p>
          Global Market est une marketplace en ligne qui met en relation des vendeurs indépendants
          (« Vendeurs ») avec des acheteurs (« Acheteurs ») partout en Afrique. Global Market ne fabrique
          ni ne vend directement les produits proposés sur la plateforme : chaque Vendeur est responsable
          de ses propres produits, de leurs descriptions, de leur prix et de leur conformité.
        </p>
      </PolicySection>

      <PolicySection title="2. Création de compte">
        <p>
          Pour acheter ou vendre sur Global Market, vous devez créer un compte avec des informations exactes
          (nom, email, téléphone, pays). Vous êtes responsable de la confidentialité de votre mot de passe et
          de toute activité effectuée depuis votre compte.
        </p>
      </PolicySection>

      <PolicySection title="3. Devenir vendeur">
        <p>
          Toute personne peut demander à ouvrir une boutique. Chaque boutique est examinée avant approbation.
          Global Market se réserve le droit de refuser, suspendre ou fermer une boutique qui ne respecte pas
          ces conditions, publie des produits illicites, ou trompe les acheteurs.
        </p>
        <p>
          Global Market prélève une commission sur chaque vente réalisée par un Vendeur, dont le taux est
          affiché dans l&apos;espace vendeur avant chaque transaction. Le solde des ventes, déduction faite de
          la commission, est reversé au Vendeur selon les modalités convenues.
        </p>
      </PolicySection>

      <PolicySection title="4. Produits physiques et digitaux">
        <p>
          Les produits physiques sont expédiés par le Vendeur à l&apos;adresse fournie par l&apos;Acheteur lors
          de la commande. Les produits digitaux sont mis à disposition par lien de téléchargement, accessible
          dans « Mes commandes » dès que le paiement est confirmé.
        </p>
      </PolicySection>

      <PolicySection title="5. Paiement">
        <p>
          Les paiements sont traités via des prestataires tiers sécurisés (Mobile Money, carte bancaire) ou
          réglés en espèces à la livraison selon les options disponibles pour votre commande. Global Market ne
          stocke jamais vos identifiants de paiement.
        </p>
      </PolicySection>

      <PolicySection title="6. Comportement interdit">
        <p>
          Il est interdit d&apos;utiliser la plateforme pour vendre des produits illégaux, contrefaits ou
          dangereux, de publier de fausses informations, ou de tenter de contourner les frais de la
          plateforme en réalisant des transactions en dehors de Global Market.
        </p>
      </PolicySection>

      <PolicySection title="7. Responsabilité">
        <p>
          Global Market agit comme intermédiaire technique entre Acheteurs et Vendeurs. La qualité, la
          conformité et la livraison des produits relèvent de la responsabilité du Vendeur concerné. En cas de
          litige, Global Market peut intervenir pour faciliter une résolution mais n&apos;est pas partie au
          contrat de vente entre l&apos;Acheteur et le Vendeur.
        </p>
      </PolicySection>

      <PolicySection title="8. Modification des conditions">
        <p>
          Ces conditions peuvent être mises à jour. Les utilisateurs seront informés des changements
          significatifs. L&apos;utilisation continue de la plateforme après modification vaut acceptation des
          nouvelles conditions.
        </p>
      </PolicySection>

      <PolicySection title="9. Contact">
        <p>Pour toute question relative à ces conditions, contactez le support de Global Market.</p>
      </PolicySection>
    </PolicyLayout>
  );
}
