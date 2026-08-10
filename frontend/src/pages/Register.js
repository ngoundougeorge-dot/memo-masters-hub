import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Label, Card } from "../components/ui";

export default function Register() {
  const { register, apiErr } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register(name, email, password);
      navigate("/editeur");
    } catch (err) {
      setError(apiErr(err.response?.data?.detail) || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md p-8 shadow-[var(--shadow-elegant)]">
        <Link to="/" className="flex items-center justify-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-semibold text-primary">MémoirePro</span>
        </Link>
        <h1 className="mt-6 text-center font-serif text-2xl text-foreground">Créer un compte</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Gratuit — accès à l'éditeur et à l'assistant IA.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" data-testid="register-form">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" data-testid="register-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aïcha Diallo" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" data-testid="register-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" data-testid="register-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 caractères minimum" required />
          </div>
          {error && <p className="text-sm text-destructive" data-testid="register-error">{error}</p>}
          <Button type="submit" className="w-full" data-testid="register-submit" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer mon compte"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Déjà inscrit ? <Link to="/connexion" className="font-medium text-primary hover:underline" data-testid="to-login">Se connecter</Link>
        </p>
      </Card>
    </main>
  );
}
