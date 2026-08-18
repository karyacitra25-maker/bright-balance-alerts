import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Gift, Copy, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { LoginCard } from "@/components/LoginCard";
import { rupiah, formatDate } from "@/lib/format";

export const Route = createFileRoute("/referral")({
  head: () => ({
    meta: [
      { title: "Program Referral — MailMX" },
      {
        name: "description",
        content:
          "Ajak teman lewat link referral MailMX dan dapatkan bonus otomatis saat mereka menyetor gmail.",
      },
      { property: "og:title", content: "Program Referral — MailMX" },
      {
        property: "og:description",
        content: "Bagikan link referral MailMX dan dapatkan bonus dari setiap teman yang bergabung.",
      },
    ],
  }),
  component: ReferralPage,
});

function ReferralPage() {
  const { user, loading, userDoc } = useAuth();
  const [copied, setCopied] = useState(false);

  if (loading) {
    return <p className="text-center text-xs text-muted-foreground py-20">Memuat sesi...</p>;
  }
  if (!user) return <LoginCard />;

  const link =
    typeof window !== "undefined" ? `${window.location.origin}/?ref=${user.uid}` : `/?ref=${user.uid}`;
  const referrals = userDoc?.referrals || [];
  const bonusTotal = referrals.reduce((s, r) => s + (r.bonusEarned || 0), 0);

  function copy() {
    void navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success("Link referral disalin!");
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="panel-card rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-violet/20 via-transparent to-pink/15 border-violet/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-11 h-11 rounded-2xl bg-violet-soft border border-violet/40 flex items-center justify-center text-violet">
            <Gift className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-lg font-black tracking-tight">Program Referral</h1>
            <p className="text-xs text-muted-foreground">
              Bonus Rp 1.000 setiap teman menyelesaikan setoran pertama.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            readOnly
            value={link}
            aria-label="Link referral kamu"
            className="form-input flex-1 px-4 py-3 rounded-xl text-xs font-mono text-foreground"
          />
          <button
            onClick={copy}
            className="px-5 py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-violet to-pink text-primary-foreground glow-violet active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" /> {copied ? "Tersalin" : "Salin"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="p-4 rounded-2xl bg-surface/60 border border-border">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Teman Bergabung
            </p>
            <p className="text-xl font-black text-violet mt-1">{referrals.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface/60 border border-border">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Total Bonus
            </p>
            <p className="text-xl font-black text-success mt-1">{rupiah(bonusTotal)}</p>
          </div>
        </div>
      </div>

      <div className="panel-card rounded-3xl p-6">
        <h2 className="font-bold text-sm flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-pink" /> Daftar Teman Referral
        </h2>
        <div className="space-y-3">
          {referrals.length === 0 && (
            <p className="p-6 text-center text-xs text-muted-foreground italic">
              Belum ada teman yang mendaftar lewat link kamu.
            </p>
          )}
          {referrals.map((r, i) => (
            <div
              key={`${r.uid || i}`}
              className="p-4 rounded-2xl bg-surface/60 border border-border flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{r.name || r.email}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {r.email} · {formatDate(r.joinedAt)}
                </p>
              </div>
              <span
                className={`text-[10px] px-2.5 py-1 rounded-full border font-bold shrink-0 ${
                  r.bonusGiven
                    ? "text-success bg-success-soft border-success/30"
                    : "text-warning bg-warning-soft border-warning/30"
                }`}
              >
                {r.bonusGiven ? `+ ${rupiah(r.bonusEarned)}` : "Menunggu setoran"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
