import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Bell, FileText, Inbox, Loader2, Lock, ShieldAlert, BookOpen, Download } from "lucide-react";
import api, { apiErr, API } from "../lib/api";
import { Button, Card, Badge, Input, Label, Select } from "../components/ui";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "mp_writer_key";
const STATUS_LABEL = {
  nouveau: "Paiement en attente", paiement_recu: "Payé", documents_envoyes: "Documents envoyés",
  en_cours: "En préparation", redaction: "En rédaction", livre: "Livré",
};
const STATUSES = ["nouveau", "paiement_recu", "documents_envoyes", "en_cours", "redaction", "livre"];

export default function Redacteur() {
  const { user } = useAuth();
  const isAdmin = user && user.role === "admin";
  const [accessKey, setAccessKey] = useState("");
  const [input, setInput] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) { setAccessKey(stored); setAuthed(true); }
    else if (isAdmin) { setAuthed(true); }
  }, [isAdmin]);

  const load = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    try {
      const { data } = await api.post("/writer/orders", { key: accessKey || undefined });
      setOrders(data);
    } catch (e) {
      toast.error(apiErr(e.response?.data?.detail) || "Accès refusé");
      if (e.response?.status === 403 && !isAdmin) { localStorage.removeItem(STORAGE_KEY); setAccessKey(""); setAuthed(false); }
    } finally { setLoading(false); }
  }, [accessKey, authed, isAdmin]);

  useEffect(() => {
    if (!authed) return;
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [authed, load]);

  const unseen = useMemo(() => orders.filter((o) => o.status === "documents_envoyes" && !o.writer_seen_at), [orders]);

  const markAllSeen = async () => {
    try {
      await api.post("/writer/mark-seen", { key: accessKey, all: true });
      toast.success("Notifications marquées comme lues");
      load();
    } catch (e) { toast.error(apiErr(e.response?.data?.detail)); }
  };

  const updateStatus = async (order_id, status) => {
    try {
      await api.post("/writer/update-status", { key: accessKey, order_id, status });
      toast.success(`Statut mis à jour : ${STATUS_LABEL[status] || status}`);
      load();
    } catch (e) { toast.error(apiErr(e.response?.data?.detail)); }
  };

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-6 shadow-[var(--shadow-elegant)]">
          <div className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-primary" /><h1 className="font-serif text-xl text-foreground">Accès rédacteur</h1></div>
          <p className="mt-4 text-sm text-muted-foreground">Saisissez la clé d'accès rédacteur pour consulter les commandes.</p>
          <div className="mt-4 space-y-2">
            <Label htmlFor="writer-key">Clé d'accès</Label>
            <Input id="writer-key" type="password" data-testid="writer-key-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="••••••••••••" />
          </div>
          <Button className="mt-4 w-full" data-testid="writer-login-btn" onClick={() => { if (!input) return; localStorage.setItem(STORAGE_KEY, input); setAccessKey(input); setAuthed(true); }}>Se connecter</Button>
          <p className="mt-4 text-center text-xs text-muted-foreground"><Link to="/" className="hover:underline">Retour à l'accueil</Link></p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold text-foreground"><BookOpen className="h-5 w-5 text-primary" /> MémoirePro · Rédaction</Link>
          <div className="flex items-center gap-3">
            <div className="relative"><Bell className="h-5 w-5 text-muted-foreground" />{unseen.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unseen.length}</span>}</div>
            <Button variant="ghost" size="sm" data-testid="writer-logout" onClick={() => { localStorage.removeItem(STORAGE_KEY); setAccessKey(""); setAuthed(false); }}>Se déconnecter</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {unseen.length > 0 && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border-2 border-indigo-300 bg-indigo-50 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-indigo-600 p-2 text-white"><Bell className="h-5 w-5" /></div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-indigo-900">{unseen.length} nouvelle{unseen.length > 1 ? "s" : ""} soumission{unseen.length > 1 ? "s" : ""} de documents</h2>
                <p className="mt-1 text-sm text-indigo-800/80">{unseen.slice(0, 3).map((o) => o.full_name).join(", ")}{unseen.length > 3 ? ` et ${unseen.length - 3} autre(s)` : ""} viennent de soumettre leurs fichiers.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" data-testid="writer-mark-all" onClick={markAllSeen}>Tout marquer comme vu</Button>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">Commandes en cours</h1>
            <p className="mt-1 text-sm text-muted-foreground">Mise à jour automatique toutes les 15 secondes.</p>
          </div>
          <Button variant="outline" size="sm" data-testid="writer-refresh" onClick={load}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualiser"}</Button>
        </div>

        <div className="grid gap-4">
          {orders.map((o) => {
            const isNew = o.status === "documents_envoyes" && !o.writer_seen_at;
            return (
              <Card key={o.id} className={`p-6 ${isNew ? "border-2 border-indigo-400 ring-2 ring-indigo-100" : ""}`} data-testid="writer-order-card">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {isNew && <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white"><Bell className="h-3 w-3" /> Nouveau</span>}
                      <span className="font-mono text-xs text-muted-foreground">{o.id.slice(0, 8)}</span>
                    </div>
                    <h3 className="mt-1 font-serif text-lg text-foreground">{o.subject}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{o.full_name} · {o.email}</p>
                  </div>
                  <Badge className="border-border">{STATUS_LABEL[o.status] ?? o.status}</Badge>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <div>Type : {o.document_type}</div>
                  <div>Pages : {o.pages ?? "—"}</div>
                  <div>Deadline : {o.deadline ? new Date(o.deadline).toLocaleDateString("fr-FR") : "—"}</div>
                  <div>Montant : {o.price_fcfa ? `${o.price_fcfa.toLocaleString("fr-FR")} FCFA` : "—"}</div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-1 text-muted-foreground"><FileText className="h-4 w-4" />{o.file_ids?.length ?? 0} document(s)</span>
                  {o.documents_submitted_at && <span className="inline-flex items-center gap-1 text-emerald-700"><Lock className="h-4 w-4" /> Soumis le {new Date(o.documents_submitted_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</span>}
                </div>
                {o.file_ids?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {o.file_ids.map((fid, i) => (
                      <a key={fid} href={`${API}/files/${fid}/download`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground hover:bg-secondary" data-testid="writer-file-link">
                        <Download className="h-3 w-3" /> Fichier {i + 1}
                      </a>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                  <Label className="text-xs">Changer le statut :</Label>
                  <Select className="h-9 max-w-xs" data-testid="writer-status-select" value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </Select>
                </div>
              </Card>
            );
          })}
          {!loading && orders.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-10 text-center"><Inbox className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">Aucune commande pour le moment.</p></div>
          )}
        </div>
      </div>
    </main>
  );
}
