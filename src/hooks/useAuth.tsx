import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "sonner";
import { getDb, getFirebaseAuth, googleProvider, ADMIN_EMAILS } from "@/lib/firebase";
import { pushNotification, type AppNotification } from "@/lib/notifications";
import { rupiah } from "@/lib/format";

export interface ReferralEntry {
  uid: string;
  name?: string;
  email?: string;
  joinedAt?: number;
  bonusGiven?: boolean;
  bonusEarned?: number;
  totalGood?: number;
  totalSubmitted?: number;
}

export interface UserDoc {
  name?: string;
  email?: string;
  balance?: number;
  referredBy?: string | null;
  referrals?: ReferralEntry[];
  referralBonusGiven?: boolean;
  createdAt?: number;
}

export interface Submission {
  id: string;
  uid: string;
  count: number;
  totalRp?: number;
  creditedRp?: number;
  status?: string;
  createdAt?: number;
  emailResults?: { email: string; status: string }[];
  stats?: { good?: number; disabled?: number; verif?: number; notExist?: number };
}

export interface Withdrawal {
  id: string;
  walletType?: string;
  walletNumber?: string;
  amount?: number;
  status?: string;
  createdAt?: number;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  userDoc: UserDoc | null;
  balance: number;
  submissions: Submission[];
  withdrawals: Withdrawal[];
  notifications: AppNotification[];
  unreadCount: number;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const prevBalance = useRef<number | null>(null);
  const notifInit = useRef(false);

  // Capture ?ref= from the URL for referral attribution.
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) localStorage.setItem("pending_ref_code", ref);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (fbUser) => {
      setUser(fbUser);
      setLoading(false);
      if (!fbUser) {
        setUserDoc(null);
        setSubmissions([]);
        setWithdrawals([]);
        setNotifications([]);
        prevBalance.current = null;
        notifInit.current = false;
        return;
      }
      await ensureUserDoc(fbUser);
    });
    return () => unsub();
  }, []);

  // Realtime subscriptions for the signed-in user.
  useEffect(() => {
    if (!user) return;
    const db = getDb();

    const unsubUser = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as UserDoc;
      const newBalance = data.balance || 0;
      if (prevBalance.current !== null && newBalance > prevBalance.current) {
        toast.success(`Saldo masuk ${rupiah(newBalance - prevBalance.current)}`, {
          description: `Saldo kamu sekarang ${rupiah(newBalance)}`,
        });
      }
      prevBalance.current = newBalance;
      setUserDoc(data);
    });

    const unsubNotif = onSnapshot(
      query(
        collection(db, "users", user.uid, "notifications"),
        orderBy("createdAt", "desc"),
        limit(30),
      ),
      (snap) => {
        const list: AppNotification[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AppNotification, "id">),
        }));
        if (notifInit.current) {
          snap.docChanges().forEach((change) => {
            if (change.type !== "added") return;
            const n = change.doc.data() as AppNotification;
            if (n.type === "referral") toast.info(n.title, { description: n.message });
            else toast.success(n.title, { description: n.message });
          });
        }
        notifInit.current = true;
        setNotifications(list);
      },
      (err) => console.warn("Notif listener:", err),
    );

    const unsubSubs = onSnapshot(
      query(collection(db, "submissions"), where("uid", "==", user.uid)),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Submission, "id">) }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setSubmissions(list);
      },
      (err) => console.warn("Submissions listener:", err),
    );

    const unsubWd = onSnapshot(
      query(collection(db, "withdrawals"), where("uid", "==", user.uid)),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Withdrawal, "id">) }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setWithdrawals(list);
      },
      (err) => console.warn("Withdrawals listener:", err),
    );

    return () => {
      unsubUser();
      unsubNotif();
      unsubSubs();
      unsubWd();
    };
  }, [user]);

  const login = useCallback(async () => {
    await signInWithPopup(getFirebaseAuth(), googleProvider());
  }, []);

  const logout = useCallback(async () => {
    await signOut(getFirebaseAuth());
    window.location.href = "/";
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      userDoc,
      balance: userDoc?.balance || 0,
      submissions,
      withdrawals,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      isAdmin: !!user?.email && ADMIN_EMAILS.includes(user.email),
      login,
      logout,
    }),
    [user, loading, userDoc, submissions, withdrawals, notifications, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function ensureUserDoc(user: User) {
  const db = getDb();
  const userRef = doc(db, "users", user.uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) return;

    const refCode = localStorage.getItem("pending_ref_code");
    let referredBy: string | null = null;

    if (refCode && refCode !== user.uid) {
      try {
        const referrerRef = doc(db, "users", refCode);
        const referrerSnap = await getDoc(referrerRef);
        if (referrerSnap.exists()) {
          const referrerData = referrerSnap.data() as UserDoc;
          const existing = referrerData.referrals || [];
          if (!existing.some((r) => r.uid === user.uid)) {
            referredBy = refCode;
            await updateDoc(referrerRef, {
              referrals: arrayUnion({
                uid: user.uid,
                name: user.displayName || user.email,
                joinedAt: Date.now(),
                bonusGiven: false,
                bonusEarned: 0,
                totalGood: 0,
                totalSubmitted: 0,
              }),
            });
            // Notify the referrer about the new signup.
            await pushNotification(refCode, {
              type: "referral",
              title: "Teman baru bergabung!",
              message: `${user.displayName || user.email} mendaftar lewat link referral kamu.`,
            });
          }
        }
      } catch (err) {
        console.warn("Referral init error:", err);
      }
    }

    await setDoc(userRef, {
      name: user.displayName || user.email,
      email: user.email,
      balance: 0,
      referralBonusGiven: false,
      referredBy,
      referrals: [],
      createdAt: Date.now(),
    });
    localStorage.removeItem("pending_ref_code");
  } catch (err) {
    console.error("ensureUserDoc:", err);
  }
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
