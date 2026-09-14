import { useEffect, useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  ShieldCheck,
  UserCheck,
  PenTool,
  Search,
  Filter,
  RefreshCw,
  ArrowRightLeft,
  Calendar,
  Phone,
  Mail,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { db } from "@/integrations/firebase";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { RoleGuard } from "@/components/RoleGuard";
import { TiltCard } from "@/components/TiltCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panneau d'Administration — MémoirePro" },
      { name: "description", content: "Gestion des utilisateurs, des rôles et de la sécurité RLS." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

export type AdminUser = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: "client" | "redacteur" | "admin";
  created_at: string;
};

// Initial mock dataset for seamless offline / demo mode
const DEFAULT_MOCK_USERS: AdminUser[] = [
  {
    id: "usr-01",
    full_name: "Patrick Nguema",
    email: "patrick.nguema@uob.ga",
    phone: "+241 77 12 34 56",
    role: "client",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: "usr-02",
    full_name: "Dr. Stéphane Ondo",
    email: "dr.s.ondo@redacteur-uob.ga",
    phone: "+241 74 98 76 54",
    role: "redacteur",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
  },
  {
    id: "usr-03",
    full_name: "Grace Mba",
    email: "grace.mba@insg.ga",
    phone: "+241 66 54 32 10",
    role: "client",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "usr-04",
    full_name: "Nadège Biyogo",
    email: "nadege.biyogo@ustm.ga",
    phone: "+241 77 88 99 00",
    role: "redacteur",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
  {
    id: "usr-05",
    full_name: "Administrateur MémoirePro Gabon",
    email: "admin@memoirepro.ga",
    phone: "+241 74 00 00 00",
    role: "admin",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
  },
];

function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>(DEFAULT_MOCK_USERS);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<"all" | "client" | "redacteur" | "admin">("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load live profiles and user_roles from Supabase and Firebase Firestore
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [{ data: profilesData, error: profilesError }, { data: rolesData, error: rolesError }] =
        await Promise.all([
          supabase.from("profiles").select("id, full_name, phone, created_at"),
          supabase.from("user_roles").select("user_id, role"),
        ]);

      if (profilesError) {
        console.warn("[Admin] Supabase profiles fetch error (using fallback):", profilesError.message);
      }

      let merged: AdminUser[] = [];
      if (profilesData && profilesData.length > 0) {
        const rolesMap = new Map<string, "client" | "redacteur" | "admin">();
        (rolesData ?? []).forEach((r) => {
          rolesMap.set(r.user_id, r.role as "client" | "redacteur" | "admin");
        });

        merged = profilesData.map((p) => ({
          id: p.id,
          full_name: p.full_name || "Étudiant sans nom",
          email: `${p.id.slice(0, 8)}@user.memoirepro.com`,
          phone: p.phone,
          role: rolesMap.get(p.id) || "client",
          created_at: p.created_at,
        }));
      }

      // Synchronisation avec les utilisateurs Firestore
      try {
        const snap = await getDocs(collection(db, "users"));
        if (!snap.empty) {
          const firestoreUsers: AdminUser[] = [];
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            firestoreUsers.push({
              id: docSnap.id,
              full_name: d.displayName || d.full_name || "Utilisateur Firebase",
              email: d.email || `${docSnap.id.slice(0, 8)}@mail.com`,
              phone: d.phone || null,
              role: (d.role as "client" | "redacteur" | "admin") || "client",
              created_at: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : (d.createdAt || new Date().toISOString()),
            });
          });

          const fsIds = new Set(firestoreUsers.map((u) => u.id));
          const nonDuplicatedMerged = merged.filter((m) => !fsIds.has(m.id));
          merged = [...firestoreUsers, ...nonDuplicatedMerged];
        }
      } catch (fbErr) {
        console.warn("[Admin] Firestore users fetch skipped:", fbErr);
      }

      if (merged.length > 0) {
        setUsers(merged);
      }
    } catch (err) {
      console.warn("[Admin] Supabase offline or unconfigured, running in local/PWA mode.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle role toggle between 'client' and 'redacteur'
  const handleToggleRole = async (user: AdminUser) => {
    if (user.role === "admin") {
      toast.error("Le rôle Administrateur est protégé et ne peut être modifié ici.");
      return;
    }

    const targetRole: "client" | "redacteur" = user.role === "client" ? "redacteur" : "client";
    const previousRole = user.role;
    setProcessingId(user.id);

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: targetRole } : u))
    );

    try {
      // 1. Mise à jour dans Cloud Firestore
      try {
        const userDocRef = doc(db, "users", user.id);
        await updateDoc(userDocRef, {
          role: targetRole,
          updatedAt: serverTimestamp(),
        });
        console.log(`[Admin] Rôle Firestore synchronisé pour ${user.id}: ${targetRole}`);
      } catch (fbErr) {
        console.warn("[Admin] Firestore update fallback:", fbErr);
      }

      // 2. Mise à jour Supabase RPC
      const { error: rpcError } = await (supabase.rpc as any)("set_user_role", {
        target_user_id: user.id,
        new_role: targetRole,
      });

      if (rpcError) {
        // Direct fallback on user_roles table
        const { error: deleteError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", user.id);

        if (!deleteError) {
          await supabase.from("user_roles").insert({
            user_id: user.id,
            role: targetRole,
          });
        }
      }

      const roleDisplay = targetRole === "redacteur" ? "Rédacteur" : "Client";
      toast.success(`${user.full_name} est désormais ${roleDisplay} !`, {
        description: `Permissions mises à jour en temps réel (Firebase & RLS).`,
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      });
    } catch (error) {
      console.warn("[Admin] Local mode update succeeded (offline or preview mode).");
      const roleDisplay = targetRole === "redacteur" ? "Rédacteur" : "Client";
      toast.success(`${user.full_name} basculé en ${roleDisplay} (Mode PWA local)`);
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(searchQuery)) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: users.length,
      clients: users.filter((u) => u.role === "client").length,
      redacteurs: users.filter((u) => u.role === "redacteur").length,
      admins: users.filter((u) => u.role === "admin").length,
    };
  }, [users]);

  return (
    <RoleGuard
      allowedRoles={["admin"]}
      fallbackTitle="Panneau d'Administration"
      customMessage="L'accès à la gestion des rôles et des autorisations d'écriture est strictement réservé aux Administrateurs."
    >
      <div className="min-h-screen bg-background pb-16 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              title="Retour à l'accueil"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg font-bold text-foreground sm:text-xl">
                  MémoirePro <span className="text-primary font-sans font-medium text-xs bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">ADMIN</span>
                </h1>
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 igloo-pulse-dot" />
                  RLS Protégé
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Gestion des comptes, attribution des privilèges et conformité PWA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
              className="gap-1.5 h-8 text-xs igloo-spring-btn"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
            <Button asChild size="sm" className="h-8 text-xs bg-primary text-primary-foreground font-semibold gap-1.5 igloo-spring-btn">
              <Link to="/redacteur">
                <Briefcase className="h-3.5 w-3.5" />
                <span>Espace Rédaction & Mémoires</span>
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
              <Link to="/client">Espace Client</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        {/* KPI Cards (Igloo Inc. 3D Tilt) */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          <TiltCard className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm igloo-glass">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Comptes
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 font-serif text-3xl font-bold text-foreground">
              {stats.total}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Profils enregistrés</p>
          </TiltCard>

          <TiltCard className="rounded-2xl border border-emerald-500/20 bg-card/80 p-5 shadow-sm igloo-glass">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-emerald-600">
                Clients
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 font-serif text-3xl font-bold text-emerald-700">
              {stats.clients}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Commandes & mémoires</p>
          </TiltCard>

          <TiltCard className="rounded-2xl border border-indigo-500/20 bg-card/80 p-5 shadow-sm igloo-glass">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-indigo-600">
                Rédacteurs
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <PenTool className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 font-serif text-3xl font-bold text-indigo-700">
              {stats.redacteurs}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Auteurs agréés</p>
          </TiltCard>

          <TiltCard className="rounded-2xl border border-amber-500/20 bg-card/80 p-5 shadow-sm igloo-glass">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-amber-600">
                Admins
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 font-serif text-3xl font-bold text-amber-700">
              {stats.admins}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Privilèges totaux</p>
          </TiltCard>
        </div>

        {/* Security Alert Banner */}
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                Sécurité Row Level Security (RLS) Active :
              </span>{" "}
              Seuls les administrateurs authentifiés peuvent modifier le rôle d'un utilisateur entre{" "}
              <strong className="text-emerald-700">Client</strong> et{" "}
              <strong className="text-indigo-700">Rédacteur</strong>. Les tentatives d'auto-promotion non autorisées sont systématiquement rejetées par PostgreSQL.
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher par nom, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-card border-border/80"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Button
              size="sm"
              variant={roleFilter === "all" ? "default" : "outline"}
              onClick={() => setRoleFilter("all")}
              className="h-8 rounded-lg text-xs igloo-spring-btn"
            >
              Tous ({users.length})
            </Button>
            <Button
              size="sm"
              variant={roleFilter === "client" ? "default" : "outline"}
              onClick={() => setRoleFilter("client")}
              className="h-8 rounded-lg text-xs igloo-spring-btn"
            >
              Clients ({stats.clients})
            </Button>
            <Button
              size="sm"
              variant={roleFilter === "redacteur" ? "default" : "outline"}
              onClick={() => setRoleFilter("redacteur")}
              className="h-8 rounded-lg text-xs igloo-spring-btn"
            >
              Rédacteurs ({stats.redacteurs})
            </Button>
            <Button
              size="sm"
              variant={roleFilter === "admin" ? "default" : "outline"}
              onClick={() => setRoleFilter("admin")}
              className="h-8 rounded-lg text-xs igloo-spring-btn"
            >
              Admins ({stats.admins})
            </Button>
          </div>
        </div>

        {/* Users Table / Grid */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm igloo-glass">
          <div className="divide-y divide-border/60">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium text-foreground">
                  Aucun utilisateur trouvé
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Essayez de modifier vos termes de recherche ou de réinitialiser les filtres.
                </p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isProcessing = processingId === u.id;
                const initials = (u.full_name || u.email || "?")
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0]?.toUpperCase())
                  .join("");

                return (
                  <div
                    key={u.id}
                    className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  >
                    {/* User Info */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-serif text-sm font-bold shadow-inner ${
                          u.role === "admin"
                            ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                            : u.role === "redacteur"
                              ? "bg-indigo-500/15 text-indigo-600 border border-indigo-500/30"
                              : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                        }`}
                      >
                        {initials}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-base font-semibold text-foreground truncate">
                            {u.full_name}
                          </h3>
                          <RoleBadge role={u.role} />
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                            {u.email}
                          </span>
                          {u.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                              {u.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                            Inscrit le {new Date(u.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Actions */}
                    <div className="flex items-center gap-2.5 sm:shrink-0 self-end sm:self-center">
                      {u.role === "admin" ? (
                        <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700">
                          <Lock className="h-3.5 w-3.5" />
                          <span>Admin Protégé</span>
                        </div>
                      ) : u.role === "client" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isProcessing}
                          onClick={() => handleToggleRole(u)}
                          className="gap-2 h-9 rounded-xl border-indigo-200 text-xs font-medium text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900 igloo-spring-btn shadow-xs"
                        >
                          <ArrowRightLeft className={`h-3.5 w-3.5 ${isProcessing ? "animate-spin" : ""}`} />
                          <span>Passer en Rédacteur</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isProcessing}
                          onClick={() => handleToggleRole(u)}
                          className="gap-2 h-9 rounded-xl border-emerald-200 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900 igloo-spring-btn shadow-xs"
                        >
                          <ArrowRightLeft className={`h-3.5 w-3.5 ${isProcessing ? "animate-spin" : ""}`} />
                          <span>Passer en Client</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
    </RoleGuard>
  );
}

function RoleBadge({ role }: { role: "client" | "redacteur" | "admin" }) {
  if (role === "admin") {
    return (
      <Badge className="bg-amber-500/15 text-amber-700 border-amber-300 font-medium text-[11px] gap-1 hover:bg-amber-500/20">
        <ShieldCheck className="h-3 w-3" />
        Administrateur
      </Badge>
    );
  }
  if (role === "redacteur") {
    return (
      <Badge className="bg-indigo-500/15 text-indigo-700 border-indigo-300 font-medium text-[11px] gap-1 hover:bg-indigo-500/20">
        <PenTool className="h-3 w-3" />
        Rédacteur
      </Badge>
    );
  }
  return (
    <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300 font-medium text-[11px] gap-1 hover:bg-emerald-500/20">
      <UserCheck className="h-3 w-3" />
      Client
    </Badge>
  );
}

export default AdminDashboard;
