import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
  type ActionCodeSettings,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./client";

export type UserRole = "client" | "redacteur" | "admin";

export interface FirebaseUserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  profile: FirebaseUserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isMagicLinkSent: boolean;
  sendSignInLink: (email: string, redirectUrl?: string) => Promise<void>;
  completeMagicLinkSignIn: (emailOverride?: string) => Promise<boolean>;
  loginWithPassword: (email: string, pass: string) => Promise<void>;
  registerWithPassword: (email: string, pass: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUserRoleAsAdmin: (targetUid: string, newRole: UserRole) => Promise<boolean>;
  checkIsSignInWithEmailLink: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Emails reconnus d'office comme Administrateurs au premier login
const INITIAL_ADMIN_EMAILS = [
  "admin@memoirepro.ga",
  "chris.ngomarosa@vinci-energies.net",
  "admin@redacme.com",
];

const EMAIL_FOR_SIGN_IN_KEY = "emailForSignIn";
const CACHED_PROFILE_KEY = "firebase_user_profile_cache";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FirebaseUserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHED_PROFILE_KEY);
        return cached ? JSON.parse(cached) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);

  // Synchronisation du profil Firestore
  const syncOrCreateUserProfile = async (firebaseUser: User): Promise<FirebaseUserProfile> => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const userProf: FirebaseUserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || data.email || "",
          displayName: data.displayName || firebaseUser.displayName || "",
          role: (data.role as UserRole) || "client",
          phone: data.phone || "",
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
        };
        setProfile(userProf);
        if (typeof window !== "undefined") {
          localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(userProf));
        }
        return userProf;
      }

      // Nouvel utilisateur : Attribution du rôle STRICTEMENT "client"
      // Seuls les e-mails administrateurs initiaux reçoivent le rôle "admin"
      const userEmail = (firebaseUser.email || "").toLowerCase();
      const initialRole: UserRole = INITIAL_ADMIN_EMAILS.includes(userEmail)
        ? "admin"
        : "client";

      const newProfile: FirebaseUserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        role: initialRole,
        createdAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, {
        ...newProfile,
        createdAt: serverTimestamp(),
      });

      setProfile(newProfile);
      if (typeof window !== "undefined") {
        localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(newProfile));
      }
      return newProfile;
    } catch (err) {
      console.warn("[Firebase Auth] Impossible de charger le profil Firestore (fallback local):", err);
      // Fallback local sécurisé : Rôle Client par défaut
      const fallbackProfile: FirebaseUserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        role: INITIAL_ADMIN_EMAILS.includes((firebaseUser.email || "").toLowerCase()) ? "admin" : "client",
        createdAt: new Date().toISOString(),
      };
      setProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await syncOrCreateUserProfile(firebaseUser);
      } else {
        setProfile(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(CACHED_PROFILE_KEY);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Envoi du lien d'authentification par e-mail (Passwordless / Magic Link)
  const sendSignInLink = async (email: string, redirectUrl?: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";
    const targetUrl = redirectUrl || `${origin}/auth`;

    const actionCodeSettings: ActionCodeSettings = {
      url: targetUrl,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email.trim(), actionCodeSettings);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email.trim());
    }
    setIsMagicLinkSent(true);
  };

  // 2. Vérification si l'URL courante est un lien de connexion Firebase
  const checkIsSignInWithEmailLink = () => {
    if (typeof window === "undefined") return false;
    return isSignInWithEmailLink(auth, window.location.href);
  };

  // 3. Finalisation de la connexion par lien e-mail
  const completeMagicLinkSignIn = async (emailOverride?: string): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    if (!isSignInWithEmailLink(auth, window.location.href)) {
      return false;
    }

    let email = emailOverride || window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
    if (!email) {
      email = window.prompt("Veuillez confirmer votre adresse e-mail pour finaliser la connexion :");
    }

    if (!email) {
      throw new Error("L'adresse e-mail est requise pour confirmer la connexion.");
    }

    const result = await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);

    // Nettoyage de l'URL pour ne pas ré-exécuter le token au rechargement
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (result.user) {
      await syncOrCreateUserProfile(result.user);
      return true;
    }

    return false;
  };

  // 4. Connexion classique avec mot de passe
  const loginWithPassword = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user) {
      await syncOrCreateUserProfile(cred.user);
    }
  };

  // 5. Inscription classique avec mot de passe
  const registerWithPassword = async (email: string, pass: string, fullName?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user) {
      const prof = await syncOrCreateUserProfile(cred.user);
      if (fullName) {
        prof.displayName = fullName;
        setProfile({ ...prof, displayName: fullName });
        try {
          await updateDoc(doc(db, "users", cred.user.uid), { displayName: fullName });
        } catch {}
      }
    }
  };

  // 6. Déconnexion
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(CACHED_PROFILE_KEY);
    }
  };

  // 7. Modification du rôle par un Administrateur
  // SÉCURITÉ : Un client ne peut JAMAIS changer un rôle ni s'attribuer le rôle admin
  const setUserRoleAsAdmin = async (targetUid: string, newRole: UserRole): Promise<boolean> => {
    if (profile?.role !== "admin") {
      throw new Error("Action interdite : Seul un administrateur peut modifier le rôle d'un utilisateur.");
    }

    try {
      const docRef = doc(db, "users", targetUid);
      await updateDoc(docRef, {
        role: newRole,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error("[Firebase Auth] Erreur lors de la modification de rôle:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role ?? null,
        loading,
        isMagicLinkSent,
        sendSignInLink,
        completeMagicLinkSignIn,
        loginWithPassword,
        registerWithPassword,
        logout,
        setUserRoleAsAdmin,
        checkIsSignInWithEmailLink,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>");
  }
  return context;
}
