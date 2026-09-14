import { useEffect, useState } from "react";
import { Download, WifiOff, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Monitor online/offline state
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    // Capture PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Only show prompt if user hasn't dismissed recently
      const dismissed = localStorage.getItem("pwa_prompt_dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa_prompt_dismissed", "true");
  };

  return (
    <>
      {/* Offline Toast Notification */}
      {isOffline && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/90 text-amber-200 px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-md animate-bounce">
          <WifiOff className="h-4 w-4 text-amber-400" />
          <span>Mode hors-ligne actif (données locales préservées)</span>
        </div>
      )}

      {/* PWA Install Banner */}
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-primary/30 bg-background/90 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 igloo-glass">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Sparkles className="h-5 w-5 animate-spin-slow" />
            </div>
            <div className="flex-1">
              <h4 className="font-serif text-sm font-semibold text-foreground">
                Installer l'application MémoirePro
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Accédez à votre espace étudiant et vos rédactions même sans connexion Internet.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="h-8 gap-1.5 rounded-lg bg-primary text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 igloo-spring-btn"
                >
                  <Download className="h-3.5 w-3.5" />
                  Installer PWA
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  Plus tard
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PwaInstallPrompt;
