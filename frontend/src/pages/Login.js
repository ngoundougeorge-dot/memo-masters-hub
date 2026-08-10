import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Label, Card } from "../components/ui";

export default function Login() {
  const { login, apiErr } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await login(email, password);
      navigate(u.role === "admin" ? "/redacteur" : "/editeur");
    } catch (err) {
      setError(apiErr(err.response?.data?.detail) || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 shadow-[var(--shadow-elegant)]">
        <Link to="/" className="flex items-center justify-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-semibold text-primary">MémoirePro</span>
        </Link>
        <h1 className="mt-6 text-center font-serif text-2xl text-foreground">Connexion</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Accédez à votre espace et à l'éditeur IA.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" data-testid="login-form">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" data-testid="login-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" data-testid="login-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="text-sm text-destructive" data-testid="login-error">{error}</p>}
          <Button type="submit" className="w-full" data-testid="login-submit" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Se connecter"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pas encore de compte ? <Link to="/inscription" className="font-medium text-primary hover:underline" data-testid="to-register">Créer un compte</Link>
        </p>
      </Card>
    </main>
  );
}
