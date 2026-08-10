import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "./ui";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferred(e);
      if (!localStorage.getItem("mp_install_dismissed")) setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show || !deferred) return null;

  return (
    <div
      data-testid="pwa-install-banner"
      className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-elegant)] animate-fade-up sm:left-auto sm:right-4 sm:w-80"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Download className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">Installer MémoirePro</p>
        <p className="text-xs text-muted-foreground">Accès rapide, même hors ligne.</p>
      </div>
      <Button
        size="sm"
        data-testid="pwa-install-accept"
        onClick={async () => {
          deferred.prompt();
          await deferred.userChoice;
          setShow(false);
          setDeferred(null);
        }}
      >
        Installer
      </Button>
      <button
        aria-label="Fermer"
        data-testid="pwa-install-dismiss"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => {
          setShow(false);
          localStorage.setItem("mp_install_dismissed", "1");
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
