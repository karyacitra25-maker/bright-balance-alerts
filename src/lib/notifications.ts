import { addDoc, collection, doc, serverTimestamp, updateDoc, writeBatch, getDocs, query, where } from "firebase/firestore";
import { getDb } from "./firebase";

export type NotificationType = "balance" | "referral" | "withdraw" | "info";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  amount?: number;
  read?: boolean;
  createdAt?: number;
}

/** Creates an in-app notification for one user. */
export async function pushNotification(
  uid: string,
  data: {
    type: NotificationType;
    title: string;
    message: string;
    amount?: number;
  },
): Promise<void> {
  if (!uid) return;
  try {
    await addDoc(collection(getDb(), "users", uid, "notifications"), {
      ...data,
      read: false,
      createdAt: Date.now(),
      serverAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Gagal membuat notifikasi:", err);
  }
}

export async function markNotificationRead(uid: string, notifId: string): Promise<void> {
  try {
    await updateDoc(doc(getDb(), "users", uid, "notifications", notifId), { read: true });
  } catch (err) {
    console.warn("Gagal menandai notifikasi:", err);
  }
}

export async function markAllNotificationsRead(uid: string): Promise<void> {
  try {
    const db = getDb();
    const snap = await getDocs(
      query(collection(db, "users", uid, "notifications"), where("read", "==", false)),
    );
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();
  } catch (err) {
    console.warn("Gagal menandai semua notifikasi:", err);
  }
}
