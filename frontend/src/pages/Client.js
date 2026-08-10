import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  FileText, Inbox, CreditCard, PenTool, Package, CheckCircle2, ArrowLeft, Send,
  Upload, X, Loader2, Lock, BookOpen,
} from "lucide-react";
import api, { apiErr } from "../lib/api";
import { Button, Card, Badge, Label } from "../components/ui";
import { useAuth } from "../context/AuthContext";

const TIMELINE = [
  { label: "Commande reçue", statuses: ["nouveau"], icon: Inbox },
  { label: "Paiement confirmé", statuses: ["paiement_recu"], icon: CreditCard },
  { label: "Documents envoyés", statuses: ["documents_envoyes"], icon: Send },
  { label: "Rédaction en cours", statuses: ["en_cours", "redaction"], icon: PenTool },
  { label: "Document livré", statuses: ["livre"], icon: Package },
];
const STATUS_LABELS = {
  nouveau: "Paiement en attente", paiement_recu: "Payé", documents_envoyes: "Documents envoyés",
  en_cours: "En préparation", redaction: "En rédaction", livre: "Livré",
};
function statusBadge(s) {
  return {
    nouveau: "bg-amber-100 text-amber-700 border-amber-200",
    paiement_recu: "bg-emerald-100 text-emerald-700 border-emerald-200",
    documents_envoyes: "bg-indigo-100 text-indigo-700 border-indigo-200",
    en_cours: "bg-sky-100 text-sky-700 border-sky-200",
    redaction: "bg-primary/10 text-primary border-primary/20",
    livre: "bg-emerald-100 text-emerald-700 border-emerald-200",
  }[s] || "bg-muted text-muted-foreground border-border";
}
function docType(t) {
  return { memoire_licence: "Mémoire de licence", memoire_master: "Mémoire de master", rapport_stage: "Rapport de stage", correction: "Correction", autre: "Autre" }[t] || t;
}
function stepState(status, i) {
  let cur = -1;
  for (let j = 0; j < TIMELINE.length; j++) if (TIMELINE[j].statuses.includes(status)) { cur = j; break; }
  if (cur === -1) return "pending";
  return i < cur ? "completed" : i === cur ? "active" : "pending";
}

