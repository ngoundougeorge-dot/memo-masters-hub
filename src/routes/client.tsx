import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, FileText, MessageSquare, Settings } from "lucide-react";

export const Route = createFileRoute("/client")({
  head: () => ({
    meta: [
      { title: "Espace client — Rédaction Académique" },
      {
        name: "description",
        content: "Suivez vos commandes de rédaction de mémoire et échangez avec votre rédacteur.",
      },
    ],
  }),
  component: ClientDashboard,
});

function ClientDashboard() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-serif text-xl font-semibold text-foreground">
            Rédaction Académique
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <span className="text-foreground">Tableau de bord</span>
            <span className="cursor-not-allowed opacity-50">Mes commandes</span>
            <span className="cursor-not-allowed opacity-50">Messagerie</span>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-serif text-3xl font-semibold text-foreground">
          Bienvenue dans votre espace client
        </h1>
        <p className="mt-2 text-muted-foreground">
          Suivez vos commandes et communiquez avec votre rédacteur en toute simplicité.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <h3 className="mt-4 font-medium text-foreground">Mes commandes</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Consultez l’état d’avancement de vos mémoires et rapports de stage.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <h3 className="mt-4 font-medium text-foreground">Messagerie</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Échangez directement avec votre rédacteur pour préciser vos attentes.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <h3 className="mt-4 font-medium text-foreground">Paramètres</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Mettez à jour vos informations personnelles et préférences.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-border bg-muted/40 p-8 text-center">
          <LayoutDashboard className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="mt-4 text-muted-foreground">
            Votre tableau de bord est en cours de finalisation. Vous pourrez bientôt consulter
            vos commandes en temps réel.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
