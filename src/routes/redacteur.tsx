import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  CircleDot,
  FileText,
  Inbox,
  Loader2,
  Lock,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Send,
  MessageSquare,
  Bot,
  Wand2,
  FileCheck2,
  CreditCard,
  Building,
  Calendar,
  DollarSign,
  Briefcase,
  Target,
  Users,
  Copy,
  Plus,
  RefreshCw,
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
import {
  getProjectData,
  saveProjectData,
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
      { title: "Espace Rédacteur & Projets IA — MémoirePro" },
      { name: "description", content: "Tableau de bord rédacteur, projets avec ID, messagerie et rédaction assistée par IA." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WriterDashboard,
});

// Mock Initial Orders to ensure active projects are available immediately
const INITIAL_WRITER_ORDERS: ProjectDetails[] = [
  {
    id: "PRJ-2026-8A3F",
    orderId: "ord-demo-01",
    subject: "L'impact du mobile money (Airtel & Moov) sur l'inclusion financière des PME au Gabon",
    documentType: "memoire_master",
    academicLevel: "Université Omar Bongo (UOB Libreville) — Master 2 Finance & Banque",
    objective: "Rédaction complète d'un mémoire de 70 pages avec cadrage théorique, démarche empirique et recommandations adaptées au tissu économique gabonais.",
    means: "Revue de littérature Cairn/JSTOR, Rédacteur Senior, Assistant IA académique et analyse statistique.",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    priceFcfa: 150000,
    paymentConfirmed: true,
    isCompleted: false,
    finalReportReady: false,
    hasPlan: true,
    planText: "Partie 1 : Cadre théorique et revue documentaire. Partie 2 : Étude de cas sur 50 PME gabonaises (Libreville & Port-Gentil).",
    hasGuidelines: true,
    guidelinesText: "Normes APA 7e édition, Times New Roman 12, interligne 1.5.",
    hasCoverPage: true,
    coverPageText: "Logo UOB, Faculté de Droit et des Sciences Économiques (FDSE Libreville), Sous la direction du Pr. Nguema.",
    milestones: [
      {
        id: "ms-1",
        orderId: "ord-demo-01",
        stepNumber: 1,
        title: "Jalon 1 : Cadrage, Problématique & Plan détaillé",
        contentPreview: "Problématique validée : Dans quelle mesure les solutions de paiement mobile favorisent-elles la résilience financière des PME informelles au Gabon ?",
        status: "valide",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        writerNotes: "Plan aligné sur les exigences académiques de l'UOB et les normes CAMES.",
      },
      {
        id: "ms-2",
        orderId: "ord-demo-01",
        stepNumber: 2,
        title: "Jalon 2 : Revue de Littérature & Cadre Conceptuel",
        contentPreview: "Analyse comparée des théories de l'intermédiation financière et de l'inclusion numérique en zone CEMAC (BEAC, COBAC).",
        status: "soumis",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        writerNotes: "Prêt pour consultation par l'étudiant.",
      },
      {
        id: "ms-3",
        orderId: "ord-demo-01",
        stepNumber: 3,
        title: "Jalon 3 : Analyse des Données & Résultats Empiriques",
        contentPreview: "Traitement des questionnaires et analyse économétrique de l'accès au crédit court terme à Libreville.",
        status: "en_cours",
        writerNotes: "En cours de finalisation.",
      },
      {
        id: "ms-4",
        orderId: "ord-demo-01",
        stepNumber: 4,
        title: "Jalon 4 : Conclusion Générale & Recommandations",
        contentPreview: "Synthèse des apports, limites méthodologiques et recommandations pour les régulateurs gabonais.",
        status: "en_attente",
      },
    ],
    messages: [
      {
        id: "m-1",
        orderId: "ord-demo-01",
        sender: "client",
        senderName: "Grace Mba (Étudiante UOB)",
        content: "Bonjour Dr. Ondo, j'ai bien consulté le Jalon 1. Le plan me convient parfaitement, mon encadreur à l'UOB a validé les deux axes !",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
      {
        id: "m-2",
        orderId: "ord-demo-01",
        sender: "redacteur",
        senderName: "Dr. Stéphane Ondo (Rédacteur)",
        content: "Excellente nouvelle Grace ! Je viens de déposer le Jalon 2 (revue de littérature) dans votre espace pour consultation.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      },
    ],
  },
  {
    id: "PRJ-2026-3B9C",
    orderId: "ord-demo-02",
    subject: "Audit de la conformité RSE des entreprises de transformation du bois au Gabon",
    documentType: "rapport_stage",
    academicLevel: "Institut National des Sciences de Gestion (INSG Libreville) — Master 1 Management",
    objective: "Rapport de stage de 45 pages évaluant l'impact environnemental et sociétal des exploitants de la zone économique de Nkok.",
    means: "Guides RSE ISO 26000, Rapports sectoriels Gabon, Assistant IA et Rédacteur Senior.",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    priceFcfa: 40000,
    paymentConfirmed: false,
    isCompleted: false,
    finalReportReady: false,
    hasPlan: true,
    hasGuidelines: false,
    hasCoverPage: true,
    milestones: [
      {
        id: "ms-2-1",
        orderId: "ord-demo-02",
        stepNumber: 1,
        title: "Jalon 1 : Présentation de l'entreprise & Diagnostic RSE",
        contentPreview: "Présentation des activités, cartographie des parties prenantes et grille d'évaluation sectorielle Gabon.",
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

  // Espace IA States
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiMode, setAiMode] = useState<"plan" | "theorie" | "reformulation" | "biblio">("plan");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<string>("");

  const activeProject = useMemo(() => {
    return projects.find((p) => p.orderId === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  // Load any newly created orders from projectStore
  useEffect(() => {
    if (typeof window !== "undefined") {
      const rawOrders = localStorage.getItem("memoirepro_orders");
      if (rawOrders) {
        try {
          const list: string[] = JSON.parse(rawOrders);
          const loaded = list.map((id) => getProjectData(id));
          if (loaded.length > 0) {
            // merge with initial demos without duplicates
            const map = new Map<string, ProjectDetails>();
            INITIAL_WRITER_ORDERS.forEach((p) => map.set(p.orderId, p));
            loaded.forEach((p) => map.set(p.orderId, p));
            setProjects(Array.from(map.values()));
          }
        } catch {}
      }
    }
  }, []);

  // Action: Toggle Payment Confirmation (Page 4: Cocher paiement reçu)
  const handleTogglePayment = (orderId: string) => {
    const proj = projects.find((p) => p.orderId === orderId);
    if (!proj) return;

    const nextState = !proj.paymentConfirmed;
    const updated = setProjectPaymentConfirmed(orderId, nextState);

    setProjects((prev) => prev.map((p) => (p.orderId === orderId ? { ...updated } : p)));

    if (nextState) {
      toast.success(`Paiement validé pour le projet ${proj.id} !`, {
        description: "L'étudiant a désormais accès aux jalons du mémoire en consultation.",
        icon: <CreditCard className="h-4 w-4 text-emerald-600" />,
      });
    } else {
      toast.info(`Paiement repassé en attente pour le projet ${proj.id}.`);
    }
  };

  // Action: Toggle Project Completed (Page 4: Cocher mémoire terminé -> débloque le téléchargement client)
  const handleToggleCompleted = (orderId: string) => {
    const proj = projects.find((p) => p.orderId === orderId);
    if (!proj) return;

    const nextState = !proj.isCompleted;
    const updated = setProjectCompleted(orderId, nextState);

    setProjects((prev) => prev.map((p) => (p.orderId === orderId ? { ...updated } : p)));

    if (nextState) {
      toast.success(`🎉 Mémoire ${proj.id} marqué comme TERMINÉ !`, {
        description: "Le téléchargement du rapport complet est maintenant débloqué pour le client.",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      });
    } else {
      toast.info(`Mémoire ${proj.id} repassé en cours de rédaction.`);
    }
  };

  // Action: Send message in project chat
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
    toast.success("Message transmis au client !");
  };

  // Action: Add new Milestone
  const handleAddMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !activeProject) return;

    const updated = addNewMilestone(
      activeProject.orderId,
      newMilestoneTitle.trim(),
      newMilestonePreview.trim(),
      newMilestoneNotes.trim()
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

  // Action: AI Writing Assistant Simulation
  const handleGenerateAI = () => {
    setAiLoading(true);
    const subject = activeProject ? activeProject.subject : "Sujet académique";

    setTimeout(() => {
      let result = "";
      if (aiMode === "plan") {
        result = `PROPOSITION DE PLAN DÉTAILLÉ & PROBLÉMATIQUE :
Sujet : ${subject}

Problématique Centrale :
Dans quelle mesure les dynamiques observées impactent-elles l'efficacité et la pérennité institutionnelle dans le contexte étudié ?

PARTIE 1 : FONDEMENTS THÉORIQUES ET ÉTAT DE L'ART
  Chapitre 1 : Revue critique de la littérature scientifique
    1.1. Définition des concepts opératoires et cadre paradigmatique
    1.2. Modèles analytiques dominants et limites actuelles
  Chapitre 2 : Méthodologie et protocole empirique
    2.1. Justification du choix méthodologique (mixte qualitatif/quantitatif)
    2.2. Échantillonnage, instruments de collecte et triangulation

PARTIE 2 : ANALYSE DES RÉSULTATS ET RECOMMANDATIONS STRATÉGIQUES
  Chapitre 3 : Traitement des données et interprétation critique
    3.1. Analyse factorielle et mise en perspective des hypothèses
    3.2. Discussion critique des résultats au regard des théories existantes
  Chapitre 4 : Implications managériales et limites
    4.1. Recommandations pratiques et plan d'action opérationnel
    4.2. Limites de la recherche et perspectives futures`;
      } else if (aiMode === "theorie") {
        result = `CADRE THÉORIQUE & HYPOTHÈSES DE RECHERCHE :
Sujet : ${subject}

1. Ancrage Théorique :
   - Théorie de l'Intermédiation et des Coûts de Transaction (Coase, 1937 ; Williamson, 1985).
   - Approche par les Capacités Dynamiques (Teece et al., 1997).

2. Formulation des Hypothèses :
   - H1 : L'adoption des solutions technologiques réduit significativement les asymétries d'information entre parties prenantes.
   - H2 : L'impact sur la performance globale est modéré par le niveau de formation et les contraintes réglementaires locales.`;
      } else if (aiMode === "reformulation") {
        result = `REFORMULATION ACADÉMIQUE HAUTE RIGUEUR (ANTI-PLAGIAT) :
Version Source reformulée selon les standards académiques universitaires :
« Les résultats empiriques révèlent une corrélation substantielle entre la digitalisation des processus et l'efficience opérationnelle des structures analysées. Contrairement aux postulats initiaux, cette dynamique ne s'accompagne pas d'une hausse immédiate des charges fixes, mais d'une réallocation stratégique des compétences internes. »`;
      } else {
        result = `BIBLIOGRAPHIE NORMALISÉE APA 7e ÉDITION :
- Banque Mondiale. (2024). Rapport sur l'inclusion économique et financière en Afrique subsaharienne. Washington, DC.
- Nguema, J.-P., & Ondo, S. (2023). Transformation numérique et inclusion financière en Afrique Centrale : dynamiques et perspectives au Gabon. Revue Gabonaise d'Économie et de Gestion, 14(2), 45-68.
- Porter, M. E. (2020). L'avantage concurrentiel à l'ère des plateformes numériques. De Boeck Supérieur.
- Williamson, O. E. (1985). The Economic Institutions of Capitalism. Free Press.`;
      }

      setAiResult(result);
      setAiLoading(false);
      toast.success("Contenu académique généré par l'IA !");
    }, 900);
  };

  const copyAiResult = () => {
    navigator.clipboard.writeText(aiResult);
    toast.success("Contenu copié dans le presse-papier !");
  };

  const insertAiToMilestone = () => {
    setNewMilestoneTitle(`Jalon IA : Synthèse académique`);
    setNewMilestonePreview(aiResult);
    setShowMilestoneModal(true);
  };

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Header Rédacteur */}
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md igloo-glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold text-primary">MémoirePro</span>
              <span className="text-xs bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 px-2 py-0.5 rounded-full font-semibold">
                Espace Rédacteur
              </span>
            </Link>
            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 igloo-pulse-dot" />
              Assistant IA Actif
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button asChild size="sm" variant="default" className="gap-1.5 h-8 text-xs igloo-spring-btn bg-amber-600 hover:bg-amber-700 text-white">
              <Link to="/admin">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Page d'Administration</span>
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

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        {/* En-tête de section */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Projets de Rédaction & Espace IA
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pilotez les projets assignés, validez les paiements, soumettez les jalons et rédigez avec l'IA.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 text-xs">
              {projects.length} projet(s) en cours
            </Badge>
          </div>
        </div>

        {/* Layout : Liste des Projets à gauche / Détail & Espace IA à droite */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Colonne Gauche : Liste des Projets (Page 4: chaque client qui a payé ouvre un projet avec numéro ID) */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-primary" />
              Projets de Rédaction
            </h3>

            <div className="space-y-2.5">
              {projects.map((proj) => {
                const isSelected = proj.orderId === activeProject.orderId;
                return (
                  <div
                    key={proj.orderId}
                    onClick={() => setSelectedProjectId(proj.orderId)}
                    className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30"
                        : "border-border/70 bg-card/70 hover:border-border hover:bg-muted/30 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">
                        {proj.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {proj.paymentConfirmed ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-500" title="Paiement validé" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-amber-500" title="Paiement en attente" />
                        )}
                        <span className="text-[11px] font-semibold text-foreground">
                          {proj.priceFcfa.toLocaleString("fr-FR")} F
                        </span>
                      </div>
                    </div>

                    <h4 className="mt-2 font-serif text-sm font-bold text-foreground line-clamp-2">
                      {proj.subject}
                    </h4>

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{proj.documentType.replace("_", " ")}</span>
                      <span>
                        {proj.isCompleted ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] py-0">Livré</Badge>
                        ) : proj.paymentConfirmed ? (
                          <Badge variant="outline" className="text-emerald-700 text-[10px] py-0">En cours</Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-700 text-[10px] py-0">Non payé</Badge>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colonne Droite : Fiche Projet Structurée, Actions & Espace IA */}
          <div className="space-y-6">
            {/* Fiche Projet (Page 4: Objectif, Moyens, Délais et Coût) */}
            <TiltCard className="rounded-2xl border border-border/80 bg-card p-6 shadow-md igloo-glass">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                      PROJET : {activeProject.id}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{activeProject.academicLevel}</span>
                  </div>
                  <h2 className="mt-2 font-serif text-xl font-bold text-foreground">
                    {activeProject.subject}
                  </h2>
                </div>

                {/* Validation Switchers (Page 4 du PDF) */}
                <div className="flex flex-col gap-2 sm:items-end shrink-0">
                  {/* Action 1 : Cocher Paiement reçu */}
                  <Button
                    size="sm"
                    variant={activeProject.paymentConfirmed ? "default" : "outline"}
                    onClick={() => handleTogglePayment(activeProject.orderId)}
                    className={`gap-2 text-xs font-semibold h-9 rounded-xl igloo-spring-btn ${
                      activeProject.paymentConfirmed
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "border-amber-400 text-amber-800 hover:bg-amber-50"
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>{activeProject.paymentConfirmed ? "✓ Paiement Reçu" : "Cocher : Paiement Reçu"}</span>
                  </Button>

                  {/* Action 2 : Cocher Mémoire terminé (Débloque le téléchargement client) */}
                  <Button
                    size="sm"
                    variant={activeProject.isCompleted ? "default" : "outline"}
                    onClick={() => handleToggleCompleted(activeProject.orderId)}
                    className={`gap-2 text-xs font-semibold h-9 rounded-xl igloo-spring-btn ${
                      activeProject.isCompleted
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        : "border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{activeProject.isCompleted ? "✓ Mémoire Terminé (Client Débloqué)" : "Cocher : Mémoire Terminé"}</span>
                  </Button>
                </div>
              </div>

              {/* Grille des 4 Piliers du Projet (Page 4 du PDF) */}
              <div className="mt-6 grid gap-4 rounded-xl border border-border/60 bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-primary" /> Objectif
                  </span>
                  <p className="text-foreground leading-relaxed">{activeProject.objective}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Wand2 className="h-3.5 w-3.5 text-indigo-600" /> Moyens
                  </span>
                  <p className="text-foreground leading-relaxed">{activeProject.means}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Délais
                  </span>
                  <p className="font-semibold text-foreground">
                    {new Date(activeProject.deadline).toLocaleDateString("fr-FR", { dateStyle: "long" })}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Livraison échelonnée</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-amber-600" /> Coût
                  </span>
                  <p className="font-serif text-base font-bold text-primary">
                    {activeProject.priceFcfa.toLocaleString("fr-FR")} FCFA
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {activeProject.paymentConfirmed ? "Règlement confirmé" : "En attente"}
                  </span>
                </div>
              </div>
            </TiltCard>

            {/* Onglets : Espace IA, Jalons & Messagerie Projet */}
            <Tabs defaultValue="ia" className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-xl p-1 bg-muted/50 border border-border/80">
                <TabsTrigger value="ia" className="gap-2 text-xs font-semibold">
                  <Bot className="h-4 w-4 text-indigo-600" />
                  <span>Espace de Rédaction IA</span>
                </TabsTrigger>
                <TabsTrigger value="jalons" className="gap-2 text-xs font-semibold">
                  <CircleDot className="h-4 w-4 text-primary" />
                  <span>Jalons ({activeProject.milestones.length})</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-2 text-xs font-semibold">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <span>Messagerie Client ({activeProject.messages.length})</span>
                </TabsTrigger>
              </TabsList>

              {/* ONGLET 1 : ESPACE DE RÉDACTION AVEC IA (Page 4 du PDF) */}
              <TabsContent value="ia" className="mt-4 space-y-4">
                <div className="rounded-2xl border border-indigo-500/30 bg-card p-6 shadow-md igloo-glass">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-indigo-500/15 text-indigo-600 flex items-center justify-center">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-bold text-foreground">
                          Assistant IA Académique Intégré
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Conçu pour assister le rédacteur : plan détaillé, revue de littérature, reformulation anti-plagiat et citations APA.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      { id: "plan", label: "Plan & Problématique" },
                      { id: "theorie", label: "Cadre Théorique & Hypothèses" },
                      { id: "reformulation", label: "Reformulation Anti-Plagiat" },
                      { id: "biblio", label: "Bibliographie APA 7e" },
                    ].map((mode) => (
                      <Button
                        key={mode.id}
                        type="button"
                        size="sm"
                        variant={aiMode === mode.id ? "default" : "outline"}
                        onClick={() => setAiMode(mode.id as typeof aiMode)}
                        className="h-8 text-xs rounded-lg igloo-spring-btn"
                      >
                        {mode.label}
                      </Button>
                    ))}
                  </div>

                  {/* Prompt & Action */}
                  <div className="mt-4 flex gap-2">
                    <Input
                      placeholder={`Directives spécifiques pour l'IA (laissez vide pour générer sur la base du sujet...)`}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="text-xs sm:text-sm h-10 rounded-xl"
                    />
                    <Button
                      onClick={handleGenerateAI}
                      disabled={aiLoading}
                      className="gap-2 h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl igloo-spring-btn shrink-0"
                    >
                      {aiLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      <span>Générer</span>
                    </Button>
                  </div>

                  {/* AI Result Area */}
                  {aiResult && (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-xl border border-indigo-200 bg-indigo-950/5 p-4 text-xs font-mono leading-relaxed text-foreground whitespace-pre-line max-h-80 overflow-y-auto">
                        {aiResult}
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={copyAiResult} className="gap-1.5 text-xs h-8">
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copier le texte</span>
                        </Button>
                        <Button size="sm" onClick={insertAiToMilestone} className="gap-1.5 text-xs h-8 bg-primary text-primary-foreground">
                          <Plus className="h-3.5 w-3.5" />
                          <span>Créer un Jalon avec ce contenu</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ONGLET 2 : GESTION DES JALONS */}
              <TabsContent value="jalons" className="mt-4 space-y-4">
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm igloo-glass">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h3 className="font-serif text-base font-bold text-foreground">
                        Jalons Publiés pour le Client
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Les jalons validés sont visibles en consultation (lecture seule) par l'étudiant dès paiement.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowMilestoneModal(true)}
                      className="gap-1.5 h-8 text-xs rounded-xl igloo-spring-btn"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Ajouter un Jalon</span>
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {activeProject.milestones.map((ms) => (
                      <div
                        key={ms.id}
                        className="rounded-xl border border-border/70 bg-card p-4 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground text-sm flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-xs">
                              {ms.stepNumber}
                            </span>
                            {ms.title}
                          </span>
                          <Badge
                            className={
                              ms.status === "valide"
                                ? "bg-emerald-500/15 text-emerald-700 border-emerald-300"
                                : ms.status === "soumis"
                                  ? "bg-indigo-500/15 text-indigo-700 border-indigo-300"
                                  : "bg-muted text-muted-foreground"
                            }
                          >
                            {ms.status === "valide" ? "Validé" : ms.status === "soumis" ? "Publié au Client" : "En cours"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-line pl-8">
                          {ms.contentPreview}
                        </p>
                        {ms.writerNotes && (
                          <p className="text-[11px] text-indigo-800 bg-indigo-50/60 rounded-md p-2 pl-3 ml-8 border border-indigo-100">
                            <strong>Note pour l'étudiant :</strong> {ms.writerNotes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ONGLET 3 : MESSAGERIE PAR PROJET (Page 4: chaque projet a sa conversation) */}
              <TabsContent value="chat" className="mt-4">
                <div className="rounded-2xl border border-border/80 bg-card shadow-sm igloo-glass overflow-hidden">
                  <div className="border-b border-border/60 p-4 bg-muted/20 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-foreground">
                        Conversation avec le Client · Projet {activeProject.id}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Échanges directs, retours sur les jalons et questions méthodologiques.
                      </p>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="p-4 sm:p-6 space-y-4 max-h-[340px] overflow-y-auto bg-background/50">
                    {activeProject.messages.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        Aucun message échangé pour l'instant. Démarrez la conversation avec votre client.
                      </div>
                    ) : (
                      activeProject.messages.map((msg) => {
                        const isWriter = msg.sender === "redacteur";
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isWriter ? "items-end" : "items-start"}`}
                          >
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                              <span>{msg.senderName}</span>
                              <span>·</span>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <div
                              className={`max-w-md rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                                isWriter
                                  ? "bg-indigo-600 text-white rounded-br-none shadow-sm"
                                  : "bg-card border border-border/80 text-foreground rounded-bl-none shadow-sm"
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSendChat} className="p-3 border-t border-border/60 bg-card flex gap-2">
                    <Input
                      placeholder="Envoyer un message ou une consigne au client..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="text-xs sm:text-sm h-10 rounded-xl"
                    />
                    <Button type="submit" size="sm" className="gap-1.5 rounded-xl h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white igloo-spring-btn">
                      <Send className="h-3.5 w-3.5" />
                      <span>Envoyer</span>
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
        <DialogContent className="max-w-lg rounded-2xl p-6 igloo-glass">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold">
              Publier un Nouveau Jalon pour le Client
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Le contenu sera immédiatement consultable en lecture seule dans l'Espace Client du projet {activeProject.id}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMilestoneSubmit} className="space-y-4 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Titre du Jalon *</Label>
              <Input
                placeholder="Ex : Jalon 3 - Résultats empiriques & Graphiques"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Extrait / Contenu du Jalon (Consultation) *</Label>
              <Textarea
                placeholder="Texte, plan, synthèse rédigée..."
                rows={4}
                value={newMilestonePreview}
                onChange={(e) => setNewMilestonePreview(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Note / Recommandation pour l'étudiant (optionnel)</Label>
              <Input
                placeholder="Ex : Merci de vérifier les données du tableau 4."
                value={newMilestoneNotes}
                onChange={(e) => setNewMilestoneNotes(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowMilestoneModal(false)}>
                Annuler
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground igloo-spring-btn">
                Publier le Jalon
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default WriterDashboard;
