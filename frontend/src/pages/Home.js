import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen, ShieldCheck, Quote, FileCheck2, Sparkles, Star, Phone, Mail, ChevronRight,
  PenLine, Bot, LayoutDashboard, LogIn,
} from "lucide-react";
import heroImg from "../assets/hero-thesis.jpg";
import { Button } from "../components/ui";
import OrderForm from "../components/OrderForm";
import { useAuth } from "../context/AuthContext";

const pricing = [
  { title: "Rapport de stage", price: "40 000", unit: "à partir de", features: ["20–40 pages", "Sources citées", "Livré sous 7 jours", "Révisions incluses"] },
  { title: "Mémoire de licence", price: "75 000", unit: "à partir de", features: ["40–60 pages", "Bibliographie APA/Harvard", "Livré sous 14 jours", "2 révisions"], featured: true },
  { title: "Mémoire de master", price: "150 000", unit: "à partir de", features: ["60–100 pages", "Méthodologie & analyse", "Livré sous 21 jours", "3 révisions"] },
  { title: "Correction & relecture", price: "15 000", unit: "à partir de", features: ["Orthographe & style", "Cohérence du plan", "Livré sous 5 jours", "Rapport détaillé"] },
];

const testimonials = [
  { name: "Aminata K.", school: "Université Cheikh Anta Diop, Dakar", grade: "17/20", text: "J'ai eu la mention Très Bien pour mon mémoire de master. Le rédacteur a parfaitement respecté les consignes de mon directeur, avec des sources solides." },
  { name: "Jean-Pierre O.", school: "Université Félix Houphouët-Boigny, Abidjan", grade: "16/20", text: "Rapport de stage livré à temps, structure impeccable. Mon maître de stage a été très satisfait de la qualité rédactionnelle." },
  { name: "Fatoumata D.", school: "Université de Ouagadougou", grade: "15/20", text: "Zéro plagiat détecté, tout est cité correctement. La messagerie m'a permis de suivre l'avancement de A à Z. Je recommande vivement." },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2" data-testid="brand-logo">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="font-serif text-xl font-semibold text-primary">MémoirePro</span>
          </Link>
          <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
            <a href="#tarifs" className="hover:text-foreground">Tarifs</a>
            <a href="#assistant" className="hover:text-foreground">Assistant IA</a>
            <a href="#garanties" className="hover:text-foreground">Garanties</a>
            <a href="#avis" className="hover:text-foreground">Avis</a>
            <a href="#commander" className="hover:text-foreground">Commander</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" data-testid="nav-editor" onClick={() => navigate("/editeur")}>
                  <PenLine className="h-4 w-4" /> Éditeur IA
                </Button>
                <Button variant="outline" size="sm" data-testid="nav-client" onClick={() => navigate("/client")}>
                  <LayoutDashboard className="h-4 w-4" /> Espace
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" data-testid="nav-login" onClick={() => navigate("/connexion")}>
                <LogIn className="h-4 w-4" /> Connexion
              </Button>
            )}
            <Button as="a" href="#commander" size="sm" data-testid="nav-order">Commander</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Rédaction académique certifiée
            </span>
            <h1 className="mt-5 font-serif text-4xl leading-tight text-primary sm:text-5xl md:text-6xl">
              Votre mémoire, rédigé avec la rigueur qu'il mérite.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Un service de rédaction personnalisée pour vos mémoires de licence, master et rapports de
              stage. Sources correctement citées, garantie anti-plagiat, et désormais un assistant IA
              pour rédiger plus vite. Tarifs transparents en Franc CFA.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as="a" href="#commander" size="lg" data-testid="hero-order-btn">
                Commander maintenant <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button as="a" href="#assistant" variant="outline" size="lg" data-testid="hero-ai-btn">
                Essayer l'assistant IA
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 text-gold">
                {[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-current" />))}
              </div>
              <span>+ de 250 étudiants satisfaits</span>
            </div>
          </div>
          <div className="relative animate-fade-in">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-gold/20 via-transparent to-primary/10 blur-2xl" />
            <img src={heroImg} alt="Mémoire académique relié" className="relative rounded-2xl shadow-[var(--shadow-elegant)]" />
          </div>
        </div>
      </section>

      {/* Garanties */}
      <section id="garanties" className="border-y border-border/60 bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-primary sm:text-4xl">Trois engagements qui font la différence</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Sparkles, title: "Rédaction 100% personnalisée", text: "Chaque mémoire est rédigé sur mesure, en respectant scrupuleusement les consignes de votre établissement et le style de votre directeur de recherche." },
              { icon: FileCheck2, title: "Sources citées avec rigueur", text: "Toutes nos sources sont référencées en APA, Harvard ou selon la norme demandée. Bibliographie complète et vérifiable fournie systématiquement." },
              { icon: ShieldCheck, title: "Garantie anti-plagiat", text: "Chaque document passe un contrôle de similarité avant livraison. Rapport fourni. En cas de détection, remboursement intégral." },
            ].map((g) => (
              <div key={g.title} className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><g.icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-serif text-xl text-foreground">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assistant IA */}
      <section id="assistant" className="py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-primary">
              <Bot className="h-3.5 w-3.5" /> Nouveau — propulsé par l'IA
            </span>
            <h2 className="mt-5 font-serif text-3xl text-primary sm:text-4xl">Un assistant de rédaction dans votre poche</h2>
            <p className="mt-4 text-muted-foreground">
              Créez votre compte et accédez à un éditeur en ligne avec un assistant IA académique :
              générez un plan, développez vos idées, améliorez votre style et obtenez des pistes de
              problématique — le tout en français.
            </p>
            <ul className="mt-6 space-y-3">
              {["Génération de plan détaillé et de problématique", "Amélioration du style et correction en un clic", "Développement de vos paragraphes", "Sauvegarde automatique de vos documents"].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <FileCheck2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" data-testid="ai-cta-btn" onClick={() => navigate(user ? "/editeur" : "/inscription")}>
                <PenLine className="h-4 w-4" /> {user ? "Ouvrir l'éditeur IA" : "Créer un compte gratuit"}
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)]">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-serif text-lg text-foreground">Assistant MémoirePro</span>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-primary-foreground">
                Propose-moi un plan pour un mémoire sur l'inclusion financière.
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-2 text-secondary-foreground">
                Introduction · Partie I : Cadre conceptuel · Partie II : Méthodologie · Partie III :
                Analyse des résultats · Conclusion et recommandations…
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="border-y border-border/60 bg-secondary/40 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-primary sm:text-4xl">Tarifs clairs, en Franc CFA</h2>
            <p className="mt-4 text-muted-foreground">Devis final ajusté selon la longueur, la complexité et le délai. Aucun frais caché.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pricing.map((p) => (
              <div key={p.title} className={`relative rounded-xl border p-6 transition hover:-translate-y-1 ${p.featured ? "border-gold bg-card shadow-[var(--shadow-elegant)]" : "border-border bg-card shadow-[var(--shadow-soft)]"}`}>
                {p.featured && (<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-gold-foreground">Le plus demandé</span>)}
                <h3 className="font-serif text-xl text-foreground">{p.title}</h3>
                <div className="mt-3 text-xs text-muted-foreground">{p.unit}</div>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-4xl font-semibold text-primary">{p.price}</span>
                  <span className="text-sm font-medium text-muted-foreground">FCFA</span>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  {p.features.map((f) => (<li key={f} className="flex items-start gap-2"><FileCheck2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>{f}</span></li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avis */}
      <section id="avis" className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-primary sm:text-4xl">Ils ont obtenu leur diplôme avec mention</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                <Quote className="h-6 w-6 text-gold" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">« {t.text} »</blockquote>
                <figcaption className="mt-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.school}</div>
                    </div>
                    <span className="rounded-md bg-primary/10 px-2 py-1 font-serif text-sm font-semibold text-primary">{t.grade}</span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Commander */}
      <section id="commander" className="border-t border-border/60 bg-secondary/40 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="font-serif text-3xl text-primary sm:text-4xl">Passez votre commande en 3 minutes</h2>
            <p className="mt-4 text-muted-foreground">
              Décrivez votre sujet, joignez les consignes de votre établissement, choisissez votre mode
              de paiement Mobile Money. Nous vous contactons sous 24h.
            </p>
            <ol className="mt-8 space-y-4">
              {["Remplissez le formulaire et joignez vos documents.", "Recevez le devis final et les instructions de paiement par WhatsApp.", "Le rédacteur démarre dès réception du paiement.", "Livraison + rapport anti-plagiat à la date convenue."].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary font-serif text-sm font-semibold text-primary-foreground">{i + 1}</span>
                  <span className="text-sm text-foreground">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Orange Money", "MTN MoMo", "Wave", "Moov Money"].map((m) => (
                <span key={m} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground">{m}</span>
              ))}
            </div>
          </div>
          <OrderForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-primary py-12 text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2"><BookOpen className="h-5 w-5" /><span className="font-serif text-lg font-semibold">MémoirePro</span></div>
            <p className="mt-3 text-sm opacity-80">Rédaction académique personnalisée pour étudiants d'Afrique francophone.</p>
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider opacity-90">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm opacity-80">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>WhatsApp :</span><a href="tel:+2250700000000" className="hover:underline">+225 07 00 00 00 00</a></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contact@memoirepro.africa</li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider opacity-90">Confidentialité</h4>
            <p className="mt-3 text-sm opacity-80">Vos documents et informations restent strictement confidentiels et ne sont jamais partagés.</p>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-primary-foreground/20 px-4 pt-6 text-center text-xs opacity-70">© 2026 MémoirePro. Tous droits réservés.</div>
      </footer>
    </div>
  );
}
