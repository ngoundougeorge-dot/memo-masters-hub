import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BookOpen, CheckCircle2, FileSearch, Search, ShieldCheck } from "lucide-react";
import { AcademicCertificate } from "@/components/AcademicCertificate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CertificatSearch = {
  id?: string;
};

export const Route = createFileRoute("/certificat")({
  validateSearch: (search: Record<string, unknown>): CertificatSearch => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Vérification Officielle de Certificat — MémoirePro Gabon" },
      {
        name: "description",
        content:
          "Vérifiez l'authenticité et le score anti-plagiat Turnitin d'un mémoire ou travail académique certifié par MémoirePro Gabon.",
      },
      { property: "og:title", content: "Vérification de Certificat Académique" },
    ],
  }),
  component: CertificatVerificationPage,
});

const DEMO_CERTIFICATES: Record<
  string,
  { subject: string; level: string; student: string; date: string }
> = {
  "CERT-GA-2026-8A3F": {
    subject: "L'impact du mobile money (Airtel & Moov) sur l'inclusion financière des PME au Gabon",
    level: "Université Omar Bongo (UOB Libreville) — Master 2 Finance & Banque",
    student: "Grace Mba",
    date: "14 Septembre 2026",
  },
  "CERT-GA-2026-3B9C": {
    subject: "Audit de la conformité RSE des entreprises de transformation du bois au Gabon",
    level: "Institut National des Sciences de Gestion (INSG Libreville) — Master 1 Management",
    student: "Nadège Biyogo",
    date: "10 Septembre 2026",
  },
  "CERT-GA-2026-ORD-DEMO-01": {
    subject: "L'impact du mobile money (Airtel & Moov) sur l'inclusion financière des PME au Gabon",
    level: "Université Omar Bongo (UOB Libreville) — Master 2 Finance & Banque",
    student: "Grace Mba",
    date: "14 Septembre 2026",
  },
};

function CertificatVerificationPage() {
  const search = Route.useSearch();
  const [queryInput, setQueryInput] = useState(search.id || "CERT-GA-2026-8A3F");
  const [activeCertId, setActiveCertId] = useState(search.id || "CERT-GA-2026-8A3F");

  const normalizedId = activeCertId.trim().toUpperCase();
  const certData = DEMO_CERTIFICATES[normalizedId] || {
    subject: "Recherche académique appliquée & Mémoire universitaire certifié",
    level: "Enseignement Supérieur Gabon — Grade Master / CAMES",
    student: "Candidat(e) Certifié(e)",
    date: "Septembre 2026",
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      setActiveCertId(queryInput.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-40 print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="font-serif text-xl font-semibold tracking-tight text-primary">
              MémoirePro Gabon
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/client">
              <Button size="sm" variant="outline" className="text-xs">
                Espace Client
              </Button>
            </Link>
            <Link to="/">
              <Button size="sm" className="text-xs bg-primary text-primary-foreground">
                Nouvelle Commande
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 sm:py-12 px-4">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Section d'accueil & recherche (masquée à l'impression) */}
          <div className="text-center space-y-3 print:hidden">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-mono text-xs gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              Registre Officiel de Vérification d'Authenticité
            </Badge>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Vérifier un Certificat Académique
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Saisissez le numéro d'attestation ou le code d'intégrité figurant sur le manuscrit pour attester de son originalité, de son taux anti-plagiat certifié et de sa conformité CAMES.
            </p>

            {/* Formulaire de recherche */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto flex items-center gap-2 pt-2">
              <div className="relative flex-1">
                <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Ex : CERT-GA-2026-8A3F"
                  className="pl-9 font-mono text-sm uppercase"
                />
              </div>
              <Button type="submit" className="gap-1.5 shrink-0 bg-primary text-primary-foreground">
                <Search className="h-4 w-4" />
                <span>Vérifier</span>
              </Button>
            </form>
          </div>

          {/* Rendu du Certificat Officiel */}
          <AcademicCertificate
            orderId={normalizedId}
            projectSubject={certData.subject}
            academicLevel={certData.level}
            studentName={certData.student}
            completionDate={certData.date}
            isStandalone={true}
          />

          {/* Note explicative pour les Jurys et Enseignants (masquée à l'impression) */}
          <Card className="border-border/60 bg-muted/30 print:hidden">
            <CardContent className="p-4 sm:p-6 space-y-2 text-xs text-muted-foreground leading-relaxed">
              <h4 className="font-serif font-semibold text-foreground text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" />
                Notice à destination des Jurys de Soutenance & Établissements
              </h4>
              <p>
                Ce certificat garantit que le document a fait l'objet d'un double contrôle rigoureux au moyen des logiciels agréés Turnitin et Compilatio Magister. Le seuil de similarité contractuel inférieur à 5% atteste de l'originalité des analyses et du respect rigoureux des normes de citation scientifique préconisées par le Conseil Africain et Malgache pour l'Enseignement Supérieur (CAMES).
              </p>
              <p className="pt-1">
                Pour toute réquisition d'audit approfondi ou transmission du rapport brut de scan Turnitin, contactez le comité déontologique à : <strong className="text-foreground font-mono">audit@memoirepro.ga</strong>.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground print:hidden">
        © 2026 MémoirePro Gabon · Direction des Affaires Académiques & du Contrôle Anti-Plagiat · Libreville
      </footer>
    </div>
  );
}
