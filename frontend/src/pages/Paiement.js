import React, { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, XCircle, ArrowLeft, Mail } from "lucide-react";

function resolveView(status) {
  if (status === "success" || status === "paid" || status === "ACCEPTED")
    return {
      Icon: CheckCircle2, iconWrap: "bg-emerald-100", iconColor: "text-emerald-600",
      title: "Paiement confirmé",
      description: "Merci ! Votre paiement a bien été reçu. Votre commande passe désormais en cours de traitement.",
      nextSteps: ["Vous allez recevoir un email de confirmation avec le récapitulatif de votre commande.", "Notre rédacteur va prendre contact avec vous pour valider les documents et instructions.", "Dès que tout est réuni, votre dossier passera en statut « rédaction en cours »."],
    };
  if (status === "failed" || status === "REFUSED" || status === "error")
    return {
      Icon: XCircle, iconWrap: "bg-red-100", iconColor: "text-red-600",
      title: "Paiement non abouti",
      description: "Votre paiement n'a pas pu être validé. Aucun montant n'a été prélevé sur votre compte Mobile Money.",
      nextSteps: ["Vérifiez que votre compte Mobile Money dispose du solde nécessaire.", "Réessayez depuis le formulaire de commande, ou choisissez un autre opérateur.", "Si le problème persiste, contactez-nous en précisant votre numéro de commande."],
    };
  return {
    Icon: Clock, iconWrap: "bg-amber-100", iconColor: "text-amber-600",
    title: "Paiement en cours de vérification",
    description: "Votre paiement est en attente de confirmation par l'opérateur Mobile Money. Cette étape prend généralement quelques instants.",
    nextSteps: ["Vous recevrez un email dès que le paiement sera validé.", "Vous pouvez fermer cette page sans risque : le statut de votre commande sera mis à jour automatiquement.", "En cas de doute après 15 minutes, contactez-nous avec votre numéro de commande."],
  };
}

export default function Paiement() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const status = params.get("status");
  const transaction_id = params.get("transaction_id");
  const order_id = params.get("order_id");
  const message = params.get("message");
  const view = resolveView(status);
  const isFinal = ["success", "paid", "ACCEPTED", "failed", "REFUSED", "error"].includes(status);

  useEffect(() => {
    if (!isFinal) return;
    const t = setTimeout(() => navigate(order_id ? `/client?order_id=${order_id}` : "/client"), 5000);
    return () => clearTimeout(t);
  }, [isFinal, navigate, order_id]);

  const Icon = view.Icon;
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)] sm:p-12" data-testid="paiement-card">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${view.iconWrap}`}>
            <Icon className={`h-9 w-9 ${view.iconColor}`} />
          </div>
          <h1 className="mt-6 text-center font-serif text-3xl font-semibold text-foreground sm:text-4xl">{view.title}</h1>
          <p className="mt-3 text-center text-base text-muted-foreground">{message ?? view.description}</p>
          {(order_id || transaction_id) && (
            <dl className="mt-8 space-y-3 rounded-lg border border-border/70 bg-muted/40 p-5 text-sm">
              {order_id && (<div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">N° de commande</dt><dd className="font-mono font-medium text-foreground break-all text-right">{order_id}</dd></div>)}
              {transaction_id && (<div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">N° de transaction</dt><dd className="font-mono font-medium text-foreground break-all text-right">{transaction_id}</dd></div>)}
            </dl>
          )}
          <div className="mt-8 space-y-3 text-sm text-muted-foreground">
            {view.nextSteps.map((s) => (<div key={s} className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" /><p>{s}</p></div>))}
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Retour à l'accueil</Link>
            <a href="mailto:contact@memoirepro.africa" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"><Mail className="h-4 w-4" /> Nous contacter</a>
          </div>
        </div>
        {isFinal && <p className="mt-4 text-center text-xs text-muted-foreground">Redirection automatique vers votre tableau de bord dans 5 secondes…</p>}
      </div>
    </main>
  );
}
