import { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "sonner";
import { Send, AlertTriangle } from "lucide-react";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { VALID_PASSWORDS } from "@/lib/firebase";
import { calculateRates } from "@/lib/format";

export default function StorPage() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState("");
  const [wa, setWa] = useState("");
  const [emails, setEmails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const count = emails
    .split("\n")
    .map((e) => e.trim())
    .filter((e) => e.includes("@")).length;
  const { price, total } = calculateRates(count);

  useEffect(() => {
    if (!user) return;
    setPasswords(user.displayName || "")
  }, [user]);

  if (!user) {
    return (
      <div className="panel-card rounded-3xl p-8 text-center">
        <p className="text-muted-foreground">Silakan masuk untuk mengirim setoran.</p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const now = new Date();
    const hour = parseInt(
      now.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour12: false, hour: "2-digit" }),
      10,
    );
    if (hour < 8 || hour >= 22) {
      setError("PENERIMAAN TUTUP! Setoran hanya dibuka jam 08:00 - 22:00 WIB.");
      return;
    }
    if (count < 1) {
      setError("Minimal setoran adalah 1 Akun Gmail.");
      return;
    }
    if (!VALID_PASSWORDS.map((p) => p.toLowerCase()).includes(passwords.trim().toLowerCase())) {
      setError("Password tidak sesuai dengan kata sandi resmi yang diizinkan!");
      return;
    }
    setBusy(true);
    try {
      const list = emails.split("\n").map((e) => e.trim()).filter(Boolean);
      await addDoc(collection(getDb(), "submissions"), {
        uid: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        waNumber: wa,
        gmailList: emails,
        emailResults: list.map((email) => ({ email, status: "Proses" })),
        count,
        totalRp: total,
        password: passwords,
        status: "Proses",
        stats: { good: 0, disabled: 0, verif: 0, notExist: 0 },
        creditedRp: 0,
        createdAt: Date.now(),
      });
      toast.success("Setoran Gmail berhasil dikirim.");
      setEmails("");
      setPasswords("");
      setWa("");
    } catch (err) {
      toast.error("Gagal mengirim: " + (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-2xl mx-auto">
      <div className="panel-card p-6 sm:p-8 rounded-3xl">
        <div className="border-b border-border pb-4 mb-6">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Send className="w-4 h-4 text-brand" /> Form Stor Gmail
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Masukkan daftar akun sesuai dengan aturan yang ditentukan.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Password Resmi Yang Diizinkan
            </label>
            <div className="p-3.5 bg-surface/60 border border-border rounded-2xl flex flex-wrap gap-2">
              {VALID_PASSWORDS.map((p) => (
                <span
                  key={p}
                  className="bg-surface-2 border border-border px-3 py-1 rounded-lg text-xs font-mono font-bold text-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="gmail-list" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Daftar Gmail (1 Baris = 1 Email)
            </label>
            <textarea
              id="gmail-list"
              rows={5}
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="contoh1@gmail.com&#10;contoh2@gmail.com"
              required
              className="form-input w-full px-4 py-3 rounded-2xl text-xs font-mono text-foreground placeholder:text-muted-foreground custom-scrollbar"
            />
          </div>

          <div className="p-4 bg-surface/80 border border-brand/30 rounded-2xl flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Total Terdeteksi</span>
              <span className="text-base font-extrabold text-brand">{count} Gmail</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                Estimasi Hasil ({price > 0 ? `Rp ${price.toLocaleString("id-ID")}/Akun` : "Min. 1 Akun"})
              </span>
              <span className="text-lg font-black text-success">Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-password" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Password Akun
              </label>
              <input
                id="input-password"
                type="text"
                value={passwords}
                onChange={(e) => setPasswords(e.target.value)}
                required
                placeholder="masukan Password"
                className="form-input w-full px-4 py-3 rounded-xl text-xs text-foreground"
              />
            </div>
            <div>
              <label htmlFor="input-wa" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Nomor WhatsApp
              </label>
              <input
                id="input-wa"
                type="text"
                value={wa}
                onChange={(e) => setWa(e.target.value)}
                required
                placeholder="08123456789"
                className="form-input w-full px-4 py-3 rounded-xl text-xs text-foreground"
              />
            </div>
          </div>

          {error && (
            <p className="p-3 rounded-xl text-xs font-bold text-destructive bg-destructive/10 border border-destructive/30 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-brand via-violet to-pink text-primary-foreground glow-brand active:scale-95 transition disabled:opacity-60"
          >
            {busy ? "Mengirim..." : "Kirim Setoran Akun"}
          </button>
        </form>
      </div>
    </section>
  );
}
