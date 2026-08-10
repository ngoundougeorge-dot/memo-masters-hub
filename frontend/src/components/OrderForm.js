import React, { useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2, CheckCircle2, FileText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { apiErr } from "../lib/api";
import { Button, Input, Textarea, Label, Select } from "./ui";

const MAX_SIZE = 15 * 1024 * 1024;

export default function OrderForm() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", document_type: "memoire_licence",
    academic_level: "", subject: "", instructions: "", deadline: "", pages: "",
    payment_method: "orange_money",
  });
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onFiles = (list) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (f.size > MAX_SIZE) { toast.error(`${f.name} dépasse 15 Mo`); continue; }
      if (next.length >= 20) break;
      next.push(f);
    }
    setFiles(next);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.full_name.trim().length < 2) return toast.error("Indiquez votre nom complet.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error("Email invalide.");
    if (form.phone.trim().length < 6) return toast.error("Numéro de téléphone invalide.");
    if (form.subject.trim().length < 5) return toast.error("Décrivez brièvement votre sujet.");
    setBusy(true);
    try {
      const fileIds = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const { data } = await api.post("/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        fileIds.push(data.id);
      }
      const { data } = await api.post("/orders", {
        full_name: form.full_name, email: form.email, phone: form.phone,
        document_type: form.document_type, academic_level: form.academic_level || null,
        subject: form.subject, instructions: form.instructions || null,
        deadline: form.deadline || null, pages: form.pages ? Number(form.pages) : null,
        payment_method: form.payment_method, file_ids: fileIds,
      });
      setDone(data.id);
      try {
        const raw = localStorage.getItem("mp_orders");
        const existing = raw ? JSON.parse(raw) : [];
        if (!existing.includes(data.id)) localStorage.setItem("mp_orders", JSON.stringify([...existing, data.id]));
      } catch {}
      toast.success("Commande envoyée avec succès !");
    } catch (err) {
      toast.error(apiErr(err.response?.data?.detail) || "Erreur lors de l'envoi");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div data-testid="order-success" className="rounded-xl border border-border bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-4 font-serif text-2xl text-foreground">Commande reçue</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Référence <span className="font-mono text-foreground">{done.slice(0, 8)}</span>. Suivez son
          avancement dans votre espace client.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button data-testid="track-order-btn" onClick={() => navigate(`/client?order_id=${done}`)}>Suivre ma commande</Button>
          <Button variant="outline" data-testid="new-order-btn" onClick={() => { setDone(null); setForm({ ...form, subject: "", instructions: "" }); }}>Nouvelle commande</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} data-testid="order-form" className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nom complet *</Label>
          <Input id="full_name" data-testid="order-full-name" value={form.full_name} onChange={set("full_name")} placeholder="Aïcha Diallo" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" data-testid="order-email" value={form.email} onChange={set("email")} placeholder="vous@exemple.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone (WhatsApp) *</Label>
          <Input id="phone" data-testid="order-phone" value={form.phone} onChange={set("phone")} placeholder="+225 07 00 00 00 00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="academic_level">Établissement / niveau</Label>
          <Input id="academic_level" data-testid="order-level" value={form.academic_level} onChange={set("academic_level")} placeholder="Université Cheikh Anta Diop — Master 2" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Type de document *</Label>
          <Select data-testid="order-doc-type" value={form.document_type} onChange={set("document_type")}>
            <option value="memoire_licence">Mémoire de licence</option>
            <option value="memoire_master">Mémoire de master</option>
            <option value="rapport_stage">Rapport de stage</option>
            <option value="correction">Correction / relecture</option>
            <option value="autre">Autre</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pages">Pages estimées</Label>
            <Input id="pages" type="number" min={1} data-testid="order-pages" value={form.pages} onChange={set("pages")} placeholder="60" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Date limite</Label>
            <Input id="deadline" type="date" data-testid="order-deadline" value={form.deadline} onChange={set("deadline")} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Sujet de rédaction *</Label>
        <Textarea id="subject" data-testid="order-subject" rows={3} value={form.subject} onChange={set("subject")}
          placeholder="Ex. : L'impact du mobile banking sur l'inclusion financière en Afrique de l'Ouest." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Consignes de l'établissement</Label>
        <Textarea id="instructions" data-testid="order-instructions" rows={4} value={form.instructions} onChange={set("instructions")}
          placeholder="Nombre de pages, style de citation (APA, Harvard), plan imposé, langue, etc." />
      </div>

      <div className="space-y-2">
        <Label>Documents à joindre (consignes, PDF, cours)</Label>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/40 p-6 text-center transition hover:border-primary/40 hover:bg-secondary">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Cliquez ou glissez vos fichiers ici (PDF, Word, images — max 15 Mo chacun)</span>
          <input type="file" multiple className="hidden" data-testid="order-file-input" onChange={(e) => onFiles(e.target.files)} />
        </label>
        {files.length > 0 && (
          <ul className="mt-2 space-y-1">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
                <span className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{f.name}</span>
                  <span className="text-xs text-muted-foreground">({(f.size / 1024 / 1024).toFixed(1)} Mo)</span>
                </span>
                <button type="button" className="text-muted-foreground hover:text-destructive" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <Label>Mode de paiement souhaité</Label>
        <Select data-testid="order-payment" value={form.payment_method} onChange={set("payment_method")}>
          <option value="orange_money">Orange Money</option>
          <option value="mtn_momo">MTN Mobile Money</option>
          <option value="wave">Wave</option>
          <option value="moov">Moov Money</option>
        </Select>
        <p className="text-xs text-muted-foreground">Vous recevrez les instructions de paiement par WhatsApp après validation de votre commande.</p>
      </div>

      <Button type="submit" size="lg" className="w-full" data-testid="order-submit" disabled={busy}>
        {busy ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi en cours…</>) : "Envoyer ma commande"}
      </Button>
    </form>
  );
}
