import { useMemo, useState } from "react";
import { Copy, Share2, Users, Gift, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { rupiah } from "@/lib/format";

export function ReferralPage() {
  const { user, userDoc } = useAuth();
  const [copied, setCopied] = useState(false);
  const link = useMemo(
    () => (user ? `${window.location.origin}/?ref=${user.uid}` : ""),
    [user],
  );

  function copyLink() {
    if (!link) return;
    void navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link referral disalin!");
    setTimeout(() => setCopied(false), 1500);
  }

  if (!user) {
    return (
      <div className="panel-card rounded-3xl p-8 text-center">
        <p className="text-muted-foreground">Masuk untuk melihat link referral.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-gradient-brand">Program Referral</h1>
        <p className="text-xs text-muted-foreground">Ajak teman dan dapatkan bonus dari aktivitas mereka.</p>
      </div>

      <div className="panel-card p-6 sm:p-8 rounded-3xl border-l-4 border-l-brand">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-brand-soft text-brand"><Share2 className="w-6 h-6" /></div>
          <div>
            <h2 className="font-bold text-foreground">Link Referral Kamu</h2>
            <p className="text-[10px] text-muted-foreground">Semua pendaftar melalui link ini akan tercatat.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 p-3.5 rounded-xl bg-surface/60 border border-border text-xs font-mono text-foreground break-all">
            {link}
          </div>
          <button
            onClick={copyLink}
            className="px-5 py-3 rounded-xl text-xs font-extrabold bg-brand text-primary-foreground hover:bg-brand/90 transition flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? "Tersalin" : "Salin"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="panel-card p-5 rounded-3xl border-l-4 border-l-info">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Referred</span>
          <div className="text-2xl font-black text-info flex items-center gap-2">
            <Users className="w-5 h-5" /> {userDoc?.referrals?.length || 0}
          </div>
        </div>
        <div className="panel-card p-5 rounded-3xl border-l-4 border-l-success">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Bonus Terkumpul</span>
          <div className="text-2xl font-black text-success">{rupiah(userDoc?.referrals?.reduce((sum, r) => sum + (r.bonusEarned || 0), 0) || 0)}</div>
        </div>
        <div className="panel-card p-5 rounded-3xl border-l-4 border-l-warning">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Status Bonus</span>
          <div className="text-2xl font-black text-warning flex items-center gap-2">
            <Gift className="w-5 h-5" /> {userDoc?.referralBonusGiven ? "Diberikan" : "Aktif"}
          </div>
        </div>
      </div>

      <div className="panel-card rounded-3xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Daftar Teman</h3>
        {(userDoc?.referrals?.length || 0) === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Belum ada teman yang mendaftar.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {userDoc?.referrals?.map((r) => (
              <div key={r.uid} className="flex items-center justify-between p-3.5 rounded-2xl bg-surface/60 border border-border">
                <div>
                  <p className="text-xs font-bold text-foreground">{r.name || "Pengguna"}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(r.joinedAt || 0).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="text-xs font-bold text-success">{rupiah(r.bonusEarned || 0)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
