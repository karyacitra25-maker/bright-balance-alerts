import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  increment as fsIncrement,
} from "firebase/firestore";
import { toast } from "sonner";
import { Shield, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { rupiah, formatDate } from "@/lib/format";
import { pushNotification } from "@/lib/notifications";
import type { Submission, Withdrawal } from "@/hooks/useAuth";

export function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    const db = getDb();
    const unsubSubs = onSnapshot(
      query(collection(db, "submissions")),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Submission, "id">) }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setSubmissions(list);
      },
      (err) => console.warn("Admin subs:", err),
    );
    const unsubWd = onSnapshot(
      query(collection(db, "withdrawals")),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Withdrawal, "id">) }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setWithdrawals(list);
      },
      (err) => console.warn("Admin wd:", err),
    );
    return () => {
      unsubSubs();
      unsubWd();
    };
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="panel-card rounded-3xl p-8 text-center">
        <Shield className="w-10 h-10 text-destructive mx-auto mb-2" />
        <h1 className="text-lg font-bold text-destructive">Akses Ditolak</h1>
        <p className="text-xs text-muted-foreground">Halaman ini hanya untuk admin.</p>
      </div>
    );
  }

  async function approveSubmission(id: string, uid: string, amount: number) {
    try {
      const db = getDb();
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { balance: fsIncrement(amount) });
      await updateDoc(doc(db, "submissions", id), { status: "Berhasil", creditedRp: amount });
      await pushNotification(uid, {
        type: "balance",
        title: "Saldo masuk",
        message: `Setoran Gmail diterima: ${rupiah(amount)}`,
        amount,
      });
      toast.success("Setoran disetujui & saldo dikirim.");
    } catch (err) {
      toast.error("Gagal: " + (err as Error).message);
    }
  }

  async function rejectSubmission(id: string) {
    try {
      await updateDoc(doc(getDb(), "submissions", id), { status: "Ditolak" });
      toast.success("Setoran ditolak.");
    } catch (err) {
      toast.error("Gagal: " + (err as Error).message);
    }
  }

  async function processWithdrawal(id: string, uid: string, amount: number, status: "Berhasil" | "Ditolak") {
    try {
      await updateDoc(doc(getDb(), "withdrawals", id), { status });
      await pushNotification(uid, {
        type: "withdraw",
        title: status === "Berhasil" ? "Withdrawal berhasil" : "Withdrawal ditolak",
        message: status === "Berhasil" ? `Dana ${rupiah(amount)} telah diproses.` : `Pengajuan ${rupiah(amount)} ditolak.`,
        amount,
      });
      toast.success("Withdrawal diperbarui.");
    } catch (err) {
      toast.error("Gagal: " + (err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 rounded-2xl bg-destructive/10 text-destructive border border-destructive/30">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-foreground">Admin Panel</h1>
          <p className="text-[10px] text-muted-foreground">Kelola setoran dan withdrawal pengguna.</p>
        </div>
      </div>

      <section className="panel-card rounded-3xl p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Setoran Gmail ({submissions.length})
        </h2>
        {submissions.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada setoran.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
            {submissions.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-surface/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-foreground">{s.userName || s.userEmail}</p>
                  <p className="text-[10px] text-muted-foreground">{s.count} akun • {formatDate(s.createdAt)}</p>
                  <p className="text-xs font-bold text-success mt-1">{rupiah(s.totalRp || 0)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${statusBadge(s.status)}`}>
                    {s.status || "Proses"}
                  </span>
                  {s.status !== "Berhasil" && (
                    <button
                      onClick={() => approveSubmission(s.id, s.uid, s.totalRp || 0)}
                      className="p-2 rounded-lg bg-success/20 text-success hover:bg-success/30"
                      title="Setujui"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {s.status !== "Ditolak" && (
                    <button
                      onClick={() => rejectSubmission(s.id)}
                      className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30"
                      title="Tolak"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel-card rounded-3xl p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Withdrawal ({withdrawals.length})
        </h2>
        {withdrawals.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada withdrawal.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
            {withdrawals.map((w) => (
              <div key={w.id} className="p-4 rounded-2xl bg-surface/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-foreground">{w.walletType} • {w.walletNumber}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(w.createdAt)}</p>
                  <p className="text-xs font-bold text-warning mt-1">{rupiah(w.amount || 0)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${statusBadge(w.status)}`}>
                    {w.status || "Proses"}
                  </span>
                  {w.status !== "Berhasil" && (
                    <button
                      onClick={() => processWithdrawal(w.id, w.uid, w.amount || 0, "Berhasil")}
                      className="p-2 rounded-lg bg-success/20 text-success hover:bg-success/30"
                      title="Setujui"
                    >
                      <DollarSign className="w-4 h-4" />
                    </button>
                  )}
                  {w.status !== "Ditolak" && (
                    <button
                      onClick={() => processWithdrawal(w.id, w.uid, w.amount || 0, "Ditolak")}
                      className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30"
                      title="Tolak"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function statusBadge(status?: string) {
  switch (status) {
    case "Berhasil": return "bg-success/20 text-success border border-success/30";
    case "Ditolak": return "bg-destructive/20 text-destructive border border-destructive/30";
    default: return "bg-warning/20 text-warning border border-warning/30";
  }
}
