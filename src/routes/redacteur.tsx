import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  FileCheck2,
  FileText,
  Lock,
  Mail,
  MessageSquare,
  Paperclip,
  PenTool,
  Phone,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Target,
  User,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TiltCard } from "@/components/TiltCard";
import { RoleGuard } from "@/components/RoleGuard";
import { supabase } from "@/integrations/supabase/client";
import {
  getProjectData,
  saveProjectData,
  getAllProjects,
  setProjectPaymentConfirmed,
  setProjectCompleted,
  addProjectMessage,
  addNewMilestone,
  type ProjectDetails,
  type Milestone,
} from "@/lib/projectStore";

type Search = { key?: string };

export const Route = createFileRoute("/redacteur")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): Search => ({
    key: typeof s.key === "string" ? s.key : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Espace Administration & Rédaction — MémoirePro Gabon" },
      {
        name: "description",
        content:
          "Tableau de bord administrateur & rédacteur pour le pilotage des projets de mémoires au Gabon.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WriterDashboard,
});

// Projets de démonstration initiaux au Gabon
const INITIAL_WRITER_ORDERS: ProjectDetails[] = [
  {
    id: "PRJ-2026-8A3F",
    orderId: "ord-demo-01",
    clientName: "Grace Mba",
    clientEmail: "grace.mba@uob.ga",
    clientPhone: "+241 66 54 32 10",
    subject: "L'impact du mobile money (Airtel & Moov) sur l'inclusion financière des PME au Gabon",
    documentType: "memoire_master",
    academicLevel: "Université Omar Bongo (UOB Libreville) — Master 2 Finance & Banque",
    pages: 70,
    objective:
      "Rédaction complète d'un mémoire de 70 pages avec cadrage théorique, démarche empirique et recommandations adaptées au tissu économique gabonais.",
    means:
      "Revue de littérature universitaire (Cairn, JSTOR, revues CAMES), Rédacteur Senior dédié et analyse statistique.",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    priceFcfa: 150000,
    paymentMethod: "Airtel Money Gabon",
    paymentConfirmed: true,
    isCompleted: false,
    finalReportReady: false,
    hasPlan: true,
    planText:
      "Introduction Générale & Problématique\nPartie 1 : Cadre théorique et revue documentaire de l'intermédiation financière\n  Chapitre 1 : Les modèles de mobile money en zone CEMAC\n  Chapitre 2 : L'environnement réglementaire BEAC/COBAC au Gabon\nPartie 2 : Démarche empirique et résultats\n  Chapitre 3 : Étude de cas sur 50 PME gabonaises (Libreville & Port-Gentil)\n  Chapitre 4 : Analyse critique et recommandations stratégiques\nConclusion Générale & Bibliographie CAMES",
    hasGuidelines: true,
    guidelinesText:
      "Normes APA 7e édition, police Times New Roman 12, interligne 1.5, marges 2.5 cm. Données collectées auprès des commerces de Libreville et Port-Gentil. Validation du plan par le directeur de mémoire requise.",
    hasCoverPage: true,
    coverPageText:
      "Logo UOB, Faculté de Droit et des Sciences Économiques (FDSE Libreville), Sous la direction du Pr. Nguema. Année académique 2025-2026.",
    filePaths: ["consignes_uob_fdse.pdf", "questionnaire_pme_libreville.docx"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    milestones: [
      {
        id: "ms-1",
        orderId: "ord-demo-01",
        stepNumber: 1,
        title: "Jalon 1 : Cadrage, Problématique & Plan détaillé",
        contentPreview:
          "Problématique validée : Dans quelle mesure les solutions de paiement mobile favorisent-elles la résilience financière des PME informelles au Gabon ?",
        status: "valide",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        writerNotes: "Plan aligné sur les exigences académiques de l'UOB et les normes CAMES.",
      },
      {
        id: "ms-2",
        orderId: "ord-demo-01",
        stepNumber: 2,
        title: "Jalon 2 : Revue de Littérature & Cadre Conceptuel",
        contentPreview:
          "Analyse comparée des théories de l'intermédiation financière et de l'inclusion numérique en zone CEMAC (BEAC, COBAC).",
        status: "soumis",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        writerNotes: "Prêt pour consultation par l'étudiant.",
      },
      {
        id: "ms-3",
        orderId: "ord-demo-01",
        stepNumber: 3,
        title: "Jalon 3 : Analyse des Données & Résultats Empiriques",
        contentPreview:
          "Traitement des questionnaires et analyse économétrique de l'accès au crédit court terme à Libreville.",
        status: "en_cours",
        writerNotes: "En cours de finalisation.",
      },
      {
        id: "ms-4",
        orderId: "ord-demo-01",
        stepNumber: 4,
        title: "Jalon 4 : Conclusion Générale & Recommandations",
        contentPreview:
          "Synthèse des apports, limites méthodologiques et recommandations pour les régulateurs gabonais.",
        status: "en_attente",
      },
    ],
    messages: [
      {
        id: "m-1",
        orderId: "ord-demo-01",
        sender: "client",
        senderName: "Grace Mba (Étudiante UOB)",
        content:
          "Bonjour Dr. Ondo, j'ai bien consulté le Jalon 1. Le plan me convient parfaitement, mon encadreur à l'UOB a validé les deux axes !",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
      {
        id: "m-2",
        orderId: "ord-demo-01",
        sender: "redacteur",
        senderName: "Dr. Stéphane Ondo (Rédacteur)",
        content:
          "Excellente nouvelle Grace ! Je viens de déposer le Jalon 2 (revue de littérature) dans votre espace pour consultation.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      },
    ],
  },
  {
    id: "PRJ-2026-3B9C",
    orderId: "ord-demo-02",
    clientName: "Nadège Biyogo",
    clientEmail: "nadege.biyogo@insg.ga",
    clientPhone: "+241 77 88 99 00",
    subject: "Audit de la conformité RSE des entreprises de transformation du bois au Gabon",
    documentType: "rapport_stage",
    academicLevel: "Institut National des Sciences de Gestion (INSG Libreville) — Master 1 Management",
    pages: 45,
    objective:
      "Rapport de stage de 45 pages évaluant l'impact environnemental et sociétal des exploitants de la zone économique de Nkok.",
    means:
      "Guides RSE ISO 26000, Rapports sectoriels Gabon, revues scientifiques et Rédacteur Senior.",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    priceFcfa: 40000,
    paymentMethod: "Moov Money (Gabon Telecom)",
    paymentConfirmed: false,
    isCompleted: false,
    finalReportReady: false,
    hasPlan: true,
    planText:
      "Partie 1 : Présentation de l'entreprise et diagnostic RSE\nPartie 2 : Analyse des impacts environnementaux et recommandations",
    hasGuidelines: true,
    guidelinesText: "Normes académiques INSG Libreville, interligne 1.5, 45 pages maximum.",
    hasCoverPage: true,
    coverPageText:
      "INSG Libreville — Master 1 Management des Organisations. Encadreur en entreprise : M. Obiang.",
    filePaths: ["grille_evaluation_rse.xlsx"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    milestones: [
      {
        id: "ms-2-1",
        orderId: "ord-demo-02",
        stepNumber: 1,
        title: "Jalon 1 : Présentation de l'entreprise & Diagnostic RSE",
        contentPreview:
          "Présentation des activités, cartographie des parties prenantes et grille d'évaluation sectorielle Gabon.",
        status: "en_attente",
      },
    ],
    messages: [],
  },
];

function WriterDashboard() {
  const [projects, setProjects] = useState<ProjectDetails[]>(INITIAL_WRITER_ORDERS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(INITIAL_WRITER_ORDERS[0].orderId);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState<string>("");
  const [newMilestonePreview, setNewMilestonePreview] = useState<string>("");
  const [newMilestoneNotes, setNewMilestoneNotes] = useState<string>("");
  const [showMilestoneModal, setShowMilestoneModal] = useState<boolean>(false);
  const [loadingRemote, setLoadingRemote] = useState<boolean>(false);

  // Active project
  const activeProject = useMemo(() => {
    return projects.find((p) => p.orderId === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  // Synchronisation des Projets (LocalStore + Supabase)
  const syncProjects = async () => {
    setLoadingRemote(true);
    const map = new Map<string, ProjectDetails>();

    // 1. Initialiser avec les démos par défaut
    INITIAL_WRITER_ORDERS.forEach((p) => map.set(p.orderId, p));

    // 2. Charger tous les projets créés localement (localStorage)
    const localProjects = getAllProjects();
    localProjects.forEach((p) => map.set(p.orderId, p));

    // 3. Charger les commandes distantes Supabase si disponibles
    try {
      const { data: remoteOrders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (remoteOrders && remoteOrders.length > 0) {
        remoteOrders.forEach((row: any) => {
          if (!map.has(row.id)) {
            // Parser les instructions si formatées en JSON
            let parsedGuidelines = row.instructions || "Consignes transmises par le client";
            let parsedPlan = "";
            let parsedCover = "";
            try {
              if (row.instructions && row.instructions.startsWith("{")) {
                const parsed = JSON.parse(row.instructions);
                parsedGuidelines = parsed.guidelines || "";
                parsedPlan = parsed.plan_text || "";
                parsedCover = parsed.cover_page_text || "";
              }
            } catch {}

            const p: ProjectDetails = {
              id: `PRJ-2026-${row.id.slice(0, 6).toUpperCase()}`,
              orderId: row.id,
              clientName: row.full_name || "Étudiant Référent",
              clientEmail: row.email || "",
              clientPhone: row.phone || "",
              subject: row.subject || "Mémoire Académique",
              documentType: row.document_type || "memoire_master",
              academicLevel: row.academic_level || "Université Omar Bongo — Master 2",
              pages: row.pages || 60,
              objective: `Rédaction complète (${row.pages || 60} pages) selon les exigences académiques CAMES.`,
              means:
                "Documentation scientifique spécialisée, Rédacteur Senior dédié et contrôle anti-plagiat Turnitin.",
              deadline: row.deadline || new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
              priceFcfa: row.price_fcfa || 150000,
              paymentMethod: row.payment_method || "Airtel Money Gabon",
              paymentConfirmed:
                row.status === "paiement_recu" || row.status === "en_cours" || row.status === "livre",
              isCompleted: row.status === "livre",
              finalReportReady: row.status === "livre",
              hasPlan: Boolean(parsedPlan),
              planText: parsedPlan,
              hasGuidelines: Boolean(parsedGuidelines),
              guidelinesText: parsedGuidelines,
              hasCoverPage: Boolean(parsedCover),
              coverPageText: parsedCover,
              filePaths: (row.file_paths as string[]) || [],
              createdAt: row.created_at,
              milestones: [
                {
                  id: `ms-${row.id}-1`,
                  orderId: row.id,
                  stepNumber: 1,
                  title: "Jalon 1 : Cadrage, Problématique & Plan détaillé",
                  contentPreview: "Validation de la problématique et de la structure du plan.",
                  status:
                    row.status === "nouveau" ? "en_attente" : "soumis",
                  submittedAt: row.created_at,
                },
              ],
              messages: [],
            };
            map.set(row.id, p);
            saveProjectData(p);
          }
        });
      }
    } catch (err) {
      console.warn("[WriterDashboard] Erreur récupération Supabase:", err);
    } finally {
      setLoadingRemote(false);
    }

    const merged = Array.from(map.values());
    setProjects(merged);

    // Si le projet sélectionné n'existe pas, sélectionner le premier
    if (!merged.some((p) => p.orderId === selectedProjectId) && merged.length > 0) {
      setSelectedProjectId(merged[0].orderId);
    }
  };

  useEffect(() => {
    syncProjects();
  }, []);

  // Action: Basculer le Paiement Reçu (Déclenche le passage en "Rédaction en cours" et débloque les jalons)
  const handleTogglePayment = (orderId: string) => {
    const proj = projects.find((p) => p.orderId === orderId);
    if (!proj) return;

    const nextState = !proj.paymentConfirmed;
    const updated = setProjectPaymentConfirmed(orderId, nextState);

    setProjects((prev) => prev.map((p) => (p.orderId === orderId ? { ...updated } : p)));

    if (nextState) {
      toast.success(`Paiement validé pour le projet ${proj.id} !`, {
        description: "Statut basculé en « Mémoire en cours de rédaction ». Les jalons sont accessibles au client.",
        icon: <CreditCard className="h-4 w-4 text-emerald-600" />,
      });
    } else {
      toast.info(`Paiement repassé en attente pour le projet ${proj.id}.`);
    }
  };

  // Action: Basculer Mémoire Terminé & Envoyé (Débloque le téléchargement client et le certificat)
  const handleToggleCompleted = (orderId: string) => {
    const proj = projects.find((p) => p.orderId === orderId);
    if (!proj) return;

    const nextState = !proj.isCompleted;
    const updated = setProjectCompleted(orderId, nextState);

    setProjects((prev) => prev.map((p) => (p.orderId === orderId ? { ...updated } : p)));

    if (nextState) {
      toast.success(`Mémoire ${proj.id} marqué Terminé & Envoyé !`, {
        description: "Le client peut désormais télécharger son manuscrit (.DOCX) et son Certificat Anti-Plagiat.",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      });
    } else {
      toast.info(`Mémoire ${proj.id} repassé en cours de rédaction.`);
    }
  };

  // Action: Envoyer Message Interne au Client
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeProject) return;

    const updated = addProjectMessage(
      activeProject.orderId,
      "redacteur",
      "Dr. Stéphane Ondo (Rédacteur)",
      chatMessage.trim()
    );

    setProjects((prev) =>
      prev.map((p) => (p.orderId === activeProject.orderId ? { ...updated } : p))
    );
    setChatMessage("");
    toast.success("Message transmis à l'étudiant !");
  };

  // Action: Publier un nouveau Jalon
  const handleAddMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !newMilestonePreview.trim() || !activeProject) return;

    const updated = addNewMilestone(
      activeProject.orderId,
      newMilestoneTitle.trim(),
      newMilestonePreview.trim(),
      newMilestoneNotes.trim() || undefined
    );

    setProjects((prev) =>
      prev.map((p) => (p.orderId === activeProject.orderId ? { ...updated } : p))
    );

    setShowMilestoneModal(false);
    setNewMilestoneTitle("");
    setNewMilestonePreview("");
    setNewMilestoneNotes("");
    toast.success("Nouveau jalon publié et accessible au client en consultation !");
  };

  return (
    <RoleGuard
      allowedRoles={["redacteur", "admin"]}
      fallbackTitle="Console de Rédaction Académique"
      customMessage="L'accès à l'espace de rédaction et de suivi des manuscrits est strictement réservé aux Rédacteurs et aux Administrateurs."
    >
      <main className="min-h-screen bg-background pb-16">
      {/* Header Unifié Administration & Rédaction */}
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold text-primary">MémoirePro Gabon</span>
              <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-semibold">
                Administration & Rédaction
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="outline"
              onClick={syncProjects}
              disabled={loadingRemote}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingRemote ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>

            <Button asChild size="sm" variant="default" className="gap-1.5 h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold">
              <Link to="/admin">
                <Users className="h-3.5 w-3.5" />
                <span>Gestion Utilisateurs & Rôles</span>
              </Link>
            </Button>

            <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
              <Link to="/client" search={{ order_id: activeProject?.orderId }}>
                Vue Client
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 space-y-6">
        {/* En-tête de section */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Pilotage des Projets & Rédaction des Mémoires
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Toutes les informations, consignes, plans et fichiers transmis par les étudiants pour rédiger leurs mémoires.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 text-xs font-semibold">
              {projects.length} projet(s) enregistré(s)
            </Badge>
          </div>
        </div>

        {/* PIPELINE LINÉAIRE EN 5 ÉTAPES */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pipeline Officiel : De l'Inscription à la Livraison
            </h4>
            <Badge className="font-mono text-xs bg-primary text-primary-foreground">
              {activeProject.id}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
            {/* 1. Inscrit */}
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold">
              <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
              1. Inscrit
              <span className="block text-[10px] text-muted-foreground font-normal">Coordonnées client</span>
            </div>

            {/* 2. Envoyé & Reçu */}
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold">
              <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
              2. Envoyé & Reçu
              <span className="block text-[10px] text-muted-foreground font-normal">Consignes & fichiers</span>
            </div>

            {/* 3. Projet Créé */}
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold">
              <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
              3. Projet Créé
              <span className="block text-[10px] text-muted-foreground font-normal">Dossier ouvert</span>
            </div>

            {/* 4. Mémoire en cours de rédaction */}
            <div
              className={`p-2.5 rounded-lg border font-semibold transition-all ${
                activeProject.paymentConfirmed
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300"
                  : "bg-muted/40 border-border/60 text-muted-foreground"
              }`}
            >
              {activeProject.paymentConfirmed ? (
                <PenTool className="h-4 w-4 mx-auto mb-1 text-amber-600 animate-pulse" />
              ) : (
                <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              )}
              4. En cours de rédaction
              <span className="block text-[10px] text-muted-foreground font-normal">
                {activeProject.paymentConfirmed ? "Paiement validé" : "Cocher paiement reçu"}
              </span>
            </div>

            {/* 5. Terminé et envoyé */}
            <div
              className={`p-2.5 rounded-lg border font-semibold transition-all ${
                activeProject.isCompleted
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-muted/40 border-border/60 text-muted-foreground"
              }`}
            >
              {activeProject.isCompleted ? (
                <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-white" />
              ) : (
                <Lock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              )}
              5. Terminé & Envoyé
              <span className="block text-[10px] font-normal opacity-85">
                {activeProject.isCompleted ? "Mémoire & Certificat prêts" : "Cocher pour livrer"}
              </span>
            </div>
          </div>
        </div>

        {/* Layout : Liste des Projets à gauche / Fiche Complète & Directives à droite */}
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Colonne Gauche : Liste des Projets */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary" />
                Liste des Commandes
              </span>
              <span className="text-[11px] font-mono">{projects.length}</span>
            </h3>

            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {projects.map((proj) => {
                const isSelected = proj.orderId === activeProject.orderId;
                return (
                  <div
                    key={proj.orderId}
                    onClick={() => setSelectedProjectId(proj.orderId)}
                    className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30"
                        : "border-border/70 bg-card hover:border-border hover:bg-muted/30 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">
                        {proj.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {proj.paymentConfirmed ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] px-2 py-0">
                            Payé
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-400 px-2 py-0">
                            Attente Paiement
                          </Badge>
                        )}
                        {proj.isCompleted && (
                          <Badge className="bg-indigo-600 text-white text-[10px] px-2 py-0">
                            Livré
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h4 className="mt-2 text-xs font-serif font-bold text-foreground line-clamp-2">
                      {proj.subject}
                    </h4>

                    <div className="mt-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                      <span className="font-medium text-foreground">
                        {proj.clientName || "Étudiant"}
                      </span>
                      <span className="font-mono font-bold text-primary">
                        {proj.priceFcfa?.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{proj.pages ? `${proj.pages} pages` : "Standard"}</span>
                      <span>Échéance : {new Date(proj.deadline).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colonne Droite : Dossier de Rédaction Académique Complet */}
          <div className="space-y-6">
            {/* Carte En-Tête du Projet Actif */}
            <TiltCard className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                      {activeProject.id}
                    </span>
                    <Badge variant="outline" className="capitalize text-xs">
                      {activeProject.documentType.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Échéance : <strong className="text-foreground">{new Date(activeProject.deadline).toLocaleDateString("fr-FR", { dateStyle: "long" })}</strong>
                    </span>
                  </div>

                  <h2 className="mt-3 font-serif text-xl sm:text-2xl font-bold text-foreground">
                    {activeProject.subject}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeProject.academicLevel || "Enseignement Supérieur Gabon"}
                  </p>
                </div>

                {/* Deux Actions Clés du Rédacteur / Administrateur */}
                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                  {/* Action 1 : Cocher Paiement Reçu */}
                  <Button
                    size="sm"
                    variant={activeProject.paymentConfirmed ? "default" : "outline"}
                    onClick={() => handleTogglePayment(activeProject.orderId)}
                    className={`gap-2 text-xs font-semibold h-9 rounded-xl ${
                      activeProject.paymentConfirmed
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        : "border-amber-500/50 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>
                      {activeProject.paymentConfirmed
                        ? "✓ Paiement Reçu (En cours)"
                        : "Cocher : Paiement Reçu"}
                    </span>
                  </Button>

                  {/* Action 2 : Cocher Mémoire Terminé & Envoyé */}
                  <Button
                    size="sm"
                    variant={activeProject.isCompleted ? "default" : "outline"}
                    onClick={() => handleToggleCompleted(activeProject.orderId)}
                    className={`gap-2 text-xs font-semibold h-9 rounded-xl ${
                      activeProject.isCompleted
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        : "border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>
                      {activeProject.isCompleted
                        ? "✓ Mémoire Terminé & Livré"
                        : "Cocher : Mémoire Terminé"}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Fiche Étudiant & Contacts Directs */}
              <div className="mt-6 grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-primary" /> Étudiant(e)
                  </span>
                  <p className="font-semibold text-foreground text-sm">
                    {activeProject.clientName || "Non renseigné"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {activeProject.clientEmail || "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp Gabon
                  </span>
                  <p className="font-mono font-bold text-foreground text-sm">
                    {activeProject.clientPhone || "+241 74 00 00 00"}
                  </p>
                  {activeProject.clientPhone && (
                    <a
                      href={`https://wa.me/${activeProject.clientPhone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:underline font-semibold"
                    >
                      <span>Ouvrir WhatsApp</span>
                    </a>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-indigo-600" /> Volume & Délais
                  </span>
                  <p className="font-semibold text-foreground text-sm">
                    {activeProject.pages || 60} pages
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Livraison le {new Date(activeProject.deadline).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-amber-600" /> Règlement FCFA
                  </span>
                  <p className="font-serif text-base font-bold text-primary">
                    {activeProject.priceFcfa?.toLocaleString("fr-FR")} FCFA
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Mode : <strong className="text-foreground">{activeProject.paymentMethod || "Airtel Money"}</strong>
                  </p>
                </div>
              </div>
            </TiltCard>

            {/* Onglets Simples du Projet : Dossier Client, Jalons & Messagerie */}
            <Tabs defaultValue="dossier" className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-xl p-1 bg-muted/50 border border-border/80">
                <TabsTrigger value="dossier" className="gap-2 text-xs font-semibold">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Dossier & Directives Client</span>
                </TabsTrigger>
                <TabsTrigger value="jalons" className="gap-2 text-xs font-semibold">
                  <CircleDot className="h-4 w-4 text-amber-600" />
                  <span>Jalons du Mémoire ({activeProject.milestones.length})</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-2 text-xs font-semibold">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <span>Messagerie avec le Client ({activeProject.messages.length})</span>
                </TabsTrigger>
              </TabsList>

              {/* ONGLET 1 : DOSSIER COMPLET & DIRECTIVES DU CLIENT */}
              <TabsContent value="dossier" className="mt-4 space-y-4">
                {/* 1. Plan de Rédaction fourni */}
                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                    <h4 className="font-serif text-sm font-bold text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Plan de Rédaction & Structure demandée
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(activeProject.planText || "");
                        toast.success("Plan copié dans le presse-papier !");
                      }}
                      className="text-xs h-7 gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copier</span>
                    </Button>
                  </div>

                  {activeProject.planText ? (
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 font-mono text-xs whitespace-pre-line leading-relaxed text-foreground max-h-[300px] overflow-y-auto">
                      {activeProject.planText}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic p-3 bg-muted/20 rounded-lg">
                      Aucun plan spécifique fourni lors de la commande. Vous devez concevoir et proposer un plan détaillé en 2 parties et 4 chapitres au Jalon 1.
                    </p>
                  )}
                </div>

                {/* 2. Consignes Pédagogiques & Démarche */}
                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-3">
                  <h4 className="font-serif text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2.5">
                    <FileCheck2 className="h-4 w-4 text-emerald-600" />
                    Consignes Pédagogiques & Exigences du Directeur de Mémoire
                  </h4>
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-xs leading-relaxed text-foreground">
                    {activeProject.guidelinesText || "Aucune consigne spécifique transmise."}
                  </div>
                </div>

                {/* 3. Page de Garde Souhaitée */}
                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-3">
                  <h4 className="font-serif text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2.5">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    Page de Garde & Mentions Officielles
                  </h4>
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-xs leading-relaxed text-foreground">
                    {activeProject.coverPageText || "Informations standards de l'Université Omar Bongo."}
                  </div>
                </div>

                {/* 4. Documents & Fichiers Fournis par le Client */}
                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-3">
                  <h4 className="font-serif text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2.5">
                    <Paperclip className="h-4 w-4 text-indigo-600" />
                    Fichiers & Pièces Jointes de l'Étudiant ({activeProject.filePaths?.length || 0})
                  </h4>

                  {activeProject.filePaths && activeProject.filePaths.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {activeProject.filePaths.map((filePath, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                            <span className="font-mono truncate">{filePath.split("/").pop()}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toast.info(`Consultation du fichier : ${filePath}`)}
                            className="h-7 text-xs gap-1 text-primary shrink-0"
                          >
                            <Download className="h-3 w-3" />
                            <span>Télécharger</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic p-3 bg-muted/20 rounded-lg">
                      Aucun fichier joint lors de la commande initiale.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* ONGLET 2 : JALONS DU MÉMOIRE */}
              <TabsContent value="jalons" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm font-bold text-foreground">
                    Jalons de Rédaction & Suivi Étudiant
                  </h4>
                  <Button
                    size="sm"
                    onClick={() => setShowMilestoneModal(true)}
                    className="gap-1.5 text-xs h-8 bg-primary text-primary-foreground font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Nouveau Jalon</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {activeProject.milestones.map((ms) => (
                    <div
                      key={ms.id}
                      className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                            {ms.stepNumber}
                          </span>
                          <h5 className="font-serif text-sm font-bold text-foreground">
                            {ms.title}
                          </h5>
                        </div>
                        <Badge
                          variant={ms.status === "valide" ? "default" : "secondary"}
                          className={`text-[10px] capitalize ${
                            ms.status === "valide" ? "bg-emerald-600 text-white" : ""
                          }`}
                        >
                          {ms.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line bg-muted/20 p-3 rounded-lg border border-border/40">
                        {ms.contentPreview}
                      </p>

                      {ms.writerNotes && (
                        <div className="text-xs text-muted-foreground italic flex items-start gap-1.5">
                          <span className="font-semibold text-primary not-italic shrink-0">
                            Note pour le client :
                          </span>
                          <span>{ms.writerNotes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* ONGLET 3 : MESSAGERIE PROJET */}
              <TabsContent value="chat" className="mt-4 space-y-4">
                <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                  <div className="border-b border-border/60 p-4 bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        ET
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-foreground">
                          {activeProject.clientName || "Étudiant"}
                        </h4>
                        <span className="text-[11px] text-muted-foreground">
                          {activeProject.academicLevel || "Université Omar Bongo"}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Projet {activeProject.id}
                    </Badge>
                  </div>

                  {/* Flux des Messages */}
                  <div className="p-4 sm:p-6 space-y-4 max-h-[380px] overflow-y-auto bg-background/50">
                    {activeProject.messages.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-8 italic">
                        Aucun message échangé pour l'instant. Envoyez le premier mot à l'étudiant ci-dessous !
                      </p>
                    ) : (
                      activeProject.messages.map((msg) => {
                        const isWriter = msg.sender === "redacteur";
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isWriter ? "items-end" : "items-start"}`}
                          >
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                              <span className="font-semibold text-foreground">
                                {msg.senderName}
                              </span>
                              <span>·</span>
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-xs max-w-lg leading-relaxed shadow-xs ${
                                isWriter
                                  ? "bg-primary text-primary-foreground rounded-tr-none"
                                  : "bg-muted/80 text-foreground border border-border/60 rounded-tl-none"
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Formulaire de Saisie Message */}
                  <form onSubmit={handleSendChat} className="border-t border-border/60 p-3 bg-muted/20 flex gap-2">
                    <Input
                      placeholder="Écrivez votre message à l'étudiant..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="text-xs h-10 rounded-xl"
                    />
                    <Button type="submit" size="sm" className="h-10 px-4 gap-1.5 rounded-xl bg-primary text-primary-foreground">
                      <Send className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Envoyer</span>
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modal d'Ajout de Jalon */}
      <Dialog open={showMilestoneModal} onOpenChange={setShowMilestoneModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Publier un Nouveau Jalon</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ce jalon sera immédiatement accessible en consultation par l'étudiant dans son Espace Client.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMilestoneSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="m-title" className="text-xs font-semibold">Titre du Jalon *</Label>
              <Input
                id="m-title"
                placeholder="Ex: Jalon 2 : Revue de Littérature & Cadre Conceptuel"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="m-content" className="text-xs font-semibold">Contenu / Extrait Académique *</Label>
              <Textarea
                id="m-content"
                rows={5}
                placeholder="Détaillez le contenu, les hypothèses ou la synthèse de l'étape..."
                value={newMilestonePreview}
                onChange={(e) => setNewMilestonePreview(e.target.value)}
                required
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="m-notes" className="text-xs font-semibold">Remarques pour l'étudiant (facultatif)</Label>
              <Input
                id="m-notes"
                placeholder="Ex: Merci de soumettre ce plan à votre directeur de recherche pour validation."
                value={newMilestoneNotes}
                onChange={(e) => setNewMilestoneNotes(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowMilestoneModal(false)}>
                Annuler
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Publier le Jalon
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
    </RoleGuard>
  );
}
export default WriterDashboard;
