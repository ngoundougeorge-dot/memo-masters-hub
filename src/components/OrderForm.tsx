import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Upload, Loader2, CheckCircle2, FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { submitOrder } from "@/lib/orders.functions";

const schema = z.object({
  full_name: z.string().trim().min(2, "Nom trop court"),
  email: z.string().trim().email("Email invalide"),
  phone: z.string().trim().min(6, "Numéro invalide"),
  document_type: z.enum([
    "memoire_licence",
    "memoire_master",
    "rapport_stage",
    "correction",
    "autre",
  ]),
  academic_level: z.string().trim().max(120).optional().or(z.literal("")),
  subject: z.string().trim().min(5, "Décrivez brièvement votre sujet"),
  instructions: z.string().trim().max(5000).optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
  pages: z.coerce.number().int().positive().max(1000).optional().or(z.nan()),
  payment_method: z.string().optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

const MAX_SIZE = 15 * 1024 * 1024; // 15 MB

export default function OrderForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const submit = useServerFn(submitOrder);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { document_type: "memoire_licence", payment_method: "orange_money" },
  });

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name} dépasse 15 Mo`);
        continue;
      }
      if (next.length >= 20) break;
      next.push(f);
    }
    setFiles(next);
  };

  const onSubmit = async (values: FormValues) => {
    setUploading(true);
    try {
      const paths: string[] = [];
      const folder = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      for (const file of files) {
        const safe = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${folder}/${safe}`;
        const { error } = await supabase.storage
          .from("order-uploads")
          .upload(path, file, { upsert: false });
        if (error) throw new Error(`Envoi ${file.name} échoué : ${error.message}`);
        paths.push(path);
      }
      const res = await submit({
        data: {
          full_name: values.full_name,
          email: values.email,
          phone: values.phone,
          document_type: values.document_type,
          academic_level: values.academic_level || undefined,
          subject: values.subject,
          instructions: values.instructions || undefined,
          deadline: values.deadline || undefined,
          pages: values.pages && !Number.isNaN(values.pages) ? Number(values.pages) : undefined,
          payment_method: values.payment_method || undefined,
          file_paths: paths,
        },
      });
      setDone(res.id);
      try {
        const raw = localStorage.getItem("memoirepro_orders");
        const existing: string[] = raw ? JSON.parse(raw) : [];
        if (!existing.includes(res.id)) {
          localStorage.setItem("memoirepro_orders", JSON.stringify([...existing, res.id]));
        }
      } catch {
        // ignore localStorage errors
      }
      form.reset();
      setFiles([]);
      toast.success("Commande envoyée avec succès !");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de l'envoi");
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-4 font-serif text-2xl text-foreground">Commande reçue</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Référence <span className="font-mono text-foreground">{done.slice(0, 8)}</span>. Notre
          équipe vous contacte sous 24h avec les instructions de paiement Mobile Money.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setDone(null)}>
          Nouvelle commande
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nom complet *</Label>
          <Input id="full_name" {...form.register("full_name")} placeholder="Aïcha Diallo" />
          {form.formState.errors.full_name && (
            <p className="text-xs text-destructive">{form.formState.errors.full_name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...form.register("email")} placeholder="vous@exemple.com" />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone (WhatsApp) *</Label>
          <Input id="phone" {...form.register("phone")} placeholder="+225 07 00 00 00 00" />
          {form.formState.errors.phone && (
            <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="academic_level">Établissement / niveau</Label>
          <Input
            id="academic_level"
            {...form.register("academic_level")}
            placeholder="Université Cheikh Anta Diop — Master 2"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Type de document *</Label>
          <Select
            defaultValue="memoire_licence"
            onValueChange={(v) => form.setValue("document_type", v as FormValues["document_type"])}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="memoire_licence">Mémoire de licence</SelectItem>
              <SelectItem value="memoire_master">Mémoire de master</SelectItem>
              <SelectItem value="rapport_stage">Rapport de stage</SelectItem>
              <SelectItem value="correction">Correction / relecture</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pages">Pages estimées</Label>
            <Input id="pages" type="number" min={1} {...form.register("pages")} placeholder="60" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Date limite</Label>
            <Input id="deadline" type="date" {...form.register("deadline")} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Sujet de rédaction *</Label>
        <Textarea
          id="subject"
          {...form.register("subject")}
          rows={3}
          placeholder="Ex. : L'impact du mobile banking sur l'inclusion financière en Afrique de l'Ouest."
        />
        {form.formState.errors.subject && (
          <p className="text-xs text-destructive">{form.formState.errors.subject.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Consignes de l'établissement</Label>
        <Textarea
          id="instructions"
          {...form.register("instructions")}
          rows={4}
          placeholder="Nombre de pages, style de citation (APA, Harvard), plan imposé, langue, etc."
        />
      </div>

      <div className="space-y-2">
        <Label>Documents à joindre (consignes, PDF, cours)</Label>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/40 p-6 text-center transition hover:border-primary/40 hover:bg-secondary">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Cliquez ou glissez vos fichiers ici (PDF, Word, images — max 15 Mo chacun)
          </span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
        {files.length > 0 && (
          <ul className="mt-2 space-y-1">
            {files.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{f.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(f.size / 1024 / 1024).toFixed(1)} Mo)
                  </span>
                </span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <Label>Mode de paiement souhaité</Label>
        <Select
          defaultValue="orange_money"
          onValueChange={(v) => form.setValue("payment_method", v)}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="orange_money">Orange Money</SelectItem>
            <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
            <SelectItem value="wave">Wave</SelectItem>
            <SelectItem value="moov">Moov Money</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Vous recevrez les instructions de paiement par WhatsApp après validation de votre commande.
        </p>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={uploading}>
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours…
          </>
        ) : (
          "Envoyer ma commande"
        )}
      </Button>
    </form>
  );
}
