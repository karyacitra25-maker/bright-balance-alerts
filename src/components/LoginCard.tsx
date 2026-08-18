import { useState } from "react";
import { ShieldCheck, Gift, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function LoginCard() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const invited =
    typeof window !== "undefined" && !!localStorage.getItem("pending_ref_code");

  async function handleLogin() {
    setError(null);
    setBusy(true);
    try {
      await login();
    } catch (err) {
      setError("Gagal masuk: " + (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-md mx-auto py-8 md:py-12">
      <div className="panel-card rounded-3xl p-8 space-y-6 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand via-violet to-pink" />
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-soft border border-brand/30 flex items-center justify-center text-brand">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gradient-brand">
            Masuk ke MailMX
          </h1>
          <p className="text-xs text-muted-foreground">Platform stor gmail enterprise</p>
        </div>

        {invited && (
          <p className="p-3 rounded-xl text-xs font-bold text-success bg-success-soft border border-success/30 flex items-center justify-center gap-2">
            <Gift className="w-4 h-4" /> Anda diundang via Link Referral!
          </p>
        )}

        {error && (
          <p className="p-3 rounded-xl text-xs text-destructive bg-destructive/10 border border-destructive/30 text-left">
            {error}
          </p>
        )}

        <button
          onClick={() => void handleLogin()}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 rounded-xl py-3.5 px-4 text-sm font-extrabold bg-gradient-to-r from-brand via-violet to-pink text-primary-foreground glow-brand active:scale-95 transition disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.6 6 29.6 4 24 4 16 4 9 8.4 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.4 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9 39.5 15.9 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.6 5.4C41.5 35.6 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"
            />
          </svg>
          {busy ? "Menghubungkan Google..." : "Lanjutkan dengan Google"}
        </button>

        <p className="pt-4 border-t border-border flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <Lock className="w-3 h-3" /> Encrypted Session & Auth Security
        </p>
      </div>
    </section>
  );
}
