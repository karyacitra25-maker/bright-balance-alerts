import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { ShieldAlert, Inbox, Banknote } from "lucide-react";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { LoginCard } from "@/components/LoginCard";
import { pushNotification } from "@/lib/notifications";
import { rupiah, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel Admin — MailMX" },
      {
        name: "description",
        content: "Kelola setoran gmail, kredit saldo pengguna, dan proses penarikan MailMX.",
      },
      { property: "og:title", content: "Panel Admin — MailMX" },
      {
        property: "og:description",
        content: "Kelola setoran, kredit saldo, dan penarikan pengguna MailMX.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

interface AdminSubmission {
  id: string;
  uid: string;
  userEmail?: string;
  userName?: string;
  waNumber?: string;
  gmailList?: string;
  count: number;
  totalRp?: number;
  creditedRp?: number;
  status?: string;
  createdAt?: number;
}

interface AdminWithdrawal {
  id: string;
  uid: string;
  userEmail?: string;
  walletType?: string;
  walletNumber?: string;
  amount?: number;
  status?: string;
  createdAt?: number;
}

function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const [subs, setSubs] = useState<AdminSubmission[]>([]);
  const [wds, setWds] = useState<AdminWithdrawal[]>([]);
  const [goodInput, setGoodInput] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAdmin) return;
    const db = getDb();
    const u1 = onSnapshot(
      query(collection(db, "submissions"), orderBy("createdAt", "desc")),
      (snap) =>
        setSubs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as AdminSubmission)),
    );
    const u2 = onSnapshot(
      query(collection(db, "withdrawals"), orderBy("createdAt", "desc")),
      (snap) =>
        setWds(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as AdminWithdrawal)),
    );
    return () => {
      u1();
      u2();
    };
  }, [isAdmin]);

  if (loading) {
    return <p className="text-center text-xs text-muted-foreground py-20">Memuat sesi...</p>;
  }
  if (!user) return <LoginCard />;
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto panel-card rounded-3xl p-8 text-center space-y-2 border-destructive/40">
        <ShieldAlert className="w-8 h-8 mx-auto text-destructive" />
        <h1 className="font-bold">Akses Ditolak</h1>
        <p className="text-xs text-muted-foreground">
          Halaman ini hanya untuk administrator MailMX.
        </p>
      </div>
    );
  }

  async function approveSubmission(s: AdminSubmission) {
    const good = parseInt(goodInput[s.id] || "0", 10);
    if (Number.isNaN(good) || good < 0 || good > s.count) {
      toast.error("Jumlah good tidak valid.");
      return;
    }
    const rate = s.count ? Math.round((s.totalRp || 0) / s.count) : 0;
    const credited = good * rate;
    const db = getDb();
    try {
      await updateDoc(doc(db, "submissions", s.id), {
        status: "Selesai",
        creditedRp: credited,
        stats: { good, disabled: s.count - good, verif: 0, notExist: 0 },
      });
      await updateDoc(doc(db, "users", s.uid), { balance: increment(credited) });
      await pushNotification(s.uid, {
        type: "balance",
        title: "Saldo Masuk",
        message: `${good} dari ${s.count} gmail dinyatakan good. Saldo ${rupiah(credited)} telah ditambahkan.`,
        amount: credited,
      });
      await creditReferrerBonus(s.uid, good);
      toast.success("Setoran diproses & saldo dikirim.");
    } catch (err) {
      toast.error("Gagal: " + (err as Error).message);
    }
  }

  async function creditReferrerBonus(uid: string, good: number) {
    if (good <= 0) return;
    const db = getDb();
    const snap = await getDoc(doc(db, "users", uid));
    const data = snap.data() as
      | { referredBy?: string; name?: string; email?: string; referralBonusGiven?: boolean }
      | undefined;
    if (!data?.referredBy || data.referralBonusGiven) return;
    const bonus = 1000;
    await updateDoc(doc(db, "users", data.referredBy), { balance: increment(bonus) });
    await updateDoc(doc(db, "users", uid), { referralBonusGiven: true });
    await pushNotification(data.referredBy, {
      type: "referral",
      title: "Bonus Referral Cair",
      message: `${data.name || data.email} menyelesaikan setoran pertama. Bonus ${rupiah(bonus)} masuk ke saldo kamu.`,
      amount: bonus,
    });
  }

  async function setWithdrawStatus(w: AdminWithdrawal, status: "Sukses" | "Ditolak") {
    const db = getDb();
    try {
      await updateDoc(doc(db, "withdrawals", w.id), { status });
      if (status === "Ditolak") {
        await updateDoc(doc(db, "users", w.uid), { balance: increment(w.amount || 0) });
      }
      await pushNotification(w.uid, {
        type: "withdraw",
        title: status === "Sukses" ? "Penarikan Berhasil" : "Penarikan Ditolak",
        message:
          status === "Sukses"
            ? `Penarikan ${rupiah(w.amount)} ke ${w.walletType} sudah dikirim.`
            : `Penarikan ${rupiah(w.amount)} ditolak, saldo dikembalikan.`,
        amount: w.amount || 0,
      });
      toast.success("Status penarikan diperbarui.");
    } catch (err) {
      toast.error("Gagal: " + (err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="panel-card rounded-3xl p-6 bg-gradient-to-r from-pink/15 via-transparent to-brand/15 border-pink/30">
        <h1 className="text-lg font-black tracking-tight">Panel Admin MailMX</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Proses setoran gmail dan penarikan saldo. Setiap aksi otomatis mengirim notifikasi ke
          pengguna.
        </p>
      </div>

      <div className="panel-card rounded-3xl p-6">
        <h2 className="font-bold text-sm flex items-center gap-2 mb-4">
          <Inbox className="w-4 h-4 text-brand" /> Setoran Masuk
        </h2>
        <div className="space-y-3">
          {subs.length === 0 && (
            <p className="text-xs text-muted-foreground italic p-4 text-center">Belum ada setoran.</p>
          )}
          {subs.map((s) => (
            <div key={s.id} className="p-4 rounded-2xl bg-surface/60 border border-border space-y-3">
              <div className="flex flex-wrap justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{s.userName || s.userEmail}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDateTime(s.createdAt)} · {s.count} akun · WA {s.waNumber}
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full border font-bold h-fit ${
                    s.status === "Selesai"
                      ? "text-success bg-success-soft border-success/30"
                      : "text-warning bg-warning-soft border-warning/30"
                  }`}
                >
                  {s.status || "Proses"}
                </span>
              </div>
              <pre className="text-[10px] font-mono text-muted-foreground max-h-24 overflow-auto custom-scrollbar whitespace-pre-wrap">
                {s.gmailList}
              </pre>
              {s.status !== "Selesai" ? (
                <div className="flex gap-2">
                  <input
                    inputMode="numeric"
                    placeholder="Jumlah good"
                    aria-label={`Jumlah good untuk ${s.userEmail}`}
                    value={goodInput[s.id] ?? ""}
                    onChange={(e) => setGoodInput((p) => ({ ...p, [s.id]: e.target.value }))}
                    className="form-input flex-1 px-3 py-2 rounded-xl text-xs text-foreground"
                  />
                  <button
                    onClick={() => void approveSubmission(s)}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-success to-info text-background active:scale-95 transition"
                  >
                    Kirim Saldo
                  </button>
                </div>
              ) : (
                <p className="text-xs font-bold text-success">
                  Dibayar {rupiah(s.creditedRp)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="panel-card rounded-3xl p-6">
        <h2 className="font-bold text-sm flex items-center gap-2 mb-4">
          <Banknote className="w-4 h-4 text-success" /> Permintaan Penarikan
        </h2>
        <div className="space-y-3">
          {wds.length === 0 && (
            <p className="text-xs text-muted-foreground italic p-4 text-center">
              Belum ada permintaan penarikan.
            </p>
          )}
          {wds.map((w) => (
            <div
              key={w.id}
              className="p-4 rounded-2xl bg-surface/60 border border-border flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">
                  {w.userEmail} · {rupiah(w.amount)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {w.walletType} · {w.walletNumber} · {formatDateTime(w.createdAt)}
                </p>
              </div>
              {(!w.status || w.status === "Proses") ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => void setWithdrawStatus(w, "Sukses")}
                    className="px-3 py-2 rounded-xl text-[11px] font-extrabold bg-success-soft text-success border border-success/40 active:scale-95 transition"
                  >
                    Sukses
                  </button>
                  <button
                    onClick={() => void setWithdrawStatus(w, "Ditolak")}
                    className="px-3 py-2 rounded-xl text-[11px] font-extrabold bg-destructive/10 text-destructive border border-destructive/40 active:scale-95 transition"
                  >
                    Tolak
                  </button>
                </div>
              ) : (
                <span className="text-[11px] font-bold text-muted-foreground">{w.status}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
