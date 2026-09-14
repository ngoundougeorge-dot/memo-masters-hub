import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, FileCode, ArrowLeft, Building2, Server, Globe2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions Légales — MémoirePro Gabon" },
      {
        name: "description",
        content:
          "Mentions légales de la plateforme MémoirePro Gabon : éditeur, hébergement Cloudflare, déclaration CNPDCP et propriété intellectuelle.",
      },
    ],
  }),
  component: MentionsLegalesPage,
});

function MentionsLegalesPage() {
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
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
                <FileCode className="h-3.5 w-3.5" />
                Informations Réglementaires
              </Badge>
              <span className="text-xs text-muted-foreground">
                République Gabonaise · 2026
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Mentions Légales
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Informations légales obligatoires relatives à l'exploitation du service en ligne <strong>MémoirePro Gabon</strong>.
            </p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 : Éditeur */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                1. Éditeur de la Plateforme
              </h2>
              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 text-xs space-y-1">
                <p><strong>Dénomination :</strong> MémoirePro Gabon — Plateforme Numérique d'Assistance Académique</p>
                <p><strong>Siège opérationnel :</strong> Boulevard Triomphal, Libreville, République Gabonaise</p>
                <p><strong>Directeur de la Publication :</strong> Pr. Patrick Nguema, Responsable Scientifique</p>
                <p><strong>Courriel officiel :</strong> <a href="mailto:contact@memoirepro.ga" className="text-primary hover:underline">contact@memoirepro.ga</a></p>
                <p><strong>Ligne WhatsApp & Assistance :</strong> +241 74 00 00 00</p>
              </div>
            </section>

            {/* Section 2 : Hébergeur */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                2. Hébergement & Infrastructure de Haute Sécurité
              </h2>
              <p>
                La plateforme est hébergée sur des infrastructures redondées hautement disponibles assurant un niveau de chiffrement et de conformité optimal :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 text-xs space-y-1">
                  <strong className="text-foreground block">Réseau Edge & CDN Cloudflare :</strong>
                  <p>Cloudflare Inc., 101 Townsend St, San Francisco, CA 94107, USA.</p>
                  <p className="text-muted-foreground">Fournisseur de certificat SSL/TLS, atténuation anti-DDoS et routage haute vitesse.</p>
                </div>
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 text-xs space-y-1">
                  <strong className="text-foreground block">Base de Données Chiffrée Supabase :</strong>
                  <p>Supabase Pte Ltd, 970 Toa Payoh North #07-04, Singapour.</p>
                  <p className="text-muted-foreground">Certification SOC2 Type II, ISO 27001, isolation stricte Row Level Security (RLS).</p>
                </div>
              </div>
            </section>

            {/* Section 3 : Données personnelles */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                3. Protection des Données & Déclaration CNPDCP
              </h2>
              <p>
                Le traitement des données personnelles recueillies sur ce site s'effectue sous le contrôle de la <strong>Commission Nationale de Protection des Données à Caractère Personnel (CNPDCP)</strong> de la République Gabonaise, en conformité avec la loi n° 001/2011.
              </p>
              <p>
                Pour toute réclamation ou exercice de vos droits d'accès et d'effacement, adressez-vous à notre DPO à : <a href="mailto:dpo@memoirepro.ga" className="text-primary font-mono hover:underline">dpo@memoirepro.ga</a>.
              </p>
            </section>

            {/* Section 4 : Propriété intellectuelle */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                4. Propriété Intellectuelle
              </h2>
              <p>
                La structure générale du site, les logos, graphismes, textes institutionnels, algorithmes de tarification et l'architecture du système de gestion des jalons sont la propriété exclusive de MémoirePro Gabon.
              </p>
              <p>
                Toute reproduction, représentation, modification ou diffusion totale ou partielle sans autorisation préalable écrite est formellement prohibée au titre du droit de la propriété intellectuelle de l'OAPI (Organisation Africaine de la Propriété Intellectuelle).
              </p>
            </section>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © 2026 MémoirePro Gabon · Libreville · Tous droits réservés
      </footer>
    </div>
  );
}
