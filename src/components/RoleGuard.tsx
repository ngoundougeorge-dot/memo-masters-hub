import React, { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert, Lock, ArrowRight, LogIn, LogOut, Loader2, Sparkles, UserCheck } from "lucide-react";
import { useAuth, type UserRole } from "@/integrations/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/TiltCard";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallbackTitle?: string;
  customMessage?: string;
}

const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  client: "Client (Étudiant)",
  redacteur: "Rédacteur Académique",
  admin: "Administrateur Système",
};

export function RoleGuard({
  allowedRoles,
  children,
  fallbackTitle,
  customMessage,
}: RoleGuardProps) {
  const { user, role, loading, logout } = useAuth();

  // 1. État de chargement initial
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          Vérification des accréditations de sécurité et des règles d'accès...
        </p>
      </div>
    );
  }

  // 2. Non authentifié : Invitation à la connexion Firebase
  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12">
        <TiltCard maxTilt={5} className="w-full rounded-2xl border border-border/80 bg-card/90 p-8 shadow-2xl igloo-glass text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Lock className="h-7 w-7" />
          </div>
          <Badge variant="outline" className="mb-3 text-xs uppercase tracking-widest border-primary/30 text-primary">
            Authentification Requise
          </Badge>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            {fallbackTitle || "Espace Sécurisé MémoirePro"}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {customMessage ||
              "Pour accéder à cet espace et gérer vos mémoires, veuillez vous authentifier par lien e-mail sans mot de passe ou mot de passe sécurisé."}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="igloo-spring-btn shadow-md">
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Se connecter
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="igloo-spring-btn">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </TiltCard>
      </div>
    );
  }

  // 3. Authentifié mais rôle non autorisé (ex: Client tentant d'accéder à /admin ou /redacteur)
  const isAuthorized = role && allowedRoles.includes(role);

  if (!isAuthorized) {
    const userRoleName = role ? ROLE_DISPLAY_NAMES[role] : "Client";
    const requiredRolesNames = allowedRoles.map((r) => ROLE_DISPLAY_NAMES[r]).join(" ou ");

    return (
      <div className="mx-auto flex min-h-[75vh] max-w-xl items-center justify-center px-4 py-12">
        <TiltCard maxTilt={5} className="w-full rounded-2xl border border-destructive/40 bg-card/95 p-8 shadow-2xl igloo-glass text-center relative overflow-hidden">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-destructive/10 blur-2xl pointer-events-none" />
          
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/30">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <Badge variant="destructive" className="mb-3 text-xs uppercase tracking-widest">
            Accès Refusé · Rôle Insuffisant (403)
          </Badge>

          <h2 className="font-serif text-2xl font-bold text-foreground">
            Accès Strictement Restreint
          </h2>

          <div className="mt-4 rounded-xl border border-border/80 bg-background/60 p-4 text-left text-xs space-y-2">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Compte connecté :</span>
              <span className="font-semibold text-foreground">{user.email}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Votre Rôle Actuel :</span>
              <span className="font-bold text-amber-500 uppercase">{userRoleName}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Rôle(s) Requis :</span>
              <span className="font-bold text-primary">{requiredRolesNames}</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground leading-relaxed text-center">
            Conformément aux règles de sécurité RLS et à l'intégrité académique du site, un compte <strong>Client</strong> ne peut pas accéder aux consoles de rédaction ni s'auto-attribuer les droits d'administration.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Button asChild className="igloo-spring-btn shadow-md">
              <Link to="/client">
                <UserCheck className="mr-2 h-4 w-4" />
                Aller à mon Espace Client
              </Link>
            </Button>
            <Button variant="outline" onClick={() => logout()} className="igloo-spring-btn text-destructive hover:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              Changer de compte
            </Button>
          </div>
        </TiltCard>
      </div>
    );
  }

  // 4. Accès Accordé
  return <>{children}</>;
}
export default RoleGuard;
