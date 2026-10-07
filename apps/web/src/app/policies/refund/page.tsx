import { PolicyLayout, PolicySection } from "@/components/PolicyLayout";

export default function RefundPage() {
  return (
    <PolicyLayout title="Politique de remboursement" updatedAt="16 septembre 2026">
      <PolicySection title="1. Produits physiques">
        <p>
          Si un produit physique reçu est endommagé, non conforme à sa description, ou n&apos;arrive jamais,
          contactez le vendeur via la page de votre commande dans « Mes commandes ». La plupart des vendeurs
          acceptent un retour ou un remboursement sous 7 jours suivant la réception, sauf indication contraire
          précisée sur la fiche produit.
        </p>
        <p>
          Si vous et le vendeur ne parvenez pas à un accord, vous pouvez contacter le support de Global
          Market, qui pourra examiner le litige.
        </p>
      </PolicySection>

      <PolicySection title="2. Produits digitaux">
        <p>
          En raison de leur nature, les produits digitaux (fichiers téléchargeables, formations, modèles...)
          ne sont généralement pas remboursables une fois le lien de téléchargement révélé, sauf si le fichier
          est défectueux, corrompu, ou ne correspond manifestement pas à sa description. Contactez le vendeur
          concerné pour signaler un problème.
        </p>
      </PolicySection>

      <PolicySection title="3. Paiement à la livraison">
        <p>
          Pour les commandes payées à la livraison, vous pouvez refuser le colis à réception s&apos;il ne
          correspond pas à votre commande. Aucun paiement n&apos;est dû dans ce cas.
        </p>
      </PolicySection>

      <PolicySection title="4. Délais de remboursement">
        <p>
          Lorsqu&apos;un remboursement est accepté, il est généralement traité sous 3 à 10 jours ouvrés selon
          le mode de paiement utilisé (Mobile Money, carte bancaire).
        </p>
      </PolicySection>

      <PolicySection title="5. Commandes annulées avant expédition">
        <p>
          Une commande peut être annulée gratuitement tant qu&apos;elle n&apos;a pas encore été expédiée par le
          vendeur. Une fois expédiée, les conditions de retour du vendeur s&apos;appliquent.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
