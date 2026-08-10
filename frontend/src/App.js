import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import InstallPrompt from "./components/InstallPrompt";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientDashboard from "./pages/Client";
import Redacteur from "./pages/Redacteur";
import Paiement from "./pages/Paiement";
import Editor from "./pages/Editor";

function Protected({ children }) {
  const { user, ready } = useAuth();
  if (!ready || user === null)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  if (!user) return <Navigate to="/connexion" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/redacteur" element={<Redacteur />} />
          <Route path="/paiement/retour" element={<Paiement />} />
          <Route
            path="/editeur"
            element={
              <Protected>
                <Editor />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-center" richColors />
        <InstallPrompt />
      </BrowserRouter>
    </AuthProvider>
  );
}
