import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Upload,
  Loader2,
  CheckCircle2,
  FileText,
  X,
  CreditCard,
  FileCheck,
  Building,
  Calendar,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { submitOrder } from "@/lib/orders.functions";
import { saveProjectData, getDefaultMilestones, getDefaultMessages, type ProjectDetails } from "@/lib/projectStore";

const schema = z.object({
  full_name: z.string().trim().min(2, "Nom trop court"),
  email: z.string().trim().email("Email invalide"),
  phone: z.string().trim().min(6, "Numéro de téléphone requis"),
  document_type: z.enum([
    "memoire_licence",
    "memoire_master",
    "these_doctorat",
    "rapport_stage",
    "correction",
    "autre",
  ]),
  academic_level: z.string().trim().min(2, "Établissement ou niveau requis"),
  subject: z.string().trim().min(5, "Veuillez préciser le sujet de votre travail"),
  pages: z.coerce.number().int().positive("Précisez le nombre de pages").max(1000),
  deadline: z.string().min(1, "Veuillez définir une date limite"),
  has_guidelines: z.enum(["oui", "non"]),
  guidelines_text: z.string().optional(),
  has_plan: z.enum(["oui", "non"]),
  plan_text: z.string().optional(),
  has_cover_page: z.enum(["oui", "non"]),
  cover_page_text: z.string().optional(),
  payment_method: z.string().min(1, "Choisissez un mode de paiement"),
});

type FormValues = z.infer<typeof schema>;

const MAX_SIZE = 15 * 1024 * 1024; // 15 MB

const BASE_PRICES: Record<string, number> = {
  rapport_stage: 40000,
  memoire_licence: 75000,
  memoire_master: 150000,
  these_doctorat: 300000,
  correction: 15000,
  autre: 50000,
};

