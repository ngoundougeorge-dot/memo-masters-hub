import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle, Lock, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { addOrderFiles, submitOrderDocuments } from "@/lib/orders.functions";

const MAX_SIZE = 15 * 1024 * 1024;
const ALLOWED = [".pdf", ".doc", ".docx", ".odt", ".txt", ".png", ".jpg", ".jpeg", ".webp"];


type ChecklistItem = { label: string; ok: boolean; hint?: string };

function buildChecklist(
  instructions: string | null,
  files: { name: string }[],
  existingCount: number,
): ChecklistItem[] {
  const text = (instructions ?? "").toLowerCase();
  const total = files.length + existingCount;
  const names = files.map((f) => f.name.toLowerCase()).join(" ");
  const items: ChecklistItem[] = [];

  items.push({
    label: "Au moins un document joint",
    ok: total >= 1,
    hint: "Ajoutez le sujet officiel, la maquette ou les consignes PDF.",
  });

  if (/plan|sommaire|table des matières/.test(text)) {
    items.push({
      label: "Plan / sommaire imposé fourni",
      ok: /plan|sommaire|table/.test(names),
      hint: "Nommez le fichier contenant le plan pour qu'il soit identifié.",
    });
  }
  if (/apa|harvard|iso[- ]?690|chicago|mla/.test(text)) {
    items.push({
      label: "Style de citation précisé dans les consignes",
      ok: true,
    });
  }
  if (/page/.test(text)) {
    items.push({
      label: "Nombre de pages mentionné",
      ok: true,
    });
  }
  if (/pdf/.test(text)) {
    items.push({
      label: "Consignes au format PDF fournies",
      ok: /\.pdf$/.test(names) || files.some((f) => f.name.toLowerCase().endsWith(".pdf")),
    });
  }
  items.push({
    label: "Formats de fichiers acceptés",
    ok: files.every((f) => ALLOWED.some((ext) => f.name.toLowerCase().endsWith(ext))),
    hint: "PDF, Word, ODT, TXT ou images.",
  });
  items.push({
    label: "Chaque fichier ≤ 15 Mo",
    ok: true,
  });

  return items;
}

export default function OrderFilesUpload({
  orderId,
  instructions,
  existingCount,
}: {
  orderId: string;
  instructions: string | null;
  existingCount: number;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const addFiles = useServerFn(addOrderFiles);
  const qc = useQueryClient();

  const checklist = useMemo(
    () => buildChecklist(instructions, files, existingCount),
    [instructions, files, existingCount],
  );
  const blockingIssues = checklist.filter((c) => !c.ok);

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name} dépasse 15 Mo`);
        continue;
      }
      if (!ALLOWED.some((ext) => f.name.toLowerCase().endsWith(ext))) {
        toast.error(`${f.name} : format non accepté`);
        continue;
      }
      if (next.length + existingCount >= 20) break;
      next.push(f);
    }
    setFiles(next);
  };

  const onUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const paths: string[] = [];
      const folder = `${orderId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      for (const file of files) {
        const safe = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${folder}/${safe}`;
        const { error } = await supabase.storage
          .from("order-uploads")
          .upload(path, file, { upsert: false });
        if (error) throw new Error(`Envoi ${file.name} échoué : ${error.message}`);
        paths.push(path);
      }
      await addFiles({ data: { orderId, paths } });
      toast.success(`${files.length} document(s) envoyé(s)`);
      setFiles([]);
      await qc.invalidateQueries({ queryKey: ["order-public", orderId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de l'envoi");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg text-foreground">Documents à transmettre</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajoutez ici tout document utile au rédacteur (consignes, plan imposé, sujet officiel,
            cours…). {existingCount > 0 ? `${existingCount} déjà envoyé(s).` : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Label>Nouveaux fichiers</Label>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/40 p-6 text-center transition hover:border-primary/40 hover:bg-secondary">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Cliquez ou glissez vos fichiers (PDF, Word, images — 15 Mo max)
          </span>
          <input
            type="file"
            multiple
            accept={ALLOWED.join(",")}
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>

        {files.length > 0 && (
          <ul className="space-y-1">
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
                  aria-label={`Retirer ${f.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-border/70 bg-muted/20 p-4">
        <div className="flex items-center gap-2">
          {blockingIssues.length === 0 ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-600" />
          )}
          <p className="text-sm font-medium text-foreground">
            Vérification des consignes {blockingIssues.length === 0 ? "— tout est bon" : "à revoir"}
          </p>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {checklist.map((c, i) => (
            <li key={i} className="flex items-start gap-2">
              {c.ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              )}
              <div>
                <p className={c.ok ? "text-foreground" : "text-amber-900"}>{c.label}</p>
                {!c.ok && c.hint ? (
                  <p className="text-xs text-muted-foreground">{c.hint}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        {!instructions ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Astuce : les consignes détaillées de votre établissement permettent une vérification
            plus fine. Vous pouvez les ajouter en pièce jointe.
          </p>
        ) : null}
      </div>

      <Button
        type="button"
        className="mt-6 w-full"
        onClick={onUpload}
        disabled={uploading || files.length === 0}
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours…
          </>
        ) : (
          `Envoyer ${files.length > 0 ? `${files.length} fichier(s)` : "les documents"}`
        )}
      </Button>
    </div>
  );
}
