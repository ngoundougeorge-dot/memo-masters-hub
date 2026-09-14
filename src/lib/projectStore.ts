/**
 * MemoMasters Hub — Store de Gestion de Projet, Jalons & Messagerie Interne
 * Supporte la synchronisation locale PWA, Supabase et Firebase Firestore
 */
import { syncOrderToFirebase, updateFirebaseOrderStatus } from "@/integrations/firebase";

export type Milestone = {
  id: string;
  orderId: string;
  title: string;
  stepNumber: number;
  contentPreview: string;
  status: "en_attente" | "en_cours" | "soumis" | "valide";
  submittedAt?: string;
  writerNotes?: string;
};

export type ProjectMessage = {
  id: string;
  orderId: string;
  sender: "client" | "redacteur";
  senderName: string;
  content: string;
  createdAt: string;
};

export type ProjectDetails = {
  id: string; // ex: PRJ-2026-8A3F
  orderId: string;
  userId?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  subject: string;
  documentType: string;
  academicLevel?: string;
  pages?: number;
  objective: string;
  means: string;
  deadline: string;
  priceFcfa: number;
  paymentMethod?: string;
  paymentConfirmed: boolean;
  isCompleted: boolean;
  finalReportReady: boolean;
  finalReportUrl?: string;
  hasPlan: boolean;
  planText?: string;
  hasGuidelines: boolean;
  guidelinesText?: string;
  hasCoverPage: boolean;
  coverPageText?: string;
  filePaths?: string[];
  createdAt?: string;
  milestones: Milestone[];
  messages: ProjectMessage[];
};

const STORAGE_PREFIX = "memoirepro_project_";
const ALL_ORDERS_INDEX_KEY = "memoirepro_all_orders_index";

// Mock template milestones when project is activated
export function getDefaultMilestones(orderId: string, docType: string): Milestone[] {
  return [
    {
      id: `ms-${orderId}-1`,
      orderId,
      title: "Jalon 1 : Cadrage, Problématique & Plan détaillé",
      stepNumber: 1,
      contentPreview:
        "Validation de la question de recherche, des objectifs généraux et spécifiques, et de la structure du plan en 2 parties et 4 chapitres.",
      status: "valide",
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      writerNotes: "Plan aligné avec les consignes méthodologiques du directeur de mémoire.",
    },
    {
      id: `ms-${orderId}-2`,
      orderId,
      title: "Jalon 2 : Revue de Littérature & Cadre Théorique",
      stepNumber: 2,
      contentPreview:
        "Synthèse des auteurs de référence (25 articles et ouvrages académiques récents), définitions des concepts opératoires et hypothèses.",
      status: "soumis",
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      writerNotes: "Revue théorique complète rédigée. Merci de consulter et donner votre avis.",
    },
    {
      id: `ms-${orderId}-3`,
      orderId,
      title: "Jalon 3 : Méthodologie, Analyse des Données & Résultats",
      stepNumber: 3,
      contentPreview:
        "Traitement du corpus documentaire, analyse statistique / qualitative et interprétation des résultats empiriques.",
      status: "en_cours",
      writerNotes: "Rédaction en cours d'achèvement.",
    },
    {
      id: `ms-${orderId}-4`,
      orderId,
      title: "Jalon 4 : Conclusion, Recommandations & Bibliographie APA",
      stepNumber: 4,
      contentPreview:
        "Synthèse finale, limites de l'étude, recommandations managériales/scientifiques et bibliographie normalisée.",
      status: "en_attente",
      writerNotes: "Dernière étape avant finalisation globale.",
    },
  ];
}

