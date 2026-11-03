// Shared, browser-safe list of document types a client can order.
// Values must stay in sync with the `document_type` enum in the database
// and with the zod validators in OrderForm.tsx and orders.functions.ts.
export const DOCUMENT_TYPES = [
  { value: "memoire_licence", label: "Mémoire de licence" },
  { value: "memoire_master", label: "Mémoire de master" },
  { value: "rapport_stage", label: "Rapport de stage" },
  { value: "travail_recherche", label: "Travail de recherche" },
  { value: "presentation", label: "Présentation PowerPoint / Power BI" },
  { value: "correction", label: "Correction / relecture" },
  { value: "autre", label: "Autre" },
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number]["value"];

const LABELS: Record<string, string> = Object.fromEntries(
  DOCUMENT_TYPES.map((t) => [t.value, t.label]),
);

export function formatDocType(type: string | null | undefined): string {
  if (!type) return "—";
  return LABELS[type] ?? type;
}
