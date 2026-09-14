import React, { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, LogIn, LogOut, Loader2, UserCheck, Shield } from "lucide-react";
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

export function RoleGuard({
  allowedRoles,
  children,
  fallbackTitle,
  customMessage,
}: RoleGuardProps) {
  const { user, role, loading, logout } = useAuth();

  // 1. État de chargement
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          Chargement en cours...
        </p>
      </div>
    );
  }

  // 2. Non connecté
  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12">
        <TiltCard maxTilt={5} className="w-full rounded-2xl border border-border/80 bg-card/90 p-8 shadow-2xl igloo-glass text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Lock className="h-7 w-7" />
          </div>
          <Badge variant="outline" className="mb-3 text-xs uppercase tracking-widest border-primary/30 text-primary">
            Connexion Requise
          </Badge>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            {fallbackTitle || "Espace Réservé"}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {customMessage ||
              "Veuillez vous connecter à votre compte pour accéder à cet espace."}
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

  // 3. Connecté mais rôle non autorisé
  const isAuthorized = role && allowedRoles.includes(role);

  if (!isAuthorized) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12">
        <TiltCard maxTilt={5} className="w-full rounded-2xl border border-border/80 bg-card/95 p-8 shadow-2xl igloo-glass text-center relative overflow-hidden">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Shield className="h-7 w-7" />
          </div>

          <Badge variant="outline" className="mb-3 text-xs uppercase tracking-widest border-primary/30 text-primary">
            Accès Restreint
          </Badge>

          <h2 className="font-serif text-2xl font-bold text-foreground">
            Espace non autorisé
          </h2>

          <p className="mt-3 text-sm text-muted-foreground leading-relaxed text-center">
            Cet espace est réservé à l'équipe de rédaction et d'administration. Vous pouvez accéder directement à votre espace client pour suivre vos travaux.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Button asChild className="igloo-spring-btn shadow-md">
              <Link to="/client">
                <UserCheck className="mr-2 h-4 w-4" />
                Aller à mon Espace Client
              </Link>
            </Button>
            <Button variant="outline" onClick={() => logout()} className="igloo-spring-btn">
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
