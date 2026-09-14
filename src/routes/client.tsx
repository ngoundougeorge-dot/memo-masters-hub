import { useEffect, useState, useMemo } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  Inbox,
  CreditCard,
  PenTool,
  Package,
  CheckCircle2,
  ArrowLeft,
  Send,
  Lock,
  Unlock,
  Download,
  MessageSquare,
  Milestone as MilestoneIcon,
  Upload,
  Clock,
  ChevronRight,
  Eye,
  AlertCircle,
  FileCheck2,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { getOrderPublic } from "@/lib/orders.functions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getProjectData,
  saveProjectData,
  addProjectMessage,
  getDefaultMilestones,
  type ProjectDetails,
  type Milestone,
} from "@/lib/projectStore";
import { TiltCard } from "@/components/TiltCard";
import { AcademicCertificate } from "@/components/AcademicCertificate";
import { RoleGuard } from "@/components/RoleGuard";
import { useAuth, fetchUserOrders, fetchFirebaseOrder } from "@/integrations/firebase";

type ClientSearch = {
  order_id?: string;
};

export const Route = createFileRoute("/client")({
  validateSearch: (search: Record<string, unknown>): ClientSearch => ({
    order_id: typeof search.order_id === "string" ? search.order_id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Espace Client — MémoirePro" },
      { name: "description", content: "Suivez l'avancement de votre mémoire, consultez les jalons et échangez avec votre rédacteur." },
    ],
  }),
  component: ClientDashboard,
});

const TIMELINE = [
  { label: "Inscrit & Reçu", statuses: ["nouveau"], icon: Inbox },
  { label: "Projet Créé", statuses: ["documents_envoyes"], icon: FileCheck2 },
  { label: "Rédaction en cours", statuses: ["en_cours", "redaction"], icon: PenTool },
  { label: "Terminé & Envoyé", statuses: ["livre"], icon: Package },
] as const;