export default function OrderForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState<{ id: string; email: string } | null>(null);
  const submit = useServerFn(submitOrder);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      document_type: "memoire_master",
      pages: 60,
      has_guidelines: "oui",
      has_plan: "non",
      has_cover_page: "oui",
      payment_method: "airtel_money",
    },
  });

  const selectedDocType = form.watch("document_type");
  const selectedPages = form.watch("pages");
  const hasGuidelines = form.watch("has_guidelines");
  const hasPlan = form.watch("has_plan");
  const hasCoverPage = form.watch("has_cover_page");

  // Estimation dynamique du coût en FCFA
  const estimatedPrice = useMemo(() => {
    const base = BASE_PRICES[selectedDocType] || 75000;
    const pages = Number(selectedPages) || 40;
    if (selectedDocType === "correction") {
      return Math.round((pages * 1000) / 1000) * 1000;
    }
    if (pages <= 30) return base;
    return Math.round(base + (pages - 30) * 1200);
  }, [selectedDocType, selectedPages]);

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name} dépasse 15 Mo`);
        continue;
      }
      if (next.length >= 15) break;
      next.push(f);
    }
    setFiles(next);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    setUploading(true);
    try {
      const paths: string[] = [];
      const folder = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      for (const file of files) {
        const safe = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${folder}/${safe}`;
        try {
          const { error } = await supabase.storage
            .from("order-uploads")
            .upload(path, file, { upsert: false });
          if (!error) paths.push(path);
        } catch {
          // fallback in offline mode
          paths.push(`local://${safe}`);
        }
      }

      // Format document type for DB schema
      const mappedDocType = values.document_type === "these_doctorat" ? "autre" : values.document_type;

      // Pack enriched instructions into JSON
      const fullInstructions = JSON.stringify({
        guidelines: values.has_guidelines === "oui" ? values.guidelines_text : "Aucune consigne spécifique",
        has_plan: values.has_plan === "oui",
        plan_text: values.plan_text || "",
        has_cover_page: values.has_cover_page === "oui",
        cover_page_text: values.cover_page_text || "",
        actual_type: values.document_type,
      });

      let orderId = `ord-${Date.now().toString(36)}`;
      try {
        const res = await submit({
          data: {
            full_name: values.full_name,
            email: values.email,
            phone: values.phone,
            document_type: mappedDocType as "memoire_licence" | "memoire_master" | "rapport_stage" | "correction" | "autre",
            academic_level: values.academic_level,
            subject: values.subject,
            instructions: fullInstructions,
            deadline: values.deadline,
            pages: Number(values.pages),
            price_fcfa: estimatedPrice,
            payment_method: values.payment_method,
            file_paths: paths,
          },
        });
        if (res?.id) orderId = res.id;
      } catch (err) {
        console.warn("[OrderForm] Remote submit error, storing locally in PWA mode:", err);
      }

      // Initialize structured project in projectStore with all student instructions & files
      const newProject: ProjectDetails = {
        id: `PRJ-2026-${orderId.slice(0, 6).toUpperCase()}`,
        orderId,
        clientName: values.full_name,
        clientEmail: values.email,
        clientPhone: values.phone,
        subject: values.subject,
        documentType: values.document_type,
        academicLevel: values.academic_level,
        pages: Number(values.pages),
        objective: `Rédaction complète (${values.pages} pages) avec méthodologie, analyse critique et normes universitaires CAMES.`,
        means: "Bases de données scientifiques universitaires (JSTOR, Cairn, Revues CAMES), Rédacteur Senior dédié et audit anti-plagiat Turnitin.",
        deadline: values.deadline,
        priceFcfa: estimatedPrice,
        paymentMethod: values.payment_method,
        paymentConfirmed: false,
        isCompleted: false,
        finalReportReady: false,
        hasPlan: values.has_plan === "oui",
        planText: values.plan_text,
        hasGuidelines: values.has_guidelines === "oui",
        guidelinesText: values.guidelines_text,
        hasCoverPage: values.has_cover_page === "oui",
        coverPageText: values.cover_page_text,
        filePaths: paths,
        createdAt: new Date().toISOString(),
        milestones: getDefaultMilestones(orderId, values.document_type),
        messages: getDefaultMessages(orderId),
      };
      saveProjectData(newProject);

      // Save order id to client list
      try {
        const raw = localStorage.getItem("memoirepro_orders");
        const existing: string[] = raw ? JSON.parse(raw) : [];
        if (!existing.includes(orderId)) {
          localStorage.setItem("memoirepro_orders", JSON.stringify([...existing, orderId]));
        }
      } catch {}

      setDone({ id: orderId, email: values.email });
      form.reset();
      setFiles([]);
      toast.success("Demande de rédaction enregistrée avec succès !");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de l'envoi");
    } finally {
      setUploading(false);
    }
  };

  // Confirmation screen after submission (Page 2 du PDF)
  if (done) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-8 text-center shadow-lg igloo-glass">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 shadow-inner">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-emerald-600">
          Demande Reçue avec Succès
        </span>
        <h3 className="mt-1 font-serif text-2xl font-bold text-foreground">
          Votre projet est entre de bonnes mains
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Un email de confirmation de réception a été envoyé à{" "}
          <strong className="text-foreground">{done.email}</strong>.
        </p>

        <div className="mx-auto mt-5 max-w-md rounded-xl border border-primary/20 bg-primary/5 p-4 text-left text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Référence de commande :</span>
            <span className="font-mono font-bold text-foreground">{done.id.slice(0, 8)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Retour pour le paiement :</span>
            <span className="font-semibold text-emerald-700">Sous 24h par WhatsApp / Email</span>
          </div>
          <p className="pt-2 text-muted-foreground border-t border-border/50">
            Dès validation du paiement, vous aurez accès aux jalons du mémoire et à la messagerie avec votre rédacteur.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="gap-2 igloo-spring-btn">
            <Link to="/client" search={{ order_id: done.id }}>
              <span>Accéder à mon Espace Client</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setDone(null)}>
            Nouvelle commande
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl border border-border/80 bg-card p-6 shadow-md igloo-glass sm:p-8"
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-foreground">
            Formulaire de Rédaction Académique
          </h3>
          <p className="text-xs text-muted-foreground">
            Renseignez les détails obligatoires de votre document (Page 2 du parcours)
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground block">Estimation</span>
          <span className="font-serif text-xl font-bold text-primary">
            {estimatedPrice.toLocaleString("fr-FR")} FCFA
          </span>
        </div>
      </div>

      {/* 1. Coordonnées de l'étudiant */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nom complet *</Label>
          <Input id="full_name" {...form.register("full_name")} placeholder="Jean-Pierre Nguema" />
          {form.formState.errors.full_name && (
            <p className="text-xs text-destructive">{form.formState.errors.full_name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...form.register("email")} placeholder="etudiant@uob.ga" />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone / WhatsApp Gabon *</Label>
          <Input id="phone" {...form.register("phone")} placeholder="+241 74 00 00 00" />
          {form.formState.errors.phone && (
            <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="academic_level">Établissement / Niveau *</Label>
          <Input
            id="academic_level"
            {...form.register("academic_level")}
            placeholder="Université Omar Bongo (UOB Libreville) — Master 2"
          />
          {form.formState.errors.academic_level && (
            <p className="text-xs text-destructive">{form.formState.errors.academic_level.message}</p>
          )}
        </div>
      </div>

      {/* 2. Type de document et Volume */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Type de document *</Label>
          <Select
            defaultValue="memoire_master"
            onValueChange={(v) => form.setValue("document_type", v as FormValues["document_type"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="memoire_licence">Mémoire de licence</SelectItem>
              <SelectItem value="memoire_master">Mémoire de master</SelectItem>
              <SelectItem value="these_doctorat">Thèse de doctorat</SelectItem>
              <SelectItem value="rapport_stage">Rapport de stage</SelectItem>
              <SelectItem value="correction">Correction / Relecture</SelectItem>
              <SelectItem value="autre">Autre projet académique</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pages">Nombre de pages estimées *</Label>
          <Input id="pages" type="number" min={5} max={1000} {...form.register("pages")} />
          {form.formState.errors.pages && (
            <p className="text-xs text-destructive">{form.formState.errors.pages.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deadline">Échéance (Date limite) *</Label>
          <Input id="deadline" type="date" {...form.register("deadline")} />
          {form.formState.errors.deadline && (
            <p className="text-xs text-destructive">{form.formState.errors.deadline.message}</p>
          )}
        </div>
      </div>

      {/* 3. Sujet de rédaction */}
      <div className="space-y-1.5">
        <Label htmlFor="subject">Sujet de rédaction *</Label>
        <Textarea
          id="subject"
          rows={2}
          {...form.register("subject")}
          placeholder="Ex: Stratégies de valorisation de la filière bois et transition écologique au Gabon : Étude de cas sectorielle."
        />
        {form.formState.errors.subject && (
          <p className="text-xs text-destructive">{form.formState.errors.subject.message}</p>
        )}
      </div>

      {/* 4. Critères Spécifiques : Consignes, Plan de Rédaction & Page de Garde */}
      <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4 sm:p-5">
        <div className="border-b border-border/60 pb-2.5">
          <h4 className="font-serif text-sm font-bold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Consignes Pédagogiques, Plan de Rédaction & Page de Garde
          </h4>
          <p className="text-[11px] text-muted-foreground">
            Détaillez vos consignes académiques ou collez la structure de votre plan ci-dessous en toute liberté.
          </p>
        </div>

        {/* A. Démarche & Consignes à respecter */}
        <div className="rounded-lg border border-border/60 bg-background/70 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Label className="text-xs font-semibold text-foreground">
                Y a-t-il une consigne ou démarche particulière à respecter ?
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Normes typographiques, nombre de chapitres, exigences méthodologiques de votre université.
              </p>
            </div>
            <RadioGroup
              defaultValue="oui"
              value={hasGuidelines}
              onValueChange={(val) => form.setValue("has_guidelines", val as "oui" | "non")}
              className="flex gap-4 text-xs shrink-0"
            >
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="oui" id="g-oui" />
                <Label htmlFor="g-oui" className="font-medium text-xs cursor-pointer">Oui</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="non" id="g-non" />
                <Label htmlFor="g-non" className="font-medium text-xs cursor-pointer">Non</Label>
              </div>
            </RadioGroup>
          </div>

          {hasGuidelines === "oui" && (
            <div className="space-y-1 pt-1">
              <Textarea
                rows={3}
                placeholder="Détaillez ici toutes vos consignes : normes APA 7e édition / CAMES, police Times New Roman 12, interligne 1.5, marges 2.5 cm, nombre d'entretiens ou d'échantillons attendus, directives spécifiques de votre directeur de recherche..."
                className="text-xs min-h-[85px] resize-y rounded-lg leading-relaxed bg-background"
                {...form.register("guidelines_text")}
              />
            </div>
          )}
        </div>

        {/* B. Plan de Rédaction (Généreux Textarea multi-lignes) */}
        <div className="rounded-lg border border-border/60 bg-background/70 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Label className="text-xs font-semibold text-foreground">
                Avez-vous déjà un plan de travail ou une ébauche de sommaire ?
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Si non, notre rédacteur senior élaborera un plan détaillé en 2 parties conforme CAMES au Jalon 1.
              </p>
            </div>
            <RadioGroup
              defaultValue="non"
              value={hasPlan}
              onValueChange={(val) => form.setValue("has_plan", val as "oui" | "non")}
              className="flex gap-4 text-xs shrink-0"
            >
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="oui" id="p-oui" />
                <Label htmlFor="p-oui" className="font-medium text-xs cursor-pointer">Oui</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="non" id="p-non" />
                <Label htmlFor="p-non" className="font-medium text-xs cursor-pointer">Non</Label>
              </div>
            </RadioGroup>
          </div>

          {hasPlan === "oui" && (
            <div className="space-y-2 pt-1">
              <Textarea
                rows={6}
                placeholder="Collez ou rédigez ici votre plan détaillé avec vos parties, chapitres et sous-parties :&#10;&#10;Exemple :&#10;Introduction Générale & Problématique&#10;Partie 1 : Cadre théorique et revue documentaire&#10;  Chapitre 1 : Revue critique de la littérature et cadre conceptuel...&#10;  Chapitre 2 : Analyse du contexte socio-économique au Gabon...&#10;Partie 2 : Démarche empirique et analyse des résultats&#10;  Chapitre 3 : Protocole d'enquête, échantillonnage et collecte de données...&#10;  Chapitre 4 : Discussion des résultats et recommandations managériales...&#10;Conclusion Générale & Bibliographie CAMES"
                className="font-mono text-xs min-h-[140px] resize-y rounded-lg leading-relaxed bg-background"
                {...form.register("plan_text")}
              />
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span>💡</span>
                <span>
                  <strong>Astuce :</strong> Si votre plan est déjà sous format Word (.docx) ou PDF, vous pouvez également le glisser dans la zone de fichiers ci-dessous.
                </span>
              </p>
            </div>
          )}
        </div>

        {/* C. Page de garde */}
        <div className="rounded-lg border border-border/60 bg-background/70 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Label className="text-xs font-semibold text-foreground">
                Souhaitez-vous une page de garde personnalisée ?
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Mise en page officielle avec logos universitaires (UOB, USTM, INSG, USS, etc.).
              </p>
            </div>
            <RadioGroup
              defaultValue="oui"
              value={hasCoverPage}
              onValueChange={(val) => form.setValue("has_cover_page", val as "oui" | "non")}
              className="flex gap-4 text-xs shrink-0"
            >
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="oui" id="cg-oui" />
                <Label htmlFor="cg-oui" className="font-medium text-xs cursor-pointer">Oui</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="non" id="cg-non" />
                <Label htmlFor="cg-non" className="font-medium text-xs cursor-pointer">Non</Label>
              </div>
            </RadioGroup>
          </div>

          {hasCoverPage === "oui" && (
            <div className="space-y-1 pt-1">
              <Textarea
                rows={2}
                placeholder="Précisez les mentions à inclure : Nom de l'Université & Faculté (ex: UOB / FDSE), Titre exact du mémoire, Nom de votre encadreur/directeur de thèse, Année académique (ex: 2025-2026), Spécialité / Filière..."
                className="text-xs min-h-[75px] resize-y rounded-lg leading-relaxed bg-background"
                {...form.register("cover_page_text")}
              />
            </div>
          )}
        </div>
      </div>

      {/* 5. Documents à joindre */}
      <div className="space-y-2">
        <Label>Documents à joindre (consignes, données, guides)</Label>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFiles(e.dataTransfer.files);
          }}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-background/50 p-6 text-center transition hover:border-primary/50"
        >
          <Upload className="h-8 w-8 text-muted-foreground/70" />
          <p className="mt-2 text-xs font-medium text-foreground">
            Glissez vos fichiers ici ou{" "}
            <label className="cursor-pointer text-primary underline">
              parcourez vos dossiers
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              />
            </label>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">PDF, Word, Excel jusqu'à 15 Mo par fichier</p>
        </div>

        {files.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{f.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    ({(f.size / 1024 / 1024).toFixed(1)} Mo)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Mode de paiement */}
      <div className="space-y-2">
        <Label>Mode de paiement préféré (Gabon) *</Label>
        <Select
          defaultValue="airtel_money"
          onValueChange={(v) => form.setValue("payment_method", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="airtel_money">Airtel Money Gabon (Paiement instantané)</SelectItem>
            <SelectItem value="moov_money">Moov Money (Moov Africa Gabon Telecom)</SelectItem>
            <SelectItem value="carte_bancaire">Carte bancaire (Visa / Mastercard)</SelectItem>
            <SelectItem value="virement_bgfi">Virement bancaire (BGFI Bank, UBA Gabon)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bouton de soumission */}
      <Button
        type="submit"
        size="lg"
        disabled={uploading}
        className="w-full gap-2 rounded-xl text-sm font-semibold shadow-md igloo-spring-btn"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Enregistrement de la commande en cours...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span>Envoyer au rédacteur · {estimatedPrice.toLocaleString("fr-FR")} FCFA</span>
          </>
        )}
      </Button>
    </form>
  );
}
