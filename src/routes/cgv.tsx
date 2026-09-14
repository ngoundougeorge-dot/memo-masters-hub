import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, FileText, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/cgv")({
  head: () => ({
    meta: [
      { title: "Conditions Générales de Vente et d'Utilisation — MémoirePro Gabon" },
      {
        name: "description",
        content:
          "Conditions Générales de Vente et d'Utilisation régissant les prestations de rédaction et d'accompagnement académique au Gabon (Airtel Money, Moov Money, droit gabonais).",
      },
    ],
  }),
  component: CGVPage,
});

function CGVPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* En-tête */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:py-4">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="font-serif text-xl font-semibold tracking-tight text-primary">
              MémoirePro Gabon
            </span>
          </Link>

          <Link to="/">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Retour à l'accueil</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 py-10 sm:py-16 px-4">
        <article className="mx-auto max-w-4xl space-y-8 bg-card border border-border/80 rounded-2xl p-6 sm:p-12 shadow-sm">
          <div className="space-y-3 border-b border-border/80 pb-6">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
                <FileText className="h-3.5 w-3.5" />
                Cadre Juridique Gabon
              </Badge>
              <span className="text-xs text-muted-foreground">
                Dernière mise à jour : 14 Septembre 2026
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Conditions Générales de Vente et d'Utilisation (CGV / CGU)
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Régissant les relations contractuelles entre la plateforme <strong>MémoirePro Gabon</strong> et les utilisateurs (étudiants, chercheurs, professionnels) en République Gabonaise.
            </p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            {/* Article 1 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">Article 1.</span> Objet & Champ d'Application
              </h2>
              <p>
                Les présentes Conditions Générales de Vente et d’Utilisation ont pour objet de définir les droits et obligations des parties dans le cadre de la fourniture de prestations d’assistance, de conseil méthodologique, de relecture critique et de rédaction académique personnalisée proposées par la plateforme <strong>MémoirePro Gabon</strong>.
              </p>
              <p>
                Toute passation de commande sur le site implique l’acceptation expresse, préalable et sans réserve des présentes conditions par le client.
              </p>
            </section>

            {/* Article 2 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">Article 2.</span> Nature des Prestations & Conformité CAMES
              </h2>
              <p>
                MémoirePro Gabon met à disposition des candidats inscrits en universités et grandes écoles (UOB, USTM, INSG, USS, etc.) une expertise scientifique assurée par des rédacteurs diplômés de troisième cycle (Master 2, Doctorat). Les prestations couvrent :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>L’aide à la définition du sujet, de la problématique et du protocole de recherche empirique.</li>
                <li>La structuration et la rédaction intégrale de mémoires, thèses professionnelles et rapports de stage.</li>
                <li>Le traitement statistique, l’analyse des données et la mise aux normes bibliographiques (APA 7e édition, ISO 690).</li>
                <li>L'alignement rigoureux avec les exigences scientifiques édictées par le Conseil Africain et Malgache pour l'Enseignement Supérieur (CAMES).</li>
              </ul>
            </section>

            {/* Article 3 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">Article 3.</span> Tarifs & Modalités de Règlement (FCFA)
              </h2>
              <p>
                Les prix des prestations sont indiqués en Francs CFA (XAF CEMAC), toutes taxes comprises. Le montant total dépend du niveau académique, du nombre de pages et du délai imparti, conformément au simulateur en ligne.
              </p>
              <p>
                Les règlements sont exécutés de manière sécurisée via les opérateurs nationaux autorisés au Gabon :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                  <strong className="text-foreground block text-xs">Paiement Mobile Gabon :</strong>
                  <span className="text-xs">Airtel Money Gabon (opérateur privilégié) & Moov Money (Moov Africa Gabon Telecom).</span>
                </div>
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                  <strong className="text-foreground block text-xs">Paiement Bancaire :</strong>
                  <span className="text-xs">Cartes bancaires (Visa / Mastercard) et virement bancaire local (BGFI Bank, UBA Gabon).</span>
                </div>
              </div>
            </section>

            {/* Article 4 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">Article 4.</span> Processus de Rédaction par Jalons (Milestones)
              </h2>
              <p>
                Afin de garantir une transparence absolue, chaque projet est découpé en quatre (4) jalons progressifs consultables dans l'Espace Client :
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li><strong>Jalon 1 :</strong> Cadrage méthodologique, problématique et plan détaillé.</li>
                <li><strong>Jalon 2 :</strong> Revue de littérature et cadre conceptuel théorique.</li>
                <li><strong>Jalon 3 :</strong> Démarche empirique, analyse des données et résultats.</li>
                <li><strong>Jalon 4 :</strong> Conclusion générale, recommandations managériales et bibliographie normée.</li>
              </ol>
              <p className="text-xs italic">
                Règle de sécurité : Les jalons sont accessibles en consultation continue. Le manuscrit intégral sous format éditable (.DOCX) et le certificat anti-plagiat ne sont déverrouillés qu'après achèvement complet du travail.
              </p>
            </section>

            {/* Article 5 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">Article 5.</span> Garantie Contractuelle Anti-Plagiat
              </h2>
              <p>
                MémoirePro Gabon s'engage formellement sur l'originalité exclusive de chaque travail produit. Chaque document fait l’objet d'un double contrôle systématique via les logiciels de détection de référence mondiale (<strong>Turnitin</strong> et <strong>Compilatio</strong>).
              </p>
              <p>
                Le seuil contractuel de similarité toléré est garanti <strong>strictement inférieur à 5%</strong> (correspondant uniquement aux citations légales entre guillemets et aux formules canoniques obligatoires). Une <strong>Attestation Officielle de Conformité Académique & Anti-Plagiat</strong> avec empreinte numérique SHA-256 est délivrée à la livraison.
              </p>
            </section>

            {/* Article 6 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">Article 6.</span> Révisions & Corrections Gratuites sous 30 Jours
              </h2>
              <p>
                Le client bénéficie d'une période de garantie de <strong>trente (30) jours calendaires</strong> à compter de la livraison finale pour solliciter des retouches, ajustements ou corrections demandés par son encadreur ou directeur de recherche à l'université.
              </p>
              <p>
                Ces révisions sont effectuées <strong>gratuitement</strong> et avec diligence, sous réserve qu’elles demeurent conformes aux consignes initialement fournies lors de la commande.
              </p>
            </section>

            {/* Article 7 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">Article 7.</span> Propriété Intellectuelle & Cession des Droits
              </h2>
              <p>
                Dès règlement intégral de la prestation, l’ensemble des droits patrimoniaux et d'exploitation sur le travail rédigé est irrévocablement cédé à titre exclusif au client.
              </p>
              <p>
                MémoirePro Gabon s'interdit formellement de republier, revendre ou communiquer tout ou partie du mémoire à des tiers ou à d'autres étudiants.
              </p>
            </section>

            {/* Article 8 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">Article 8.</span> Droit Applicable & Résolution des Litiges
              </h2>
              <p>
                Les présentes conditions sont régies et interprétées selon le droit en vigueur en <strong>République Gabonaise</strong> et les principes du droit commercial de l'OHADA.
              </p>
              <p>
                En cas de contestation relative à l'interprétation ou à l'exécution de la commande, les parties s'engagent à privilégier une solution amiable par voie de médiation. À défaut d'accord, compétence expresse est attribuée aux <strong>Tribunaux compétents de Libreville</strong>.
              </p>
            </section>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © 2026 MémoirePro Gabon · Direction Juridique & Conformité Contractuelle · Libreville
      </footer>
    </div>
  );
}