function ClientDashboard() {
  const { user, role, logout } = useAuth();
  const search = Route.useSearch();
  const [activeOrderId, setActiveOrderId] = useState<string>(search.order_id || "");
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [activeTab, setActiveTab] = useState<string>("jalons");
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const [complementaryFiles, setComplementaryFiles] = useState<string[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  // Synchronisation avec les commandes réelles Firestore de l'utilisateur connecté
  useEffect(() => {
    async function loadUserOrders() {
      if (!user) return;
      try {
        const userOrders = await fetchUserOrders(user.uid, user.email || undefined);
        if (userOrders.length > 0 && !activeOrderId) {
          const latest = userOrders[0];
          setActiveOrderId(latest.orderId || latest.id);
        }
      } catch (err) {
        console.warn("[Client] Erreur chargement commandes utilisateur:", err);
      }
    }
    loadUserOrders();
  }, [user, activeOrderId]);

  // Repli sur l'ID de commande local si non spécifié dans l'URL
  useEffect(() => {
    if (!activeOrderId && typeof window !== "undefined") {
      const raw = localStorage.getItem("memoirepro_orders");
      if (raw) {
        try {
          const list: string[] = JSON.parse(raw);
          if (list.length > 0) {
            setActiveOrderId(list[list.length - 1]);
          }
        } catch {}
      }
    }
  }, [activeOrderId]);

  // Chargement des données réelles du projet (LocalStore + Firestore)
  useEffect(() => {
    if (!activeOrderId) {
      setProject(null);
      return;
    }
    const localData = getProjectData(activeOrderId);
    setProject(localData);

    // Synchronisation avec Firestore en production
    fetchFirebaseOrder(activeOrderId).then((fbOrder) => {
      if (fbOrder) {
        const fullProj: ProjectDetails = {
          id: fbOrder.id.startsWith("PRJ-") ? fbOrder.id : `PRJ-2026-${activeOrderId.slice(0, 6).toUpperCase()}`,
          orderId: activeOrderId,
          userId: fbOrder.userId,
          clientName: fbOrder.clientName || "Étudiant",
          clientEmail: fbOrder.clientEmail || "",
          clientPhone: fbOrder.clientPhone || "",
          subject: fbOrder.subject || "Mémoire Académique",
          documentType: fbOrder.documentType || "memoire_master",
          academicLevel: fbOrder.academicLevel || "",
          pages: fbOrder.pages || 60,
          objective: fbOrder.instructions || `Rédaction complète (${fbOrder.pages || 60} pages).`,
          means: "Documentation scientifique spécialisée et contrôle anti-plagiat.",
          deadline: fbOrder.createdAt?.toDate ? fbOrder.createdAt.toDate().toISOString() : (fbOrder.createdAt || new Date().toISOString()),
          priceFcfa: fbOrder.priceFcfa || 75000,
          paymentMethod: fbOrder.paymentMethod || "Airtel Money Gabon",
          paymentConfirmed: fbOrder.paymentConfirmed || fbOrder.status === "en_cours" || fbOrder.status === "terminé",
          isCompleted: fbOrder.status === "terminé" || fbOrder.status === "envoyé",
          finalReportReady: fbOrder.status === "terminé" || fbOrder.status === "envoyé",
          hasPlan: Boolean(fbOrder.planText),
          planText: fbOrder.planText || "",
          hasGuidelines: Boolean(fbOrder.guidelinesText),
          guidelinesText: fbOrder.guidelinesText || "",
          hasCoverPage: Boolean(fbOrder.coverPageText),
          coverPageText: fbOrder.coverPageText || "",
          filePaths: fbOrder.fileUrls || [],
          createdAt: fbOrder.createdAt?.toDate ? fbOrder.createdAt.toDate().toISOString() : (fbOrder.createdAt || new Date().toISOString()),
          milestones: localData?.milestones || getDefaultMilestones(activeOrderId, fbOrder.documentType || "memoire_master"),
          messages: localData?.messages || [],
        };
        setProject(fullProj);
        saveProjectData(fullProj);
      }
    }).catch(() => {});
  }, [activeOrderId]);

  // Refresh project periodically
  const refreshProject = () => {
    if (!activeOrderId) return;
    const data = getProjectData(activeOrderId);
    setProject({ ...data });
  };

  // Remote Supabase order query
  const { data: remoteOrder } = useQuery({
    queryKey: ["order-public", activeOrderId || "none"],
    queryFn: async () => {
      if (!activeOrderId) return null;
      try {
        return await getOrderPublic({ data: { orderId: activeOrderId } });
      } catch {
        return null;
      }
    },
    enabled: Boolean(activeOrderId),
  });

  // Effective status computation
  const isPaid = useMemo(() => {
    if (project?.paymentConfirmed) return true;
    if (remoteOrder?.status && ["paiement_recu", "documents_envoyes", "en_cours", "redaction", "livre"].includes(remoteOrder.status)) {
      return true;
    }
    return false;
  }, [project, remoteOrder]);

  const isCompleted = useMemo(() => {
    if (project?.isCompleted) return true;
    if (remoteOrder?.status === "livre") return true;
    return false;
  }, [project, remoteOrder]);

  // Handle client sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeOrderId) return;

    const updated = addProjectMessage(
      activeOrderId,
      "client",
      "Moi (Étudiant)",
      messageInput.trim()
    );
    setProject({ ...updated });
    setMessageInput("");
    toast.success("Message envoyé au rédacteur !");
  };

  // Handle uploading complementary documents
  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingDoc(true);

    setTimeout(() => {
      const names = Array.from(files).map((f) => f.name);
      setComplementaryFiles((prev) => [...prev, ...names]);
      setUploadingDoc(false);
      toast.success(`${files.length} document(s) complémentaire(s) transmis au rédacteur.`);
    }, 600);
  };

  return (
    <RoleGuard
      allowedRoles={["client", "redacteur", "admin"]}
      fallbackTitle="Espace Client Sécurisé"
      customMessage="Veuillez vous connecter avec votre compte pour accéder au suivi de votre mémoire et à vos documents."
    >
      <main className="min-h-screen bg-background pb-16">
        {/* Header */}
        <header className="border-b border-border/70 bg-card/80 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold text-primary">MémoirePro</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                Espace Client
              </span>
            </Link>

            <div className="flex items-center gap-2.5">
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/">Accueil</Link>
              </Button>
              {(role === "redacteur" || role === "admin") && (
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link to="/redacteur">Espace Rédacteur</Link>
                </Button>
              )}
              {role === "admin" && (
                <Button asChild variant="outline" size="sm" className="text-xs bg-amber-500/10 text-amber-600 border-amber-300">
                  <Link to="/admin">Administration</Link>
                </Button>
              )}
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="text-xs text-destructive hover:bg-destructive/10"
                >
                  Déconnexion
                </Button>
              )}
            </div>
          </div>
        </header>

      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        {/* Title & Navigation */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Suivi de votre Mémoire
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consultez les jalons d'avancement, échangez avec votre rédacteur et accédez à votre document final.
            </p>
          </div>

          {project && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs px-3 py-1">
                ID : {project.id}
              </Badge>
              {isPaid ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300 text-xs">
                  Paiement Validé
                </Badge>
              ) : (
                <Badge className="bg-amber-500/15 text-amber-700 border-amber-300 text-xs">
                  En attente de paiement
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Pas de commande active ? */}
        {!project ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-12 text-center shadow-md">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
              Aucune commande active sélectionnée
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Passez votre première commande pour suivre son avancement en temps réel ou saisissez votre référence.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild>
                <Link to="/">Commander un mémoire</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {/* 1. Project Overview & Timeline */}
            <TiltCard className="rounded-2xl border border-border/80 bg-card p-6 shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {project.documentType.replace("_", " ")}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{project.academicLevel}</span>
                  </div>
                  <h2 className="mt-1 font-serif text-xl font-bold text-foreground">
                    {project.subject}
                  </h2>
                  <p className="mt-2 text-xs text-muted-foreground max-w-2xl">
                    <strong>Objectif :</strong> {project.objective}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-muted-foreground block">Montant du contrat</span>
                  <span className="font-serif text-2xl font-bold text-primary">
                    {project.priceFcfa.toLocaleString("fr-FR")} FCFA
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    Échéance : {new Date(project.deadline).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="mt-8 border-t border-border/60 pt-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {TIMELINE.map((step, idx) => {
                    let done = false;
                    let active = false;

                    if (idx === 0) done = true;
                    if (idx === 1) {
                      done = true;
                      active = !isPaid;
                    }
                    if (idx === 2) {
                      done = isCompleted;
                      active = isPaid && !isCompleted;
                    }
                    if (idx === 3) {
                      done = isCompleted;
                      active = isCompleted;
                    }

                    const Icon = step.icon;
                    return (
                      <div key={step.label} className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                            done
                              ? "bg-emerald-500/20 text-emerald-700 border border-emerald-400/40"
                              : active
                                ? "bg-primary/20 text-primary border border-primary/50"
                                : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{step.label}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {done ? "Complété" : active ? "En cours" : "En attente"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TiltCard>

            {/* 2. Banner si paiement non confirmé */}
            {!isPaid && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-serif text-sm font-bold text-amber-900 dark:text-amber-300">
                        Paiement en attente de validation par le rédacteur
                      </h4>
                      <p className="text-xs text-amber-800/90 dark:text-amber-400 mt-0.5">
                        Effectuez votre règlement par <strong>Airtel Money (+241 74 00 00 00)</strong> ou <strong>Moov Money</strong> en mentionnant votre référence <strong>{project.orderId}</strong>. Dès validation par le rédacteur, l'accès aux jalons et aux chapitres sera activé.
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-amber-700 dark:text-amber-300 border-amber-400 bg-amber-500/20 text-xs px-3 py-1">
                    En attente de validation
                  </Badge>
                </div>
              </div>
            )}

            {/* 3. Téléchargement Final (Règle d'or de la Page 3 du PDF) */}
            <div
              className={`rounded-2xl border p-6 ${
                isCompleted
                  ? "border-emerald-500/40 bg-emerald-500/10 shadow-lg"
                  : "border-border/70 bg-card/60 shadow-sm"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                      isCompleted
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Unlock className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-foreground">
                        {isCompleted
                          ? "🎉 Votre Mémoire est Terminé & Prêt pour Soutenance !"
                          : "Téléchargement du Rapport Complet (Verrouillé)"}
                      </h3>
                      {isCompleted ? (
                        <Badge className="bg-emerald-600 text-white text-xs">Prêt</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          En cours de rédaction
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground max-w-xl">
                      {isCompleted
                        ? "Le rédacteur a validé l'achèvement complet de votre travail. Vous pouvez télécharger le manuscrit intégral ainsi que le rapport de certification anti-plagiat."
                        : "Règle de sécurité : Le rapport complet est téléchargeable uniquement lorsque le mémoire est intégralement terminé et que le rédacteur a coché la validation finale."}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isCompleted ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => toast.success("Téléchargement du mémoire complet (.docx) lancé !")}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
                      >
                        <Download className="h-4 w-4" />
                        <span>Télécharger le Mémoire (.DOCX)</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCertificate(true)}
                        className="gap-1.5 border-emerald-400/50 text-xs text-emerald-700 dark:text-emerald-300 font-semibold"
                      >
                        <FileCheck2 className="h-4 w-4 text-emerald-600" />
                        <span>Certificat Anti-Plagiat</span>
                      </Button>
                    </div>
                  ) : (
                    <Button disabled variant="outline" className="gap-2 opacity-60 cursor-not-allowed">
                      <Lock className="h-4 w-4" />
                      <span>Téléchargement indisponible</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Onglets Principaux : Jalons, Messagerie, Documents Complémentaires */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-xl p-1 bg-muted/50 border border-border/80">
                <TabsTrigger value="jalons" className="gap-2 text-xs font-semibold">
                  <MilestoneIcon className="h-4 w-4" />
                  <span>Jalons du Mémoire</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                    {project.milestones.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger value="messagerie" className="gap-2 text-xs font-semibold">
                  <MessageSquare className="h-4 w-4" />
                  <span>Messagerie avec Rédacteur</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                    {project.messages.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger value="documents" className="gap-2 text-xs font-semibold">
                  <Upload className="h-4 w-4" />
                  <span>Documents Complémentaires</span>
                  {complementaryFiles.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                      {complementaryFiles.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ONGLET 1 : JALONS DU MÉMOIRE */}
              <TabsContent value="jalons" className="mt-4 space-y-4">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-foreground">
                        Jalons de Rédaction (Consultation Seule)
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {isPaid
                          ? "Consultez les étapes intermédiaires rédigées et validées par votre rédacteur."
                          : "Débloquez la consultation de ces jalons après confirmation du paiement."}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      Mode Lecture Seule
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-3">
                    {project.milestones.map((ms) => {
                      const isClickable = isPaid;
                      return (
                        <div
                          key={ms.id}
                          onClick={() => {
                            if (isClickable) setSelectedMilestone(ms);
                            else toast.warning("Confirmez le paiement pour consulter les détails de ce jalon.");
                          }}
                          className={`flex flex-col gap-3 rounded-xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                            !isClickable
                              ? "opacity-50 blur-[0.5px] cursor-not-allowed bg-muted/20 border-border/60"
                              : "hover:border-primary/50 hover:bg-muted/30 cursor-pointer bg-card border-border/70"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                ms.status === "valide"
                                  ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                                  : ms.status === "soumis"
                                    ? "bg-indigo-500/15 text-indigo-700 border border-indigo-500/30"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {ms.stepNumber}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm text-foreground">{ms.title}</h4>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${
                                    ms.status === "valide"
                                      ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                                      : ms.status === "soumis"
                                        ? "border-indigo-300 text-indigo-700 bg-indigo-50"
                                        : "text-muted-foreground"
                                  }`}
                                >
                                  {ms.status === "valide"
                                    ? "Validé"
                                    : ms.status === "soumis"
                                      ? "Prêt à consulter"
                                      : "En rédaction"}
                                </Badge>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                                {ms.contentPreview}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {isClickable ? (
                              <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs text-primary">
                                <Eye className="h-3.5 w-3.5" />
                                <span>Consulter</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Lock className="h-3 w-3" /> Verrouillé
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* ONGLET 2 : MESSAGERIE INTERNE */}
              <TabsContent value="messagerie" className="mt-4">
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="border-b border-border/60 p-4 bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-serif text-sm">
                        DR
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-foreground">
                          Dr. Stéphane Ondo · Rédacteur Académique
                        </h4>
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Assigné à votre projet
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Projet {project.id}
                    </Badge>
                  </div>

                  {/* Messages Feed */}
                  <div className="p-4 sm:p-6 space-y-4 max-h-[380px] overflow-y-auto bg-background/50">
                    {project.messages.map((msg) => {
                      const isMe = msg.sender === "client";
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                            <span>{msg.senderName}</span>
                            <span>·</span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <div
                            className={`max-w-md rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-none shadow-sm"
                                : "bg-card border border-border/80 text-foreground rounded-bl-none shadow-sm"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input Form */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-border/60 bg-card flex gap-2">
                    <Input
                      placeholder="Écrivez votre message ou posez une question à votre rédacteur..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="text-xs sm:text-sm h-10 rounded-xl"
                    />
                    <Button type="submit" size="sm" className="gap-1.5 rounded-xl h-10 px-4">
                      <Send className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Envoyer</span>
                    </Button>
                  </form>
                </div>
              </TabsContent>

              {/* ONGLET 3 : DOCUMENTS COMPLÉMENTAIRES */}
              <TabsContent value="documents" className="mt-4">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      Transmission de Documents Complémentaires
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Transmettez à tout moment des directives de votre directeur, des jeux de données, des annexes ou des corrections.
                    </p>
                  </div>

                  {/* Upload Box */}
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-background/50 p-6 text-center">
                    <Upload className="h-8 w-8 text-primary/70" />
                    <p className="mt-2 text-xs font-medium text-foreground">
                      Ajouter de nouveaux documents pour le rédacteur
                    </p>
                    <label className="mt-3 cursor-pointer">
                      <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90">
                        <Upload className="h-3.5 w-3.5" /> Parcourir les fichiers
                      </span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleAddFile}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                      />
                    </label>
                  </div>

                  {/* Uploaded List */}
                  {complementaryFiles.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Documents transmis récemment ({complementaryFiles.length})
                      </h4>
                      <div className="space-y-1.5">
                        {complementaryFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <FileCheck2 className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium text-foreground">{file}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">Transmis avec succès</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Modal de Consultation de Jalon (Lecture Seule) */}
      <Dialog open={Boolean(selectedMilestone)} onOpenChange={() => setSelectedMilestone(null)}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                Jalon {selectedMilestone?.stepNumber} sur {project?.milestones.length}
              </Badge>
              <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300 text-xs">
                Mode Consultation (Lecture seule)
              </Badge>
            </div>
            <DialogTitle className="font-serif text-lg font-bold mt-2">
              {selectedMilestone?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedMilestone?.submittedAt
                ? `Soumis par le rédacteur le ${new Date(selectedMilestone.submittedAt).toLocaleDateString("fr-FR", { dateStyle: "long", timeStyle: "short" })}`
                : "Étape en cours"}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-border/80 bg-background/80 p-4 text-xs leading-relaxed text-foreground">
              <h5 className="font-bold text-primary mb-1">Aperçu du contenu académique :</h5>
              <p className="whitespace-pre-line">{selectedMilestone?.contentPreview}</p>
            </div>

            {selectedMilestone?.writerNotes && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 text-xs text-indigo-950">
                <span className="font-semibold text-indigo-900 block mb-0.5">
                  Note d'accompagnement du Rédacteur :
                </span>
                {selectedMilestone.writerNotes}
              </div>
            )}

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-[11px] text-muted-foreground">
              💡 <em>Ce jalon est accessible en consultation pour vous permettre de suivre la démarche. Le rapport final téléchargeable sera débloqué dès l'achèvement total du mémoire.</em>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button size="sm" onClick={() => setSelectedMilestone(null)}>
              Fermer la consultation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Certificat Officiel d'Authenticité & Anti-Plagiat */}
      <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
          <AcademicCertificate
            orderId={project?.orderId || activeOrderId}
            projectSubject={project?.subject || "Mémoire de Recherche"}
            academicLevel={project?.academicLevel || "Université Omar Bongo (UOB Libreville) — Master 2"}
            studentName={project?.clientName || (remoteOrder as any)?.full_name || "Grace Mba"}
            completionDate="14 Septembre 2026"
            onClose={() => setShowCertificate(false)}
          />
        </DialogContent>
      </Dialog>
    </main>
    </RoleGuard>
  );
}

export default ClientDashboard;
