import { PolicyLayout, PolicySection } from "@/components/PolicyLayout";

export default function ShippingPage() {
  return (
    <PolicyLayout title="Politique de livraison" updatedAt="16 septembre 2026">
      <PolicySection title="1. Qui gère la livraison ?">
        <p>
          Chaque boutique sur Global Market est responsable de la livraison de ses propres produits physiques.
          Les délais et frais de livraison peuvent donc varier d&apos;un vendeur à l&apos;autre.
        </p>
      </PolicySection>

      <PolicySection title="2. Délais indicatifs">
        <p>
          En général, les commandes sont préparées sous 1 à 3 jours ouvrés puis livrées sous 2 à 10 jours selon
          la distance entre le vendeur et l&apos;adresse de livraison. Ces délais sont indicatifs : consultez la
          fiche produit ou contactez le vendeur pour une estimation précise.
        </p>
      </PolicySection>

      <PolicySection title="3. Suivi de commande">
        <p>
          Vous pouvez suivre le statut de votre commande (En attente, Confirmée, Expédiée, Livrée) depuis la
          page « Mes commandes ».
        </p>
      </PolicySection>

      <PolicySection title="4. Produits digitaux">
        <p>
          Les produits digitaux ne nécessitent aucune livraison physique : le lien de téléchargement est
          disponible instantanément dans « Mes commandes » dès que le paiement est confirmé.
        </p>
      </PolicySection>

      <PolicySection title="5. Zones desservies">
        <p>
          Global Market est disponible dans plusieurs pays d&apos;Afrique. La disponibilité de la livraison
          dans votre zone dépend du vendeur choisi — vérifiez le pays et la ville de la boutique avant de
          commander un produit physique.
        </p>
      </PolicySection>

      <PolicySection title="6. Problème de livraison">
        <p>
          Si votre commande n&apos;arrive pas dans le délai annoncé, contactez d&apos;abord le vendeur via
          votre commande. Si le problème persiste, le support de Global Market peut intervenir.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