export function getDefaultMessages(orderId: string): ProjectMessage[] {
  return [
    {
      id: `msg-${orderId}-1`,
      orderId,
      sender: "redacteur",
      senderName: "Dr. Stéphane Ondo (Rédacteur)",
      content:
        "Bonjour ! J'ai bien pris en compte votre sujet et vos consignes. Le plan détaillé a été finalisé et est disponible dans l'onglet Jalons pour votre consultation.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];
}

export function getProjectData(orderId: string, fallbackSubject?: string): ProjectDetails {
  if (typeof window === "undefined") {
    return createEmptyProject(orderId, fallbackSubject);
  }

  const stored = localStorage.getItem(`${STORAGE_PREFIX}${orderId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }

  const initial = createEmptyProject(orderId, fallbackSubject);
  saveProjectData(initial);
  return initial;
}

export function saveProjectData(project: ProjectDetails): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_PREFIX}${project.orderId}`, JSON.stringify(project));

  // Maintain master index of all projects for the admin / writer
  try {
    const raw = localStorage.getItem(ALL_ORDERS_INDEX_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(project.orderId)) {
      localStorage.setItem(ALL_ORDERS_INDEX_KEY, JSON.stringify([project.orderId, ...list]));
    }
  } catch {}

  // Synchronisation Firebase Firestore en tâche de fond
  syncOrderToFirebase(project).catch((err) => {
    console.warn("[projectStore] Synchronisation Firestore en arrière-plan:", err);
  });
}

export function getAllProjects(): ProjectDetails[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ALL_ORDERS_INDEX_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return list.map((id) => getProjectData(id)).filter(Boolean);
  } catch {
    return [];
  }
}

function createEmptyProject(orderId: string, subject?: string): ProjectDetails {
  const shortId = orderId.slice(0, 6).toUpperCase();
  return {
    id: `PRJ-2026-${shortId}`,
    orderId,
    subject: subject || "Rédaction Académique Personnalisée",
    documentType: "memoire_master",
    academicLevel: "Université — Master 2",
    objective:
      "Rédaction complète et originale avec problématique, revue de littérature, démarche méthodologique rigoureuse et références vérifiées.",
    means:
      "Bases de données universitaires et revues scientifiques (Cairn, JSTOR, CAMES), Rédacteur Senior spécialisé et audit anti-plagiat Turnitin.",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString(),
    priceFcfa: 150000,
    paymentConfirmed: false,
    isCompleted: false,
    finalReportReady: false,
    finalReportUrl: "#",
    hasPlan: true,
    planText: "Plan en deux parties et 4 chapitres avec approche empirique.",
    hasGuidelines: true,
    guidelinesText: "Police Times New Roman 12, interligne 1.5, normes bibliographiques APA 7e.",
    hasCoverPage: true,
    coverPageText: "Mentionner l'Université, l'UFR, le Directeur de recherche et l'année académique 2025-2026.",
    milestones: getDefaultMilestones(orderId, "memoire_master"),
    messages: getDefaultMessages(orderId),
  };
}

// Action: Confirm payment
export function setProjectPaymentConfirmed(orderId: string, confirmed: boolean): ProjectDetails {
  const proj = getProjectData(orderId);
  proj.paymentConfirmed = confirmed;
  saveProjectData(proj);
  updateFirebaseOrderStatus(orderId, {
    paymentConfirmed: confirmed,
    status: confirmed ? "en_cours" : "projet_créé",
  }).catch(() => {});
  return proj;
}

// Action: Mark project as completed (unlocks final report download)
export function setProjectCompleted(orderId: string, completed: boolean): ProjectDetails {
  const proj = getProjectData(orderId);
  proj.isCompleted = completed;
  proj.finalReportReady = completed;
  if (completed) {
    // mark all milestones valid
    proj.milestones = proj.milestones.map((m) => ({ ...m, status: "valide" }));
  }
  saveProjectData(proj);
  updateFirebaseOrderStatus(orderId, {
    paymentConfirmed: true,
    status: completed ? "terminé" : "en_cours",
  }).catch(() => {});
  return proj;
}

// Action: Send a message in project
export function addProjectMessage(
  orderId: string,
  sender: "client" | "redacteur",
  senderName: string,
  content: string
): ProjectDetails {
  const proj = getProjectData(orderId);
  const newMsg: ProjectMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    orderId,
    sender,
    senderName,
    content,
    createdAt: new Date().toISOString(),
  };
  proj.messages.push(newMsg);
  saveProjectData(proj);
  return proj;
}

// Action: Add or update milestone
export function updateProjectMilestone(
  orderId: string,
  milestoneId: string,
  updates: Partial<Milestone>
): ProjectDetails {
  const proj = getProjectData(orderId);
  proj.milestones = proj.milestones.map((m) => (m.id === milestoneId ? { ...m, ...updates } : m));
  saveProjectData(proj);
  return proj;
}

export function addNewMilestone(
  orderId: string,
  title: string,
  contentPreview: string,
  writerNotes?: string
): ProjectDetails {
  const proj = getProjectData(orderId);
  const newMs: Milestone = {
    id: `ms-${Date.now()}`,
    orderId,
    stepNumber: proj.milestones.length + 1,
    title,
    contentPreview,
    status: "soumis",
    submittedAt: new Date().toISOString(),
    writerNotes,
  };
  proj.milestones.push(newMs);
  saveProjectData(proj);
  return proj;
}
