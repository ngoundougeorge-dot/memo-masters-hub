import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BookOpen, CheckCircle2, FileSearch, Search, ShieldCheck, Clock, AlertCircle, Loader2 } from "lucide-react";
import { AcademicCertificate } from "@/components/AcademicCertificate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchFirebaseOrder } from "@/integrations/firebase";
import { getProjectData, type ProjectDetails } from "@/lib/projectStore";

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

function CertificatVerificationPage() {
  const search = Route.useSearch();
  const [queryInput, setQueryInput] = useState(search.id || "");
  const [activeCertId, setActiveCertId] = useState(search.id || "");
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(Boolean(search.id));

  useEffect(() => {
    if (!activeCertId.trim()) {
      setProject(null);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    const cleanId = activeCertId.trim().replace(/^CERT-GA-2026-/, "").toUpperCase();

    // 1. Recherche dans le magasin local
    const local = getProjectData(cleanId);
    if (local && local.clientName && local.clientName !== "Étudiant(e)") {
      setProject(local);
      setLoading(false);
      return;
    }

    // 2. Recherche dans Cloud Firestore (production)
    fetchFirebaseOrder(cleanId)
      .then((fb) => {
        if (fb) {
          const loaded: ProjectDetails = {
            id: fb.id.startsWith("PRJ-") ? fb.id : `PRJ-2026-${cleanId.slice(0, 6)}`,
            orderId: fb.orderId || cleanId,
            userId: fb.userId,
            clientName: fb.clientName || "Étudiant(e)",
            clientEmail: fb.clientEmail || "",
            clientPhone: fb.clientPhone || "",
            subject: fb.subject || "Mémoire Académique",
            documentType: fb.documentType || "memoire_master",
            academicLevel: fb.academicLevel || "Enseignement Supérieur Gabon",
            pages: fb.pages || 60,
            objective: fb.instructions || "",
            means: "Audit anti-plagiat Turnitin et conformité CAMES.",
            deadline: fb.createdAt?.toDate ? fb.createdAt.toDate().toISOString() : (fb.createdAt || new Date().toISOString()),
            priceFcfa: fb.priceFcfa || 75000,
            paymentMethod: fb.paymentMethod || "Airtel Money Gabon",
            paymentConfirmed: fb.paymentConfirmed || fb.status === "en_cours" || fb.status === "terminé",
            isCompleted: fb.status === "terminé" || fb.status === "envoyé",
            finalReportReady: fb.status === "terminé" || fb.status === "envoyé",
            hasPlan: false,
            hasGuidelines: false,
            hasCoverPage: false,
            milestones: [],
            messages: [],
          };
          setProject(loaded);
        } else {
          setProject(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setProject(null);
        setLoading(false);
      });
  }, [activeCertId]);

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

          {/* Chargement */}
          {loading && (
            <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Interrogation du registre officiel...</span>
            </div>
          )}

          {/* Résultat : Aucun document trouvé */}
          {!loading && searched && !project && (
            <Card className="border-destructive/30 bg-destructive/5 p-6 text-center shadow-sm">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-2" />
              <h3 className="font-serif text-lg font-bold text-foreground">
                Certificat introuvable
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                Aucun document certifié ne correspond à la référence « <strong className="font-mono text-foreground">{activeCertId}</strong> » dans le registre officiel de vérification. Vérifiez le code inscrit sur le manuscrit.
              </p>
            </Card>
          )}

          {/* Résultat : Projet trouvé mais pas encore terminé */}
          {!loading && searched && project && !project.isCompleted && (
            <Card className="border-amber-500/30 bg-amber-500/10 p-6 text-center shadow-sm">
              <Clock className="mx-auto h-10 w-10 text-amber-600 mb-2" />
              <h3 className="font-serif text-lg font-bold text-foreground">
                Projet en cours de rédaction
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                Le document « <strong className="text-foreground">{project.subject}</strong> » (Réf: {project.id}) est actuellement en cours de rédaction par nos équipes académiques. Le certificat officiel anti-plagiat sera validé et délivré dès l'achèvement complet du travail.
              </p>
            </Card>
          )}

          {/* Résultat : Projet terminé & certifié */}
          {!loading && searched && project && project.isCompleted && (
            <AcademicCertificate
              orderId={project.id}
              projectSubject={project.subject}
              academicLevel={project.academicLevel || "Enseignement Supérieur Gabon"}
              studentName={project.clientName || "Candidat(e) Certifié(e)"}
              completionDate={new Date(project.deadline).toLocaleDateString("fr-FR", { dateStyle: "long" })}
              isStandalone={true}
            />
          )}

          {/* État initial : Pas encore de recherche */}
          {!searched && !loading && (
            <Card className="border-border/60 bg-muted/20 p-8 text-center shadow-xs">
              <ShieldCheck className="mx-auto h-10 w-10 text-primary/70 mb-2" />
              <h3 className="font-serif text-base font-bold text-foreground">
                Entrez une référence officielle pour vérifier l'authenticité
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                Le certificat garantit un taux anti-plagiat inférieur à 5%, la conformité aux exigences CAMES et la validité académique du mémoire.
              </p>
            </Card>
          )}

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
