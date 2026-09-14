import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Loader2,
  LogOut,
  UserRound,
  ShieldCheck,
  Phone,
  Mail,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil — MémoirePro" },
      { name: "description", content: "Vos informations personnelles et votre rôle MémoirePro." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilPage,
});

const ROLE_LABELS: Record<string, string> = {
  client: "Client",
  redacteur: "Rédacteur",
  admin: "Administrateur",
};

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

function ProfilPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [{ data: prof, error: profErr }, { data: roleRows, error: roleErr }] =
        await Promise.all([
          supabase.from("profiles").select("id, full_name, phone, created_at").eq("id", user.id).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", user.id),
        ]);
      if (!mounted) return;
      if (profErr) toast.error("Impossible de charger le profil.");
      if (roleErr) toast.error("Impossible de charger le rôle.");
      setProfile(prof ?? null);
      setFullName(prof?.full_name ?? "");
      setPhone(prof?.phone ?? "");
      setRoles((roleRows ?? []).map((r) => r.role as string));
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null, phone: phone.trim() || null, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Enregistrement impossible. Réessayez.");
      return;
    }
    setProfile((p) => (p ? { ...p, full_name: fullName.trim() || null, phone: phone.trim() || null } : p));
    toast.success("Profil mis à jour.");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = (profile?.full_name || user.email || "?")
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="font-serif text-xl font-semibold text-primary">MémoirePro</span>
          </Link>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-1.5 h-4 w-4" />
            Se déconnecter
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-serif text-2xl font-semibold text-primary">
                  {initials}
                </div>
                <div className="space-y-1">
                  <CardTitle className="font-serif text-2xl">
                    {profile?.full_name || "Sans nom"}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-2">
                    <span>Rôle :</span>
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <Badge key={role} variant="secondary" className="gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          {ROLE_LABELS[role] ?? role}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">Aucun rôle attribué</Badge>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{profile?.phone || "Téléphone non renseigné"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  <span>
                    Membre depuis le{" "}
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserRound className="h-4 w-4 shrink-0" />
                  <span className="truncate">ID : {user.id.slice(0, 8)}…</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">Modifier mes informations</CardTitle>
                <CardDescription>
                  Ces informations aident le rédacteur à vous contacter à propos de vos commandes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jean-Pierre Nguema"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone (WhatsApp)</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+241 74 00 00 00"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
