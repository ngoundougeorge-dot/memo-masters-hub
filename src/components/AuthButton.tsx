import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, ShieldAlert, PenTool, UserCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/integrations/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AuthButton() {
  const { user, role, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center px-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) {
    const portalUrl = role === "admin" ? "/admin" : role === "redacteur" ? "/redacteur" : "/client";
    const roleBadgeText = role === "admin" ? "Admin" : role === "redacteur" ? "Rédacteur" : "Client";
    const badgeColorClass =
      role === "admin"
        ? "bg-amber-500/15 text-amber-600 border-amber-300"
        : role === "redacteur"
        ? "bg-indigo-500/15 text-indigo-600 border-indigo-300"
        : "bg-emerald-500/15 text-emerald-600 border-emerald-300";

    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`text-[11px] font-semibold uppercase tracking-wider ${badgeColorClass}`}>
          {roleBadgeText}
        </Badge>

        <Button asChild size="sm" variant="outline" className="h-8 text-xs">
          <Link to={portalUrl}>
            {role === "admin" && <ShieldAlert className="mr-1.5 h-3.5 w-3.5 text-amber-500" />}
            {role === "redacteur" && <PenTool className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />}
            {role === "client" && <UserCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />}
            <span>Espace {roleBadgeText}</span>
          </Link>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => logout()}
          title="Se déconnecter"
          className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Button asChild size="sm" variant="outline" className="h-8 text-xs">
      <Link to="/auth">
        <LogIn className="mr-1.5 h-3.5 w-3.5 text-primary" />
        Connexion
      </Link>
    </Button>
  );
}
