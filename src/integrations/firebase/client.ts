// Firebase Backend Client Integration
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Web app's Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDxIlTwww2JFIcNJC1jCvwWwp0EgMZdrA4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "redacme-dae15.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "redacme-dae15",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "redacme-dae15.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "149513803310",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:149513803310:web:29bebcb481593d5b0031bf",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-V7SWZ4NVQP",
};

// Initialize Firebase (Singleton pattern to support HMR & SSR)
export const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Firebase Services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
storage.maxUploadRetryTime = 2000;
storage.maxOperationRetryTime = 2000;

// SSR-safe Analytics Initialization
export let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log("[Firebase] Analytics initialisé avec succès");
      }
    })
    .catch((err) => {
      console.warn("[Firebase] Analytics non supporté dans cet environnement:", err);
    });
}

export default app;
