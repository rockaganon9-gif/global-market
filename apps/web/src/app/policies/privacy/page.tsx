import { PolicyLayout, PolicySection } from "@/components/PolicyLayout";

export default function PrivacyPage() {
  return (
    <PolicyLayout title="Politique de confidentialité" updatedAt="16 septembre 2026">
      <PolicySection title="1. Données que nous collectons">
        <p>Lorsque vous utilisez Global Market, nous collectons :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Vos informations de compte : nom complet, email, téléphone, pays.</li>
          <li>Vos informations de livraison lors d&apos;une commande : adresse, ville, téléphone de contact.</li>
          <li>L&apos;historique de vos commandes et, pour les vendeurs, de vos ventes.</li>
          <li>
            Des informations techniques basiques (type d&apos;appareil, pages visitées) pour améliorer le
            fonctionnement du site.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="2. Comment nous utilisons vos données">
        <p>Vos données sont utilisées pour :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Créer et gérer votre compte.</li>
          <li>Traiter vos commandes et vous permettre de suivre leur statut.</li>
          <li>Permettre aux vendeurs de livrer les produits commandés.</li>
          <li>Calculer les commissions et les reversements aux vendeurs.</li>
          <li>Vous contacter concernant votre commande ou votre compte.</li>
          <li>
            Vous envoyer des communications marketing, uniquement si vous y avez consenti explicitement.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="3. Partage des données">
        <p>
          Vos coordonnées de livraison sont partagées avec le vendeur concerné par votre commande, dans la
          seule mesure nécessaire pour livrer le produit. Vos informations de paiement sont traitées
          directement par notre prestataire de paiement (Flutterwave) et ne sont jamais stockées sur nos
          serveurs. Nous ne vendons jamais vos données personnelles à des tiers.
        </p>
      </PolicySection>

      <PolicySection title="4. Conservation des données">
        <p>
          Vos données sont conservées tant que votre compte est actif, puis pendant la durée nécessaire au
          respect de nos obligations légales et comptables (notamment l&apos;historique des transactions).
        </p>
      </PolicySection>

      <PolicySection title="5. Vos droits">
        <p>
          Vous pouvez à tout moment consulter et modifier vos informations personnelles depuis la page{" "}
          <em>Paramètres</em> de votre compte. Pour toute demande de suppression de compte ou d&apos;export de
          vos données, contactez le support de Global Market.
        </p>
      </PolicySection>

      <PolicySection title="6. Sécurité">
        <p>
          Vos mots de passe sont chiffrés et ne sont jamais stockés en clair. Nous mettons en œuvre des
          mesures raisonnables pour protéger vos données contre l&apos;accès non autorisé.
        </p>
      </PolicySection>

      <PolicySection title="7. Modifications">
        <p>
          Cette politique peut évoluer. La date de dernière mise à jour est indiquée en haut de cette page.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
