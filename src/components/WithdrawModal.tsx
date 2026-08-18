import { useState } from "react";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Wallet, X } from "lucide-react";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { rupiah } from "@/lib/format";

export function WithdrawModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, balance } = useAuth();
  const [walletType, setWalletType] = useState("DANA");
  const [walletNumber, setWalletNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open || !user) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const nominal = parseInt(amount, 10);
    if (isNaN(nominal) || nominal < 11000) {
      setError("Minimal penarikan saldo adalah Rp 11.000.");
      return;
    }
    if (nominal > balance) {
      setError("Saldo Anda tidak mencukupi untuk penarikan ini.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const db = getDb();
      await addDoc(collection(db, "withdrawals"), {
        uid: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        walletType,
        walletNumber,
        amount: nominal,
        status: "Proses",
        createdAt: Date.now(),
      });
      await updateDoc(doc(db, "users", user.uid), { balance: balance - nominal });
      toast.success("Pengajuan penarikan berhasil dibuat.");
      setWalletNumber("");
      setAmount("");
      onClose();
    } catch (err) {
      toast.error("Gagal penarikan: " + (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="panel-card w-full max-w-sm p-6 rounded-3xl relative">
        <button
          onClick={onClose}
          aria-label="Tutup modal penarikan"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-base font-bold flex items-center gap-2 mb-1">
          <Wallet className="w-4 h-4 text-success" /> Form Tarik Saldo
        </h3>
        <p className="text-[11px] text-muted-foreground mb-5">
          Saldo tersedia: <strong className="text-success">{rupiah(balance)}</strong>
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="wd-type"
              className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5"
            >
              Metode E-Wallet / Bank
            </label>
            <select
              id="wd-type"
              value={walletType}
              onChange={(e) => setWalletType(e.target.value)}
              className="form-input w-full px-3.5 py-2.5 rounded-xl text-xs text-foreground"
            >
              {["DANA", "GoPay", "OVO", "ShopeePay", "Bank Transfer"].map((m) => (
                <option key={m} value={m} className="bg-card">
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="wd-num"
              className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5"
            >
              Nomor Tujuan & Atas Nama
            </label>
            <input
              id="wd-num"
              value={walletNumber}
              onChange={(e) => setWalletNumber(e.target.value)}
              required
              placeholder="0812... (A.N. Nama)"
              className="form-input w-full px-3.5 py-2.5 rounded-xl text-xs text-foreground"
            />
          </div>
          <div>
            <label
              htmlFor="wd-amount"
              className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5"
            >
              Nominal (Min. Rp 11.000)
            </label>
            <input
              id="wd-amount"
              type="number"
              min={11000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="11000"
              className="form-input w-full px-3.5 py-2.5 rounded-xl text-xs text-foreground"
            />
          </div>
          {error && (
            <p className="p-3 rounded-xl text-xs font-medium bg-destructive/10 text-destructive border border-destructive/30">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-success to-info text-background glow-success active:scale-95 transition disabled:opacity-60"
          >
            {busy ? "Memproses..." : "Kirim Pengajuan"}
          </button>
        </form>
      </div>
    </div>
  );
}
