import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  MapPin,
  GraduationCap,
  CreditCard,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/TiltCard";
import AuthButton from "@/components/AuthButton";
import OrderForm from "@/components/OrderForm";

export const Route = createFileRoute("/")({
  component: Home,
});

const pricing = [
  {
    title: "Rapport de stage",
    price: "40 000",
    unit: "à partir de",
    features: ["20–40 pages", "Sources citées", "Livré sous 7 jours", "Révisions incluses"],
  },
  {
    title: "Mémoire de licence",
    price: "75 000",
    unit: "à partir de",
    features: ["40–60 pages", "Normes APA / CAMES", "Livré sous 14 jours", "2 révisions"],
    featured: true,
  },
  {
    title: "Mémoire de master",
    price: "150 000",
    unit: "à partir de",
    features: ["60–100 pages", "Méthodologie & analyse empirique", "Livré sous 21 jours", "3 révisions"],
  },
  {
    title: "Thèse & Correction approfondie",
    price: "15 000",
    unit: "à partir de",
    features: ["Orthographe & style académique", "Cohérence du plan", "Livré sous 5 jours", "Rapport détaillé"],
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md igloo-glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <a href="#" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="font-serif text-xl font-bold text-primary">MémoirePro Gabon</span>
          </a>
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <a href="#tarifs" className="hover:text-foreground transition-colors">Tarifs</a>
            <a href="#garanties" className="hover:text-foreground transition-colors">Garanties</a>
            <Link to="/client" className="hover:text-foreground transition-colors">Espace Client</Link>
            <Link to="/redacteur" className="hover:text-foreground transition-colors">Espace Rédacteur</Link>
            <Link to="/admin" className="inline-flex items-center gap-1 text-primary font-medium hover:underline">
              <ShieldAlert className="h-3.5 w-3.5" />
              Admin
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <AuthButton />
            <Button asChild size="sm" className="igloo-spring-btn">
              <a href="#commander">Commander</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section (Photo supprimée et remplacée par la carte interactive 3D Pôle Gabon) */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-primary igloo-float">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-spin-slow" />
              Accompagnement Académique au Gabon · PWA Active
            </span>
            <h1 className="mt-5 font-serif text-4xl leading-tight text-primary sm:text-5xl md:text-6xl">
              Votre mémoire au Gabon, rédigé avec rigueur et sans plagiat.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Service personnalisé pour vos mémoires de licence, master, thèses et rapports de stage
              conformes aux exigences des universités et instituts gabonais (UOB, USTM, INSG, USS).
              Tarifs transparents en Franc CFA (XAF), paiement Mobile Money (Airtel & Moov).
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="igloo-spring-btn shadow-md">
                <a href="#commander">
                  Commander maintenant
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="igloo-spring-btn">
                <a href="#tarifs">Voir les tarifs</a>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Garantie Anti-plagiat Turnitin certifiée
              </span>
              <span className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Paiement Airtel Money & Moov Money
              </span>
            </div>
          </div>

          {/* Carte 3D Interactive Pôle Gabon (Substitut moderne à la photo de stock) */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-gold/20 via-transparent to-primary/10 blur-2xl pointer-events-none" />
            <TiltCard maxTilt={6} className="rounded-2xl border border-border/80 bg-card/90 p-8 shadow-[var(--shadow-elegant)] igloo-glass">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-serif font-bold text-lg shadow-md">
                    GA
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      Pôle Académique Gabon
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" /> Libreville · Port-Gentil · Franceville
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 igloo-pulse-dot" />
                  Service Actif
                </span>
              </div>

              <div className="mt-6 space-y-4 text-xs">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-1">
                  <span className="font-bold text-foreground text-sm block flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Établissements d'Enseignement Supérieur
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Université Omar Bongo (UOB), USTM Masuku, INSG, USS, IST et instituts supérieurs de Libreville.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1">
                    <span className="font-bold text-primary block flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5" /> Paiement Gabon
                    </span>
                    <p className="text-muted-foreground text-[11px]">
                      Airtel Money Gabon, Moov Money Gabon Telecom & Virement BGFI
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-1">
                    <span className="font-bold text-emerald-700 block flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5" /> Confidentialité
                    </span>
                    <p className="text-muted-foreground text-[11px]">
                      Protection absolue des données et anonymat garanti
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <FileCheck2 className="h-4 w-4 text-primary" />
                    Normes CAMES & APA 7e respectées
                  </span>
                  <span className="font-semibold text-primary">Tarifs en FCFA (XAF)</span>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Garanties */}
      <section id="garanties" className="border-y border-border/60 bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-primary sm:text-4xl">
              Trois engagements qui font la différence
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Rédaction 100% personnalisée",
                text: "Chaque mémoire est rédigé sur mesure, en respectant scrupuleusement les consignes de votre établissement gabonais et le style de votre directeur de recherche.",
              },
              {
                icon: FileCheck2,
                title: "Sources citées avec rigueur",
                text: "Toutes les sources sont référencées selon les normes académiques (APA, Harvard, CAMES). Bibliographie complète, vérifiable et fournie systématiquement.",
              },
              {
                icon: ShieldCheck,
                title: "Garantie anti-plagiat absolue",
                text: "Chaque document passe un contrôle certifié Turnitin avant livraison. Rapport de similarité fourni. En cas de non-conformité, remboursement intégral.",
              },
            ].map((g) => (
              <TiltCard
                key={g.title}
                maxTilt={6}
                className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] igloo-glass"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <g.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-xl text-foreground">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.text}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-primary sm:text-4xl">
              Tarifs clairs, en Franc CFA (XAF)
            </h2>
            <p className="mt-4 text-muted-foreground">
              Devis final ajusté selon le nombre de pages, la complexité et le délai. Aucun frais caché.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pricing.map((p) => (
              <TiltCard
                key={p.title}
                maxTilt={7}
                className={`relative rounded-xl border p-6 transition igloo-glass ${
                  p.featured
                    ? "border-gold bg-card shadow-[var(--shadow-elegant)] ring-1 ring-gold/40"
                    : "border-border bg-card shadow-[var(--shadow-soft)]"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-gold-foreground shadow-sm">
                    Le plus demandé
                  </span>
                )}
                <h3 className="font-serif text-xl text-foreground">{p.title}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-xs text-muted-foreground">{p.unit}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-4xl font-semibold text-primary">{p.price}</span>
                  <span className="text-sm font-medium text-muted-foreground">FCFA</span>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <FileCheck2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Commander (Section épurée, centrée, conforme pour le Gabon) */}
      <section id="commander" className="py-16 md:py-24 border-t border-border/60">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary mb-2">
              Formulaire officiel
            </span>
            <h2 className="font-serif text-3xl text-primary sm:text-4xl">
              Passez votre commande de rédaction au Gabon
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Renseignez les critères de votre travail académique, joignez vos consignes et obtenez
              votre devis instantané en FCFA. Règlement sécurisé via Airtel Money ou Moov Money.
            </p>
          </div>

          <OrderForm />
        </div>
      </section>

      {/* Footer (Localisé au Gabon) */}
      <footer className="border-t border-border bg-primary py-12 text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-serif text-lg font-semibold">MémoirePro Gabon</span>
            </div>
            <p className="mt-3 text-sm opacity-80">
              Service professionnel d'accompagnement académique et de rédaction pour étudiants et chercheurs au Gabon.
            </p>
            <p className="mt-2 text-xs opacity-70">
              Libreville · Port-Gentil · Franceville
            </p>
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider opacity-90">
              Contact & Assistance Gabon
            </h4>
            <ul className="mt-3 space-y-2 text-sm opacity-80">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>WhatsApp Gabon :</span>
                <a href="tel:+24174000000" className="hover:underline font-mono">
                  +241 74 00 00 00
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> contact@memoirepro.ga
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider opacity-90">
              Confidentialité & Rigueur
            </h4>
            <p className="mt-3 text-sm opacity-80">
              Vos documents, thèmes et données personnelles restent strictement confidentiels et ne sont jamais divulgués.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-primary-foreground/20 px-4 pt-6 text-center text-xs opacity-70">
          © 2026 MémoirePro Gabon. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
