import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  type Timestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./client";
import type { ProjectDetails } from "@/lib/projectStore";

export interface FirebaseOrderData {
  id: string;
  orderId: string;
  userId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  subject: string;
  documentType: string;
  academicLevel: string;
  pages: number;
  priceFcfa: number;
  paymentMethod: string;
  paymentConfirmed: boolean;
  status: "reçu" | "projet_créé" | "en_cours" | "terminé" | "envoyé";
  instructions?: string;
  planText?: string;
  guidelinesText?: string;
  coverPageText?: string;
  fileUrls?: string[];
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Convert file to base64 Data URL or Object URL as fallback
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (file.size <= 2 * 1024 * 1024 && typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(URL.createObjectURL(file));
      reader.readAsDataURL(file);
    } else if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
      resolve(URL.createObjectURL(file));
    } else {
      resolve(`local://${file.name}`);
    }
  });
}

/**
 * Upload a document to Firebase Storage with instant local fallback
 */
export async function uploadDocumentToFirebase(
  file: File,
  folder: string = "orders"
): Promise<{ url: string; path: string }> {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const fullPath = `${folder}/${Date.now()}_${safeName}`;

  try {
    const storageRef = ref(storage, fullPath);

    const uploadPromise = uploadBytes(storageRef, file).then(async (snapshot) => {
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return { url: downloadUrl, path: fullPath };
    });

    const timeoutPromise = new Promise<{ url: string; path: string }>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout Firebase Storage (2.5s)")), 2500)
    );

    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (err) {
    console.warn("[Firebase Storage] Bucket non accessible ou timeout, repli immédiat:", err);
    const localUrl = await fileToDataUrl(file);
    return {
      url: localUrl,
      path: fullPath,
    };
  }
}

/**
 * Save or synchronize an order with Cloud Firestore
 */
export async function syncOrderToFirebase(project: ProjectDetails): Promise<boolean> {
  try {
    const docRef = doc(db, "orders", project.orderId || project.id);
    const orderData: FirebaseOrderData = {
      id: project.id,
      orderId: project.orderId,
      userId: project.userId || "",
      clientName: project.clientName || "",
      clientEmail: project.clientEmail || "",
      clientPhone: project.clientPhone || "",
      subject: project.subject,
      documentType: project.documentType,
      academicLevel: project.academicLevel || "",
      pages: project.pages ?? 0,
      priceFcfa: project.priceFcfa,
      paymentMethod: project.paymentMethod || "",
      paymentConfirmed: project.paymentConfirmed,
      status: project.isCompleted 
        ? "terminé" 
        : project.paymentConfirmed 
          ? "en_cours" 
          : "projet_créé",
      instructions: project.objective,
      planText: project.planText || "",
      guidelinesText: project.guidelinesText || "",
      coverPageText: project.coverPageText || "",
      fileUrls: project.filePaths,
      updatedAt: serverTimestamp(),
      createdAt: project.createdAt || new Date().toISOString(),
    };

    await setDoc(docRef, orderData, { merge: true });
    console.log(`[Firebase] Commande synchronisée dans Firestore: ${project.orderId}`);
    return true;
  } catch (error) {
    console.warn("[Firebase] Erreur lors de la synchronisation Firestore:", error);
    return false;
  }
}

/**
 * Retrieve all orders from Firestore
 */
export async function fetchFirebaseOrders(): Promise<FirebaseOrderData[]> {
  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const orders: FirebaseOrderData[] = [];
    querySnapshot.forEach((docSnap) => {
      orders.push({ ...(docSnap.data() as FirebaseOrderData), id: docSnap.id });
    });
    return orders;
  } catch (error) {
    console.warn("[Firebase] Erreur lors de la récupération Firestore:", error);
    return [];
  }
}

/**
 * Update payment and progression status in Firestore
 */
export async function updateFirebaseOrderStatus(
  orderId: string,
  updates: Partial<FirebaseOrderData>
): Promise<boolean> {
  try {
    const docRef = doc(db, "orders", orderId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.warn(`[Firebase] Erreur lors de la mise à jour de ${orderId}:`, error);
    return false;
  }
}

/**
 * Retrieve a single order by ID or orderId from Firestore
 */
export async function fetchFirebaseOrder(orderId: string): Promise<FirebaseOrderData | null> {
  try {
    const docRef = doc(db, "orders", orderId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...(snap.data() as FirebaseOrderData), id: snap.id };
    }
    const q = query(collection(db, "orders"), where("orderId", "==", orderId));
    const snapQ = await getDocs(q);
    if (!snapQ.empty) {
      const first = snapQ.docs[0];
      return { ...(first.data() as FirebaseOrderData), id: first.id };
    }
    return null;
  } catch (err) {
    console.warn(`[Firebase] Erreur recherche commande ${orderId}:`, err);
    return null;
  }
}

/**
 * Retrieve all orders for a specific user (by userId or clientEmail) from Firestore
 */
export async function fetchUserOrders(userId?: string, userEmail?: string): Promise<FirebaseOrderData[]> {
  try {
    const orders: FirebaseOrderData[] = [];
    if (userId) {
      const q = query(collection(db, "orders"), where("userId", "==", userId));
      const snap = await getDocs(q);
      snap.forEach((d) => orders.push({ ...(d.data() as FirebaseOrderData), id: d.id }));
    }
    if (userEmail) {
      const q = query(collection(db, "orders"), where("clientEmail", "==", userEmail));
      const snap = await getDocs(q);
      snap.forEach((d) => {
        if (!orders.some((o) => o.orderId === d.id || o.id === d.id)) {
          orders.push({ ...(d.data() as FirebaseOrderData), id: d.id });
        }
      });
    }
    return orders;
  } catch (err) {
    console.warn("[Firebase] Erreur récupération commandes utilisateur:", err);
    return [];
  }
}
