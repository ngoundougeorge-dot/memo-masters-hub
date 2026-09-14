import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Loader2,
  MailCheck,
  Sparkles,
  Send,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth, type UserRole } from "@/integrations/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TiltCard } from "@/components/TiltCard";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion Sécurisée — MémoirePro Gabon" },
      {
        name: "description",
        content: "Connexion sécurisée pour suivre vos mémoires et rapports au Gabon.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    role,
    loading: authLoading,
    sendSignInLink,
    completeMagicLinkSignIn,
    loginWithPassword,
    registerWithPassword,
    logout,
    checkIsSignInWithEmailLink,
  } = useAuth();

  // State for Magic Link
  const [magicEmail, setMagicEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [verifyingMagicLink, setVerifyingMagicLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // State for Password Auth
  const [passwordMode, setPasswordMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [pwdEmail, setPwdEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // 1. Détection automatique du retour par Lien Magique dans l'URL
  useEffect(() => {
    async function handleIncomingLink() {
      if (checkIsSignInWithEmailLink()) {
        setVerifyingMagicLink(true);
        setLinkError(null);
        try {
          const success = await completeMagicLinkSignIn();
          if (success) {
            toast.success("Connexion réussie !");
            // Redirection immédiate selon le rôle
            redirectUserAccordingToRole(role);
          }
        } catch (err) {
          console.error("[Auth] Erreur validation lien:", err);
          setLinkError(err instanceof Error ? err.message : "Le lien de connexion est invalide ou a expiré.");
          toast.error("Échec de connexion par lien e-mail");
        } finally {
          setVerifyingMagicLink(false);
        }
      }
    }
    handleIncomingLink();
  }, []);

  // Redirection adaptative selon le rôle
  const redirectUserAccordingToRole = (currentRole: UserRole | null) => {
    if (currentRole === "admin") {
      navigate({ to: "/admin" });
    } else if (currentRole === "redacteur") {
      navigate({ to: "/redacteur" });
    } else {
      navigate({ to: "/client" });
    }
  };

  // 2. Envoi du lien d'authentification par e-mail
  async function handleSendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!magicEmail.trim()) {
      toast.error("Veuillez saisir votre adresse e-mail.");
      return;
    }

    setPwdLoading(true);
    try {
      await sendSignInLink(magicEmail);
      setMagicLinkSent(true);
      toast.success("Lien de connexion envoyé avec succès !");
    } catch (err) {
      console.error("[Auth] Erreur envoi lien:", err);
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi du lien.");
    } finally {
      setPwdLoading(false);
    }
  }

  // 3. Connexion / Inscription par mot de passe
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwdLoading(true);
    try {
      if (passwordMode === "signup") {
        await registerWithPassword(pwdEmail, password, fullName);
        toast.success("Compte étudiant créé avec succès !");
        navigate({ to: "/client" });
      } else {
        await loginWithPassword(pwdEmail, password);
        toast.success("Connexion réussie");
        redirectUserAccordingToRole(role);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue lors de l'authentification.");
    } finally {
      setPwdLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md igloo-glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="font-serif text-xl font-bold text-primary">MémoirePro Gabon</span>
          </Link>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Retour au site
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        {/* CAS A : Vérification en cours d'un lien d'e-mail */}
        {verifyingMagicLink ? (
          <TiltCard maxTilt={4} className="w-full max-w-md rounded-2xl border border-primary/40 bg-card/95 p-8 text-center shadow-2xl igloo-glass">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Validation de votre lien...
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Connexion en cours. Vous allez être redirigé vers votre espace.
            </p>
          </TiltCard>
        ) : user ? (
          /* CAS B : Utilisateur déjà connecté */
          <TiltCard maxTilt={4} className="w-full max-w-md rounded-2xl border border-border/80 bg-card/95 p-8 shadow-2xl igloo-glass text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <UserCheck className="h-7 w-7" />
            </div>
            <Badge variant="outline" className="mb-2 text-xs uppercase tracking-wider text-primary border-primary/30">
              Session Active
            </Badge>
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Vous êtes déjà connecté
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Identifiant : <span className="font-mono text-foreground font-semibold">{user.email}</span>
            </p>

            <div className="mt-4 rounded-xl border border-border/80 bg-background/60 p-3 text-xs">
              <span className="text-muted-foreground">Rôle actif : </span>
              <span className="font-bold text-primary uppercase">
                {role === "admin" ? "Administrateur" : role === "redacteur" ? "Rédacteur" : "Client (Étudiant)"}
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              {role === "admin" && (
                <Button asChild className="igloo-spring-btn shadow-md">
                  <Link to="/admin">
                    Accéder au Panneau d'Administration
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              {role === "redacteur" && (
                <Button asChild className="igloo-spring-btn shadow-md">
                  <Link to="/redacteur">
                    Accéder à l'Espace Rédacteur
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="igloo-spring-btn">
                <Link to="/client">
                  Accéder à mon Espace Client
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => logout()}
                className="igloo-spring-btn text-xs text-destructive hover:bg-destructive/10 mt-2"
              >
                Se déconnecter
              </Button>
            </div>
          </TiltCard>
        ) : (
          /* CAS C : Formulaire d'authentification Firebase (Lien Magique + Mot de passe) */
          <div className="w-full max-w-md">
            <TiltCard maxTilt={3} className="rounded-2xl border border-border/80 bg-card/95 p-6 shadow-2xl igloo-glass">
              {/* Header Card */}
              <div className="text-center mb-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-foreground">
                  Connexion
                </h1>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Accédez à votre espace pour suivre vos mémoires et commandes.
                </p>
              </div>

              {/* Erreur de lien si présente */}
              {linkError && (
                <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{linkError}</span>
                </div>
              )}

              {magicLinkSent ? (
                /* Écran de confirmation du Lien Magique */
                <div className="text-center py-4 space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <MailCheck className="h-7 w-7" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    Consultez votre boîte mail
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Un lien d'authentification direct et sécurisé a été envoyé à :<br />
                    <strong className="text-foreground text-sm">{magicEmail}</strong>
                  </p>

                  <div className="rounded-xl border border-border/80 bg-background/60 p-3.5 text-left text-xs space-y-1.5 text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-foreground font-semibold">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Connexion automatique
                    </div>
                    <p>
                      Votre e-mail a été enregistré sur cet appareil. Cliquez simplement sur le bouton reçu dans votre boîte de réception pour entrer sans mot de passe.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-xs igloo-spring-btn mt-2"
                    onClick={() => {
                      setMagicLinkSent(false);
                      setMagicEmail("");
                    }}
                  >
                    Utiliser une autre adresse e-mail
                  </Button>
                </div>
              ) : (
                /* Tabs : Lien Magique E-mail vs Mot de passe */
                <Tabs defaultValue="magic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="magic" className="text-xs">
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                      Lien E-mail
                    </TabsTrigger>
                    <TabsTrigger value="password" className="text-xs">
                      <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                      Mot de passe
                    </TabsTrigger>
                  </TabsList>

                  {/* ONGLET 1 : LIEN MAGIQUE SANS MOT DE PASSE */}
                  <TabsContent value="magic">
                    <form onSubmit={handleSendMagicLink} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="magicEmail" className="text-xs font-medium">
                          Votre adresse e-mail
                        </Label>
                        <Input
                          id="magicEmail"
                          type="email"
                          value={magicEmail}
                          onChange={(e) => setMagicEmail(e.target.value)}
                          placeholder="etudiant@uob.ga ou personnel@gmail.com"
                          required
                          className="h-10 text-sm"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-10 igloo-spring-btn shadow-md"
                        disabled={pwdLoading}
                      >
                        {pwdLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Envoi du lien en cours...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Recevoir mon lien de connexion
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* ONGLET 2 : MOT DE PASSE CLASSIQUE */}
                  <TabsContent value="password">
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      {passwordMode === "signup" && (
                        <div className="space-y-1.5">
                          <Label htmlFor="fullName" className="text-xs font-medium">
                            Nom et Prénom
                          </Label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Jean-Pierre Nguema"
                            required
                            className="h-10 text-sm"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <Label htmlFor="pwdEmail" className="text-xs font-medium">
                          E-mail
                        </Label>
                        <Input
                          id="pwdEmail"
                          type="email"
                          value={pwdEmail}
                          onChange={(e) => setPwdEmail(e.target.value)}
                          placeholder="vous@exemple.com"
                          required
                          className="h-10 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-xs font-medium">
                          Mot de passe
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={6}
                          required
                          className="h-10 text-sm"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-10 igloo-spring-btn shadow-md"
                        disabled={pwdLoading}
                      >
                        {pwdLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : passwordMode === "login" ? (
                          "Se connecter"
                        ) : (
                          "Créer mon compte"
                        )}
                      </Button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline"
                          onClick={() =>
                            setPasswordMode(passwordMode === "login" ? "signup" : "login")
                          }
                        >
                          {passwordMode === "login"
                            ? "Pas encore de compte ? S'inscrire"
                            : "Déjà un compte ? Se connecter"}
                        </button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </TiltCard>
          </div>
        )}
      </main>
    </div>
  );
}

export default AuthPage;