function Timeline({ status }) {
  return (
    <div className="relative">
      <div className="absolute left-5 top-10 bottom-4 w-px bg-border" />
      <div className="space-y-2">
        {TIMELINE.map((step, i) => {
          const st = stepState(status, i);
          const Icon = step.icon;
          return (
            <div key={step.label} className="relative flex items-start gap-4 py-2">
              <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${st === "completed" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : st === "active" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"}`}>
                {st === "completed" ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <div className="pt-2">
                <p className={`text-sm font-medium ${st === "pending" ? "text-muted-foreground" : "text-foreground"}`}>{step.label}</p>
                {st === "active" && <p className="mt-0.5 text-xs text-muted-foreground">En cours…</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilesUpload({ order, reload }) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const locked = Boolean(order.documents_submitted_at);
  const existingCount = order.file_ids?.length ?? 0;

  const onFiles = (list) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (f.size > 15 * 1024 * 1024) { toast.error(`${f.name} dépasse 15 Mo`); continue; }
      if (next.length + existingCount >= 20) break;
      next.push(f);
    }
    setFiles(next);
  };

  const onUpload = async () => {
    if (!files.length) return;
    setBusy(true);
    try {
      const ids = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const { data } = await api.post("/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        ids.push(data.id);
      }
      await api.post("/orders/attach-files", { order_id: order.id, file_ids: ids });
      toast.success(`${files.length} document(s) envoyé(s)`);
      setFiles([]);
      reload();
    } catch (e) {
      toast.error(apiErr(e.response?.data?.detail) || "Erreur lors de l'envoi");
    } finally { setBusy(false); }
  };

  const onSubmit = async () => {
    if (existingCount === 0) return toast.error("Envoyez au moins un document avant de le soumettre.");
    setBusy(true);
    try {
      await api.post("/orders/submit-documents", { order_id: order.id });
      toast.success("Documents soumis — le rédacteur a été notifié.");
      reload();
    } catch (e) {
      toast.error(apiErr(e.response?.data?.detail) || "Erreur lors de la soumission");
    } finally { setBusy(false); }
  };

  return (
    <Card className="mt-6 p-6 shadow-[var(--shadow-soft)]" >
      <h3 className="font-serif text-lg text-foreground">Documents à transmettre</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Ajoutez tout document utile au rédacteur (consignes, plan imposé, sujet officiel, cours…).
        {existingCount > 0 ? ` ${existingCount} déjà envoyé(s).` : ""}
      </p>
      {locked ? (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Documents verrouillés et transmis au rédacteur.</p>
            <p className="mt-1 text-emerald-800/80">Soumis le {new Date(order.documents_submitted_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}.</p>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <Label>Nouveaux fichiers</Label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/40 p-6 text-center transition hover:border-primary/40 hover:bg-secondary">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Cliquez ou glissez vos fichiers (PDF, Word, images — 15 Mo max)</span>
            <input type="file" multiple className="hidden" data-testid="client-file-input" onChange={(e) => onFiles(e.target.files)} />
          </label>
          {files.length > 0 && (
            <ul className="space-y-1">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 truncate"><FileText className="h-4 w-4 text-muted-foreground" /><span className="truncate">{f.name}</span></span>
                  <button type="button" className="text-muted-foreground hover:text-destructive" onClick={() => setFiles(files.filter((_, j) => j !== i))}><X className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" data-testid="client-upload-btn" onClick={onUpload} disabled={busy || files.length === 0}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : `Ajouter ${files.length > 0 ? `${files.length} fichier(s)` : "des fichiers"}`}
            </Button>
            <Button className="flex-1" data-testid="client-submit-docs-btn" onClick={onSubmit} disabled={busy || existingCount === 0 || files.length > 0}>
              <Send className="h-4 w-4" /> Soumettre mes documents
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function ClientDashboard() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (orderId) {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } else {
        setOrder(null);
      }
      if (user) {
        const { data } = await api.get("/orders");
        setOrders(data);
      } else {
        // fall back to locally-stored order ids
        try {
          const ids = JSON.parse(localStorage.getItem("mp_orders") || "[]");
          const results = await Promise.all(ids.map((id) => api.get(`/orders/${id}`).then((r) => r.data).catch(() => null)));
          setOrders(results.filter(Boolean));
        } catch { setOrders([]); }
      }
    } catch {
      setOrder(null);
    } finally { setLoading(false); }
  }, [orderId, user]);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold text-foreground"><BookOpen className="h-5 w-5 text-primary" /> MémoirePro</Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            {user && <button onClick={() => navigate("/editeur")} className="hover:text-foreground" data-testid="client-nav-editor">Éditeur IA</button>}
            {user ? (
              <button onClick={() => { logout(); navigate("/"); }} className="hover:text-foreground" data-testid="client-logout">Se déconnecter</button>
            ) : (
              <Link to="/connexion" className="hover:text-foreground" data-testid="client-login-link">Connexion</Link>
            )}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-serif text-3xl font-semibold text-foreground">Votre espace client</h1>
        <p className="mt-2 text-muted-foreground">Suivez l'avancement de vos commandes en temps réel.</p>

        {loading && <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>}

        {order && (
          <Card className="mt-8 p-0 shadow-[var(--shadow-soft)]" data-testid="order-detail">
            <div className="p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Commande <span className="font-mono text-foreground">{order.id.slice(0, 8)}</span></p>
                  <h2 className="mt-1 max-w-lg font-serif text-xl text-foreground">{order.subject}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {docType(order.document_type)}{order.pages ? ` · ${order.pages} pages` : ""}
                    {order.deadline ? ` · Livraison avant le ${new Date(order.deadline).toLocaleDateString("fr-FR")}` : ""}
                  </p>
                </div>
                <Badge className={statusBadge(order.status)}>{STATUS_LABELS[order.status] ?? order.status}</Badge>
              </div>
              <div className="mt-6"><Timeline status={order.status} /></div>
              {order.price_fcfa ? (
                <div className="mt-6 flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Montant total</span>
                  <span className="font-semibold text-foreground">{order.price_fcfa.toLocaleString("fr-FR")} FCFA</span>
                </div>
              ) : null}
            </div>
          </Card>
        )}

        {order && <FilesUpload order={order} reload={load} />}

        {!order && !loading && orders.length > 0 && (
          <div className="mt-8 space-y-3" data-testid="orders-list">
            <h2 className="font-serif text-lg text-foreground">Mes commandes</h2>
            {orders.map((o) => (
              <button key={o.id} onClick={() => navigate(`/client?order_id=${o.id}`)} className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/40" data-testid="order-list-item">
                <div>
                  <p className="font-medium text-foreground">{o.subject}</p>
                  <p className="text-xs text-muted-foreground">{docType(o.document_type)} · {new Date(o.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
                <Badge className={statusBadge(o.status)}>{STATUS_LABELS[o.status] ?? o.status}</Badge>
              </button>
            ))}
          </div>
        )}

        {!order && !loading && orders.length === 0 && (
          <div className="mt-10 rounded-xl border border-border bg-card p-12 text-center shadow-[var(--shadow-soft)]">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-serif text-xl text-foreground">Aucune commande à afficher</h3>
            <p className="mt-2 text-sm text-muted-foreground">Passez une commande depuis l'accueil pour voir son statut ici.</p>
            <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"><ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil</Link>
          </div>
        )}
      </div>
    </main>
  );
}
