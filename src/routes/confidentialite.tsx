import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Shield, ArrowLeft, Lock, KeyRound, EyeOff, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de Confidentialité & Protection des Données — MémoirePro Gabon" },
      {
        name: "description",
        content:
          "Politique de confidentialité et protection des données personnelles conforme à la Loi gabonaise n° 001/2011 et aux directives de la CNPDCP.",
      },
    ],
  }),
  component: ConfidentialitePage,
});

function ConfidentialitePage() {
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

      {/* Contenu */}
      <main className="flex-1 py-10 sm:py-16 px-4">
        <article className="mx-auto max-w-4xl space-y-8 bg-card border border-border/80 rounded-2xl p-6 sm:p-12 shadow-sm">
          <div className="space-y-3 border-b border-border/80 pb-6">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-xs gap-1">
                <Shield className="h-3.5 w-3.5" />
                Loi Gabonaise n° 001/2011 (CNPDCP)
              </Badge>
              <span className="text-xs text-muted-foreground">
                En vigueur au 14 Septembre 2026
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Politique de Confidentialité & Protection des Données Personnelles
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Engagement solennel de discrétion absolue, de sécurité des données et de respect de la vie privée des étudiants et chercheurs en République Gabonaise.
            </p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">1.</span> Cadre Réglementaire & Autorité de Contrôle
              </h2>
              <p>
                La plateforme <strong>MémoirePro Gabon</strong> s’engage à traiter l’ensemble des données personnelles de ses utilisateurs en stricte conformité avec les dispositions de la <strong>Loi n° 001/2011 du 25 septembre 2011 relative à la protection des données à caractère personnel en République Gabonaise</strong>.
              </p>
              <p>
                Les traitements automatisés mis en œuvre respectent les principes édictés par la <strong>Commission Nationale de Protection des Données à Caractère Personnel (CNPDCP)</strong> du Gabon : loyauté, légalité, proportionnalité et sécurité renforcée.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">2.</span> Règle d'Or : Anonymat Absolu de l'Étudiant
              </h2>
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
                  <EyeOff className="h-4 w-4" />
                  Garantie de non-divulgation universitaire
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  MémoirePro Gabon garantit qu’<strong>aucune information relative à l'identité de l'étudiant, son établissement (UOB, USTM, INSG, USS, etc.), son thème de recherche ou ses documents ne sera jamais divulguée ou transmise à son université, à son corps professoral ou à toute entité tierce</strong>. Les échanges avec le rédacteur sont cloisonnés et pseudonymisés.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">3.</span> Données Collectées & Finalités du Traitement
              </h2>
              <p>
                Dans le cadre strict de l'exécution de la prestation, nous collectons exclusivement les données indispensables :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Données de contact :</strong> Nom/Prénom, adresse email, numéro de téléphone WhatsApp Gabon (+241).</li>
                <li><strong>Données de commande académique :</strong> Discipline, diplôme préparé, consignes méthodologiques, plan et documents de travail téléversés.</li>
                <li><strong>Données de transaction :</strong> Numéro de transaction Mobile Money (Airtel Money Gabon / Moov Money) ou référence de virement bancaire. Aucune coordonnée bancaire sensible ou code secret PIN n'est enregistré sur nos serveurs.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">4.</span> Sécurité Technique, Chiffrement & RLS
              </h2>
              <p>
                MémoirePro Gabon applique les standards industriels les plus rigoureux en matière de cybersécurité :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-1">
                  <Lock className="h-4 w-4 text-primary" />
                  <strong className="text-foreground block text-xs">Chiffrement AES-256 :</strong>
                  <span className="text-xs">Tous les mémoires, plans et pièces jointes sont chiffrés au repos.</span>
                </div>
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-1">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <strong className="text-foreground block text-xs">Transit Sécurisé TLS 1.3 :</strong>
                  <span className="text-xs">Toutes les communications bénéficient d'un canal chiffré HSTS avec certificat SSL strict.</span>
                </div>
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-1">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <strong className="text-foreground block text-xs">Sécurité RLS Supabase :</strong>
                  <span className="text-xs">Isolation totale des bases de données : chaque utilisateur n'a accès qu'à son propre dossier.</span>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">5.</span> Durée de Conservation & Droit à l'Oubli
              </h2>
              <p>
                Les fichiers sources et brouillons de rédaction sont conservés pendant la durée de la garantie de révision (30 jours après livraison), puis sont <strong>automatiquement purgés et définitivement détruits</strong> de nos serveurs.
              </p>
              <p>
                Conformément à l'article 35 de la loi gabonaise n° 001/2011, chaque utilisateur dispose d’un <strong>droit d'accès, de rectification et d'effacement immédiat</strong> de l’ensemble de ses données. Une simple demande transmise à notre Délégué à la Protection des Données suffit pour déclencher la suppression complète irréversible.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">6.</span> Contact du Délégué à la Protection des Données (DPO)
              </h2>
              <p>
                Pour toute question relative à la gestion de vos données ou pour exercer vos droits légaux au Gabon, vous pouvez joindre notre responsable conformité :
              </p>
              <div className="p-3 rounded-lg border border-border/80 bg-muted/20 text-xs">
                <strong>Délégué à la Protection des Données MémoirePro Gabon</strong><br />
                Courriel sécurisé : <a href="mailto:dpo@memoirepro.ga" className="text-primary font-mono hover:underline">dpo@memoirepro.ga</a><br />
                Libreville, République Gabonaise
              </div>
            </section>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © 2026 MémoirePro Gabon · Direction de la Sécurité des Systèmes d'Information & Conformité CNPDCP
      </footer>
    </div>
  );
}
