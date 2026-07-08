import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
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
} from "lucide-react";


import { getOrderPublic } from "@/lib/orders.functions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderFilesUpload from "@/components/OrderFilesUpload";

type ClientSearch = {
  order_id?: string;
};

const TIMELINE = [
  { label: "Commande reçue", statuses: ["nouveau"], icon: Inbox },
  { label: "Paiement confirmé", statuses: ["paiement_recu"], icon: CreditCard },
  { label: "Documents envoyés", statuses: ["documents_envoyes"], icon: Send },
  { label: "Rédaction en cours", statuses: ["en_cours", "redaction"], icon: PenTool },
  { label: "Document livré", statuses: ["livre"], icon: Package },
] as const;

const STATUS_LABELS: Record<string, string> = {
  nouveau: "Paiement en attente",
  paiement_recu: "Payé",
  documents_envoyes: "Documents envoyés",
  en_cours: "En préparation",
  redaction: "En rédaction",
  livre: "Livré",
};


function getStepState(orderStatus: string, stepIndex: number) {
  let currentStepIndex = -1;
  for (let i = 0; i < TIMELINE.length; i++) {
    if (TIMELINE[i].statuses.includes(orderStatus as never)) {
      currentStepIndex = i;
      break;
    }
  }
  if (currentStepIndex === -1) return "pending";
  if (stepIndex < currentStepIndex) return "completed";
  if (stepIndex === currentStepIndex) return "active";
  return "pending";
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "nouveau":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "paiement_recu":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "en_cours":
      return "bg-sky-100 text-sky-700 border-sky-200";
    case "redaction":
      return "bg-primary/10 text-primary border-primary/20";
    case "livre":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default:
      return "bg-muted text-muted-foreground";
  }
}

const orderQueryOptions = (orderId: string | null) =>
  queryOptions({
    queryKey: ["order-public", orderId ?? "none"],
    queryFn: async () => {
      if (!orderId) return null;
      return getOrderPublic({ data: { orderId } });
    },
  });

export const Route = createFileRoute("/client")({
  validateSearch: (search: Record<string, unknown>): ClientSearch => ({
    order_id: typeof search.order_id === "string" ? search.order_id : undefined,
  }),
  loaderDeps: ({ search }) => ({ orderId: search.order_id }),
  loader: async ({ context, deps }) => {
    if (deps.orderId) {
      await context.queryClient.ensureQueryData(orderQueryOptions(deps.orderId));
    }
  },
  head: () => ({
    meta: [
      { title: "Espace client — MémoirePro" },
      { name: "description", content: "Suivez vos commandes de rédaction." },
    ],
  }),
  component: ClientDashboard,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-serif text-destructive">Erreur de chargement</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-serif text-foreground">Aucune commande trouvée</h1>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  ),
});

function ClientDashboard() {
  const search = Route.useSearch();
  const orderId = search.order_id ?? null;
  const { data: order } = useSuspenseQuery(orderQueryOptions(orderId));

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-serif text-xl font-semibold text-foreground">
            MémoirePro
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <span className="text-foreground">Tableau de bord</span>
            <span className="cursor-not-allowed opacity-50">Mes commandes</span>
            <span className="cursor-not-allowed opacity-50">Messagerie</span>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-serif text-3xl font-semibold text-foreground">
          Votre espace client
        </h1>
        <p className="mt-2 text-muted-foreground">
          Suivez l'avancement de vos commandes en temps réel.
        </p>

        {order ? (
          <Card className="mt-8 border-border shadow-[var(--shadow-soft)]">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Commande{" "}
                    <span className="font-mono text-foreground">{order.id.slice(0, 8)}</span>
                  </p>
                  <CardTitle className="mt-1 max-w-lg font-serif text-xl">
                    {order.subject}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDocType(order.document_type)}
                    {order.pages ? ` · ${order.pages} pages` : ""}
                    {order.deadline
                      ? ` · Livraison avant le ${new Date(order.deadline).toLocaleDateString("fr-FR")}`
                      : ""}
                  </p>
                </div>
                <Badge variant="outline" className={statusBadgeClass(order.status)}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <StatusTimeline status={order.status} />

              {order.price_fcfa ? (
                <div className="mt-6 flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Montant total</span>
                  <span className="font-semibold text-foreground">
                    {order.price_fcfa.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              ) : null}

              <div className="mt-6 rounded-lg border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                <p>
                  Vous recevrez une notification par email à chaque changement de statut. Pour
                  toute question, contactez-nous par WhatsApp.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {order ? (
          <OrderFilesUpload
            orderId={order.id}
            instructions={order.instructions}
            existingCount={order.file_paths?.length ?? 0}
          />
        ) : null}

        {!order ? (
          <div className="mt-10 rounded-xl border border-border bg-card p-12 text-center shadow-[var(--shadow-soft)]">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-serif text-xl text-foreground">
              Aucune commande à afficher
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Passez une commande depuis l'accueil pour voir son statut ici après paiement.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function StatusTimeline({ status }: { status: string }) {
  return (
    <div className="relative">
      <div
        className="absolute left-5 top-10 bottom-4 w-px bg-border"
        aria-hidden
      />
      <div className="space-y-2">
        {TIMELINE.map((step, i) => {
          const state = getStepState(status, i);
          const Icon = step.icon;
          return (
            <div key={step.label} className="relative flex items-start gap-4 py-2">
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                  state === "completed"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : state === "active"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                }`}
              >
                {state === "completed" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className="pt-2">
                <p
                  className={`text-sm font-medium ${
                    state === "pending" ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {state === "active" ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">En cours…</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDocType(type: string) {
  const map: Record<string, string> = {
    memoire_licence: "Mémoire de licence",
    memoire_master: "Mémoire de master",
    rapport_stage: "Rapport de stage",
    correction: "Correction",
    autre: "Autre",
  };
  return map[type] ?? type;
}
