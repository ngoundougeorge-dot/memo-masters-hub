import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy, 
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
 * Upload a document to Firebase Storage
 */
export async function uploadDocumentToFirebase(
  file: File,
  folder: string = "orders"
): Promise<{ url: string; path: string }> {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const fullPath = `${folder}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, fullPath);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);

  return {
    url: downloadUrl,
    path: fullPath,
  };
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
