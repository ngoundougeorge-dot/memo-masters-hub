import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronDown, ChevronUp, CircleDot, FileText, Inbox, Loader2, Lock, ShieldAlert } from "lucide-react";

import { listWriterOrders } from "@/lib/orders.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OrderRow = {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  document_type: string;
  status: string;
  price_fcfa: number | null;
  pages: number | null;
  deadline: string | null;
  created_at: string;
  documents_submitted_at: string | null;
  file_paths: string[] | null;
};

function buildHistory(o: OrderRow) {
  const events: { label: string; at: string }[] = [
    { label: "Commande reçue", at: o.created_at },
  ];
  if (["paiement_recu", "documents_envoyes", "en_cours", "redaction", "livre"].includes(o.status)) {
    // paiement confirmé — pas d'horodatage dédié, on utilise created_at comme proxy si absent
    events.push({ label: "Paiement confirmé", at: o.created_at });
  }
  if (o.documents_submitted_at) {
    events.push({ label: "Documents soumis par le client", at: o.documents_submitted_at });
  }
  if (["en_cours", "redaction"].includes(o.status)) {
    events.push({ label: "Rédaction démarrée", at: o.documents_submitted_at ?? o.created_at });
  }
  if (o.status === "livre") {
    events.push({ label: "Document livré", at: o.documents_submitted_at ?? o.created_at });
  }
  return events;
}

const STORAGE_KEY = "memoirepro:writer_key";

type Search = { key?: string };

export const Route = createFileRoute("/redacteur")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): Search => ({
    key: typeof s.key === "string" ? s.key : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Espace rédacteur — MémoirePro" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WriterDashboard,
});

const STATUS_LABEL: Record<string, string> = {
  nouveau: "Paiement en attente",
  paiement_recu: "Payé",
  documents_envoyes: "Documents envoyés",
  en_cours: "En préparation",
  redaction: "En rédaction",
  livre: "Livré",
};

function WriterDashboard() {
  const search = Route.useSearch();
  const [accessKey, setAccessKey] = useState<string>("");
  const [input, setInput] = useState("");
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const initial = search.key || stored || "";
    if (initial) setAccessKey(initial);
    const seenRaw = typeof window !== "undefined" ? localStorage.getItem("memoirepro:writer_seen") : null;
    if (seenRaw) {
      try {
        setSeenIds(new Set(JSON.parse(seenRaw) as string[]));
      } catch {
        /* ignore */
      }
    }
  }, [search.key]);

  const query = useQuery({
    queryKey: ["writer-orders", accessKey],
    queryFn: () => listWriterOrders({ data: { key: accessKey } }),
    enabled: accessKey.length > 0,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const submitted = useMemo(
    () => (query.data ?? []).filter((o) => o.status === "documents_envoyes"),
    [query.data],
  );
  const unseen = useMemo(
    () => submitted.filter((o) => !seenIds.has(o.id)),
    [submitted, seenIds],
  );

  const markAllSeen = () => {
    const next = new Set(seenIds);
    submitted.forEach((o) => next.add(o.id));
    setSeenIds(next);
    localStorage.setItem("memoirepro:writer_seen", JSON.stringify([...next]));
  };

  if (!accessKey) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <CardTitle className="font-serif">Accès rédacteur</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Saisissez la clé d'accès rédacteur pour consulter les commandes.
            </p>
            <div className="space-y-2">
              <Label htmlFor="writer-key">Clé d'accès</Label>
              <Input
                id="writer-key"
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (!input) return;
                localStorage.setItem(STORAGE_KEY, input);
                setAccessKey(input);
              }}
            >
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-serif text-xl font-semibold text-foreground">
            MémoirePro · Rédaction
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unseen.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unseen.length}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setAccessKey("");
              }}
            >
              Se déconnecter
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {unseen.length > 0 && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border-2 border-indigo-300 bg-indigo-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-indigo-600 p-2 text-white">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-indigo-900">
                  {unseen.length} nouvelle{unseen.length > 1 ? "s" : ""} soumission
                  {unseen.length > 1 ? "s" : ""} de documents
                </h2>
                <p className="mt-1 text-sm text-indigo-800/80">
                  {unseen
                    .slice(0, 3)
                    .map((o) => o.full_name)
                    .join(", ")}
                  {unseen.length > 3 ? ` et ${unseen.length - 3} autre(s)` : ""} viennent de
                  soumettre leurs fichiers.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={markAllSeen}>
              Tout marquer comme vu
            </Button>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              Commandes en cours
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Mise à jour automatique toutes les 15 secondes.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            {query.isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Actualiser"
            )}
          </Button>
        </div>

        {query.isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {(query.error as Error).message}
          </div>
        ) : null}

        {query.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
          </div>
        ) : null}

        <div className="grid gap-4">
          {(query.data ?? []).map((o) => {
            const isNew = o.status === "documents_envoyes" && !seenIds.has(o.id);
            return (
              <Card
                key={o.id}
                className={
                  isNew
                    ? "border-2 border-indigo-400 shadow-md ring-2 ring-indigo-100"
                    : "border-border"
                }
              >
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {isNew && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                            <Bell className="h-3 w-3" /> Nouveau
                          </span>
                        )}
                        <span className="font-mono text-xs text-muted-foreground">
                          {o.id.slice(0, 8)}
                        </span>
                      </div>
                      <CardTitle className="mt-1 font-serif text-lg">{o.subject}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {o.full_name} · {o.email}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {STATUS_LABEL[o.status] ?? o.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <div>Type : {o.document_type}</div>
                    <div>Pages : {o.pages ?? "—"}</div>
                    <div>
                      Deadline :{" "}
                      {o.deadline
                        ? new Date(o.deadline).toLocaleDateString("fr-FR")
                        : "—"}
                    </div>
                    <div>Montant : {o.price_fcfa ? `${o.price_fcfa.toLocaleString("fr-FR")} FCFA` : "—"}</div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {o.file_paths?.length ?? 0} document(s)
                    </span>
                    {o.documents_submitted_at && (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <Lock className="h-4 w-4" />
                        Soumis le{" "}
                        {new Date(o.documents_submitted_at).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {query.data && query.data.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">Aucune commande pour le moment.</p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
