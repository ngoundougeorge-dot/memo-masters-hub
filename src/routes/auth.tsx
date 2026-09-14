import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — MémoirePro" },
      { name: "description", content: "Connectez-vous ou créez votre compte MémoirePro pour suivre vos commandes de rédaction." },
      { property: "og:title", content: "Connexion — MémoirePro" },
      { property: "og:description", content: "Accédez à votre espace client MémoirePro." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        if (!data.session) {
          setConfirmSent(true);
          return;
        }
        toast.success("Compte créé, bienvenue !");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connexion réussie");
      }
      navigate({ to: "/profil" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="font-serif text-xl font-semibold text-primary">MémoirePro</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          {confirmSent ? (
            <>
              <CardHeader className="text-center">
                <MailCheck className="mx-auto h-10 w-10 text-primary" strokeWidth={1.5} />
                <CardTitle className="font-serif text-2xl">Vérifiez votre boîte mail</CardTitle>
                <CardDescription>
                  Un lien de confirmation a été envoyé à <strong>{email}</strong>. Cliquez dessus
                  pour activer votre compte, puis connectez-vous.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setConfirmSent(false);
                    setMode("login");
                  }}
                >
                  Retour à la connexion
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">
                  {mode === "login" ? "Connexion" : "Créer un compte"}
                </CardTitle>
                <CardDescription>
                  {mode === "login"
                    ? "Accédez à votre espace client pour suivre vos commandes."
                    : "Créez votre compte pour passer et suivre vos commandes."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nom complet</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jean-Pierre Nguema"
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === "login" ? "Se connecter" : "Créer mon compte"}
                  </Button>
                </form>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
                  <button
                    type="button"
                    className="font-medium text-primary hover:underline"
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  >
                    {mode === "login" ? "Créer un compte" : "Se connecter"}
                  </button>
                </p>
              </CardContent>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
