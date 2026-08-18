import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { getDb, VALID_PASSWORDS } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { LoginCard } from "@/components/LoginCard";
import { calculateRates, rupiah } from "@/lib/format";

export const Route = createFileRoute("/stor")({
  head: () => ({
    meta: [
      { title: "Form Stor Gmail — MailMX" },
      {
        name: "description",
        content: "Kirim daftar gmail kamu ke MailMX dan lihat estimasi hasil secara langsung.",
      },
      { property: "og:title", content: "Form Stor Gmail — MailMX" },
      {
        property: "og:description",
        content: "Kirim daftar gmail dan lihat estimasi hasil setoran secara langsung.",
      },
    ],
  }),
  component: StorPage,
});

function StorPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState("");
  const [password, setPassword] = useState("");
  const [wa, setWa] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return <p className="text-center text-xs text-muted-foreground py-20">Memuat sesi...</p>;
  }
  if (!user) return <LoginCard />;

  const emails = list
    .split("\n")
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && e.includes("@"));
  const { price, total } = calculateRates(emails.length);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const hourWIB = parseInt(
      new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", hour12: false }),
      10,
    );
    if (hourWIB < 8 || hourWIB >= 22) {
      setError("PENERIMAAN TUTUP! Setoran hanya dibuka jam 08:00 - 22:00 WIB.");
      return;
    }
    if (emails.length < 1) {
      setError("Minimal setoran adalah 1 Akun Gmail.");
      return;
    }
    if (!VALID_PASSWORDS.includes(password.trim().toLowerCase())) {
      setError("Password tidak sesuai dengan kata sandi resmi yang diizinkan!");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await addDoc(collection(getDb(), "submissions"), {
        uid: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        waNumber: wa.trim(),
        gmailList: list,
        emailResults: emails.map((email) => ({ email, status: "Proses" })),
        count: emails.length,
        totalRp: total,
        password: password.trim(),
        status: "Proses",
        stats: { good: 0, disabled: 0, verif: 0, notExist: 0 },
        creditedRp: 0,
        createdAt: Date.now(),
      });
      toast.success("Setoran Gmail berhasil dikirim.");
      setList("");
      setPassword("");
      setWa("");
      void navigate({ to: "/" });
    } catch (err) {
      toast.error("Gagal mengirim: " + (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto panel-card rounded-3xl p-6 sm:p-8">
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Send className="w-4 h-4 text-brand" /> Form Stor Gmail
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Masukkan daftar akun sesuai aturan yang ditentukan.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            Password Resmi Yang Diizinkan
          </span>
          <div className="p-3.5 rounded-2xl bg-surface/60 border border-border flex flex-wrap gap-2">
            {VALID_PASSWORDS.map((p) => (
              <span
                key={p}
                className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-violet-soft text-violet border border-violet/30"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="gmail-list"
            className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2"
          >
            Daftar Gmail (1 Baris = 1 Email)
          </label>
          <textarea
            id="gmail-list"
            rows={5}
            required
            value={list}
            onChange={(e) => setList(e.target.value)}
            placeholder={"contoh1@gmail.com\ncontoh2@gmail.com"}
            className="form-input w-full px-4 py-3 rounded-2xl text-xs font-mono text-foreground custom-scrollbar"
          />
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand/15 via-violet/10 to-success/15 border border-brand/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Total Terdeteksi
            </span>
            <span className="text-base font-extrabold text-brand">{emails.length} Gmail</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Estimasi ({price > 0 ? `${rupiah(price)}/akun` : "Min. 1 akun"})
            </span>
            <span className="text-lg font-black text-success">{rupiah(total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="input-password"
              className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5"
            >
              Password Akun
            </label>
            <input
              id="input-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="masukan password"
              className="form-input w-full px-4 py-3 rounded-xl text-xs text-foreground"
            />
          </div>
          <div>
            <label
              htmlFor="input-wa"
              className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5"
            >
              Nomor WhatsApp
            </label>
            <input
              id="input-wa"
              required
              value={wa}
              onChange={(e) => setWa(e.target.value)}
              placeholder="08123456789"
              className="form-input w-full px-4 py-3 rounded-xl text-xs text-foreground"
            />
          </div>
        </div>

        {error && (
          <p className="p-3 rounded-xl text-xs font-medium bg-destructive/10 text-destructive border border-destructive/30">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-3.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-brand via-violet to-pink text-primary-foreground glow-brand active:scale-95 transition disabled:opacity-60"
        >
          {busy ? "Mengirim..." : "Kirim Setoran"}
        </button>
      </form>
    </div>
  );
}
